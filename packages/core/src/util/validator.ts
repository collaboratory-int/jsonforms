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
/**
 * The Ajv module: the only one in core that imports Ajv at runtime. Only the
 * `@jsonforms/core` entry point loads it; `@jsonforms/core/core-only` does not.
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { ErrorObject, Options, ValidateFunction } from 'ajv';
import { setDefaultAjvFactory } from './ajvDefault';
import { compiledAjvValidator, FormValidatorFactory } from './formValidator';

export const createAjv = (options?: Options) => {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,
    addUsedSchema: false,
    ...options,
  });
  addFormats(ajv);
  return ajv;
};

/** Creates Form Validators backed by the given Ajv instance. */
export const createAjvValidator =
  (ajv: Ajv = createAjv()): FormValidatorFactory =>
  (schema) =>
    compiledAjvValidator(ajv.compile(schema));

// Loading this module makes Ajv the default validator.
setDefaultAjvFactory(() => createAjv());

export const validate = (
  validator: ValidateFunction | undefined,
  data: any
): ErrorObject[] => {
  if (validator === undefined) {
    return [];
  }
  const valid = validator(data);
  if (valid) {
    return [];
  }
  return validator.errors;
};
