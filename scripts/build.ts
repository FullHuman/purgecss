const path = require('path')
const rollup = require('rollup')
const { terser } = require('rollup-plugin-terser')
const typescript = require('@wessberg/rollup-plugin-ts')

const packagesDirectory = path.resolve(__dirname, './../packages')

const packages = [
  {
    name: 'purgecss',
    external: [
      'postcss',
      'postcss-selector-parser',
      'glob',
      'path',
      'fs',
      'util'
    ]
  },
  {
    name: 'postcss-purgecss',
    external: ['postcss', 'purgecss']
  },
  {
    name: 'purgecss-webpack-plugin',
    external: ['fs', 'path', 'purgecss', 'webpack', 'webpack-sources']
  },
  {
    name: 'gulp-purgecss',
    external: ['through2', 'plugin-error', 'purgecss', 'glob']
  },
  {
    name: 'purgecss-from-html',
    external: ['parse5', 'parse5-htmlparser2-tree-adapter']
  },
  {
    name: 'purgecss-from-pug',
    external: ['pug-lexer']
  }
]

async function build() {
  for (const pkg of packages) {
    const bundle = await rollup.rollup({
      input: path.resolve(packagesDirectory, `./${pkg.name}/src/index.ts`),
      plugins: [typescript({}), terser()],
      external: pkg.external
    })

    await bundle.write({
      file: path.resolve(
        packagesDirectory,
        pkg.name,
        `./lib/${pkg.name}.esm.js`
      ),
      format: 'esm'
    })

    await bundle.write({
      file: path.resolve(packagesDirectory, pkg.name, `./lib/${pkg.name}.js`),
      format: 'cjs'
    })
  }

  // grunt plugin
  const gruntBundle = await rollup.rollup({
    input: path.resolve(packagesDirectory, './grunt-purgecss/src/index.ts'),
    plugins: [typescript({}), terser()],
    external: ['purgecss']
  })
  await gruntBundle.write({
    file: path.resolve(packagesDirectory, 'grunt-purgecss', './tasks/purgecss.js'),
    format: 'cjs'
  })
}

;(async () => {
  try {
    await build()
  } catch (e) {
    console.error(e)
  }
})()
