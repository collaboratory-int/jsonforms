/*
  The MIT License
  
  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import test from 'ava';

// Core has no Node typings; the test runs in Node under ts-node.
declare const require: (id: string) => any;

/*
 * `@jsonforms/core/core-only` must never load Ajv. Requiring `ajv` or
 * `ajv-formats` throws in this file, so any runtime import of either from the
 * entry point's module graph fails every test below. Ava runs each test file
 * in its own worker, so the main entry point (which loads Ajv) is not loaded
 * here.
 */
const moduleLoader: {
  _load: (request: string, ...rest: unknown[]) => unknown;
} = require('module');
const load = moduleLoader._load;
moduleLoader._load = (request, ...rest) => {
  if (request === 'ajv' || request === 'ajv-formats') {
    throw new Error(`'${request}' was loaded by @jsonforms/core/core-only`);
  }
  return load(request, ...rest);
};

const loadCore = () => import('../src/core-only');

const schema = {
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
  required: ['name'],
};

test('loads without Ajv and leaves out the Ajv helpers', async (t) => {
  const core = await loadCore();
  t.is(typeof core.coreReducer, 'function');
  t.is(typeof core.Actions.init, 'function');
  t.false('createAjv' in core);
  t.false('createAjvValidator' in core);
  t.false('validate' in core);
});

test('validates with a Form Validator factory, without an Ajv instance', async (t) => {
  const { Actions, coreReducer } = await loadCore();
  const validator = () => ({
    validate: (data: any) =>
      data?.name ? [] : [{ path: '/name', key: 'required', message: 'needed' }],
  });
  const state = coreReducer(
    undefined,
    Actions.init({}, schema, undefined, { validator })
  );
  t.is(state.ajv, undefined);
  t.is(state.errors.length, 1);
  t.is(state.errors[0].keyword, 'required');
  t.deepEqual(state.errors[0].params, { missingProperty: 'name' });

  const updated = coreReducer(
    state,
    Actions.update('name', () => 'Ada')
  );
  t.deepEqual(updated.errors, []);
});

test('uses an Ajv instance passed in the options', async (t) => {
  const { Actions, coreReducer } = await loadCore();
  const compiled: any = () => false;
  compiled.errors = [
    {
      instancePath: '',
      keyword: 'required',
      params: { missingProperty: 'name' },
    },
  ];
  const ajv: any = { compile: () => compiled };
  const state = coreReducer(
    undefined,
    Actions.init({}, schema, undefined, { ajv })
  );
  t.is(state.ajv, ajv);
  t.is(state.errors.length, 1);
});

test('runs without validation in NoValidation mode', async (t) => {
  const { Actions, coreReducer } = await loadCore();
  const state = coreReducer(
    undefined,
    Actions.init({}, schema, undefined, { validationMode: 'NoValidation' })
  );
  t.is(state.ajv, undefined);
  t.is(state.validator, undefined);
  t.deepEqual(state.errors, []);
});

test('throws a clear error when there is nothing to validate with', async (t) => {
  const { Actions, coreReducer } = await loadCore();
  const error = t.throws(() =>
    coreReducer(undefined, Actions.init({}, schema))
  );
  t.regex(error.message, /@jsonforms\/core\/core-only/);
  t.regex(error.message, /validator/);
});

test('evaluates schema-based rules without Ajv', async (t) => {
  const { isVisible, RuleEffect } = await loadCore();
  const uischema: any = {
    type: 'Control',
    scope: '#/properties/name',
    rule: {
      effect: RuleEffect.SHOW,
      condition: { scope: '#/properties/kind', schema: { const: 'other' } },
    },
  };
  t.true(
    isVisible(uischema, { kind: 'other' }, undefined, undefined, undefined)
  );
  t.false(
    isVisible(uischema, { kind: 'none' }, undefined, undefined, undefined)
  );
});
