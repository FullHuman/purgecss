import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/gulpPurgecss.es.js',
      format: 'es'
    },
    {
      file: 'lib/gulpPurgecss.js',
      format: 'cjs'
    }
  ],
  plugins: [resolve(), commonjs(), babel()],
  external: ['through2', 'plugin-error', 'purgecss', 'glob']
}
