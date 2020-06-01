const path = require('path');
const rollup = require('rollup');
const { babel, getBabelOutputPlugin } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { unlinkAll } = require('../utils');

const config = {
  input: 'src/main.ts',
  plugins: [
    nodeResolve({
      extensions: ['.ts', '.js'],
      browser: true,
      mainFields: ['browser', 'jsnext', 'main'],
    }),
    babel({
      extensions: ['.ts', '.js'],
      exclude: 'node_modules/**',
      configFile: path.resolve(__dirname, 'babel.config.js'),
    }),
    commonjs({
      extensions: ['.ts', '.js'],
    }),
  ],
};

unlinkAll('dist/bundle.js');
createBundle();

async function createBundle() {
  console.log('createBundle');
  try {
    const result = await rollup.rollup(config);
    // console.log('result', result);
    result.write({
      output: {
        file: 'debug/bundle.js',
        format: 'es',
      },
    });
  } catch (error) {
    console.log('error', error);
  }
}
