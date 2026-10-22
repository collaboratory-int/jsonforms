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
import { Actions, coreReducer, createAjv } from '../src';

/*
 * The `@jsonforms/core` entry point keeps Ajv as the default validator, as
 * before `@jsonforms/core/core-only` existed.
 */

const schema = {
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
  required: ['name'],
};

test('creates a default Ajv instance and validates with it', (t) => {
  const state = coreReducer(undefined, Actions.init({}, schema));
  t.truthy(state.ajv);
  t.is(state.errors.length, 1);
  t.is(state.errors[0].keyword, 'required');
});

test('still exports the Ajv helpers', (t) => {
  t.is(typeof createAjv, 'function');
  t.truthy(createAjv().compile(schema));
});
