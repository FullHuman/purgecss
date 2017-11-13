import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: './src/index.js',
  output: [
    {
      file: './lib/purgecss-webpack-plugin.es.js',
      format: 'es'
    },
    {
      file: './lib/purgecss-webpack-plugin.js',
      format: 'cjs'
    }
  ],
  plugins: [resolve(), babel(), commonjs()],
  external: ['purgecss', 'webpack-sources', 'fs', 'path']
}
