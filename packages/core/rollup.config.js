import typescript from 'rollup-plugin-typescript2';
import cleanup from 'rollup-plugin-cleanup';
import { visualizer } from 'rollup-plugin-visualizer';

const packageJson = require('./package.json');

// Two entry points sharing one copy of core: `@jsonforms/core` (index) and
// `@jsonforms/core/core-only`, which never loads Ajv. Shared code goes into a
// common chunk, so a bundle importing both still holds core once.
const entryFileNames = (format) => (chunk) =>
  chunk.name === 'index'
    ? `jsonforms-core.${format}.js`
    : `jsonforms-${chunk.name}.${format}.js`;

const baseConfig = {
  input: {
    index: 'src/index.ts',
    'core-only': 'src/core-only.ts',
  },
  external: [...Object.keys(packageJson.dependencies), /^lodash\/.*/],
};

export default [
  {
    ...baseConfig,
    output: {
      dir: 'lib',
      entryFileNames: entryFileNames('esm'),
      chunkFileNames: 'jsonforms-core-shared.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      typescript(),
      cleanup({ extensions: ['js', 'ts', 'jsx', 'tsx'] }),
      visualizer({ open: false }),
    ],
  },
  {
    ...baseConfig,
    output: {
      dir: 'lib',
      entryFileNames: entryFileNames('cjs'),
      chunkFileNames: 'jsonforms-core-shared.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            target: 'ES5',
          },
        },
      }),
      cleanup({ extensions: ['js', 'ts', 'jsx', 'tsx'] }),
    ],
  },
];
