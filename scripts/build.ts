const path = require('path')
const rollup = require('rollup')
const { terser } = require('rollup-plugin-terser')
const typescript = require('@wessberg/rollup-plugin-ts')

const packagesDirectory = path.resolve(__dirname, './../packages')

const packages = [
  {
    name: 'postcss-purgecss',
    external: ['postcss', 'purgecss']
  },
  {
    name: 'purgecss',
    external: ['postcss', 'postcss-selector-parser', 'glob', 'path', 'fs']
  },
  // {
  //   name: 'purgecss-from-blade',
  //   external: ['@tarik02/bladejs-compiler']
  // },
  {
    name: 'purgecss-from-html',
    external: ['parse5', 'parse5-htmlparser2-tree-adapter']
  },
  {
    name: 'purgecss-from-pug',
    external: ['pug-lexer']
  },
  {
    name: 'purgecss-webpack-plugin',
    external: ['fs', 'purgecss', 'webpack', 'webpack-sources']
  }
]

async function build() {
  for (const package of packages) {
    const bundle = await rollup.rollup({
      input: path.resolve(packagesDirectory, `./${package.name}/src/index.ts`),
      plugins: [
        typescript({}),
        terser()
      ],
      external: package.external
    })
    
    await bundle.write({
      file: path.resolve(packagesDirectory, package.name, `./lib/${package.name}.esm.js`),
      format: 'esm'
    })
    await bundle.write({
      file: path.resolve(packagesDirectory, package.name, `./lib/${package.name}.js`),
      format: 'cjs'
    })
  }
}

(async() => {
  try {
    await build()
  } catch(e) {
    console.error(e)
  }
})()