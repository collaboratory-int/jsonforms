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
import type Ajv from 'ajv';

/**
 * Where core gets its default Ajv instance from. The Ajv module
 * (`./validator`) registers itself here when it is loaded, which the
 * `@jsonforms/core` entry point always does. The `@jsonforms/core/core-only`
 * entry point never loads it, so neither Ajv nor ajv-formats end up in a
 * bundle that only imports from there.
 */
let defaultAjvFactory: (() => Ajv) | undefined;

export const setDefaultAjvFactory = (
  factory: (() => Ajv) | undefined
): void => {
  defaultAjvFactory = factory;
};

/** A new default Ajv instance, or `undefined` when Ajv is not loaded. */
export const createDefaultAjv = (): Ajv | undefined => defaultAjvFactory?.();
