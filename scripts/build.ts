const path = require('path')
const rollup = require('rollup')
const { terser } = require('rollup-plugin-terser')
const typescript = require('rollup-plugin-typescript2')

const packagesDirectory = path.resolve(__dirname, './../packages')

const packages = [
  'postcss-purgecss',
  'purgecss',
  'purgecss-from-html',
  'purgecss-from-pug'
]

async function build() {
  const bundle = await rollup.rollup({
    input: path.resolve(packagesDirectory, `./${packages[1]}/src/index.ts`),
    plugins: [
      typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationMap: true
        },
        exclude: ['**/__tests__'],
        // declarationDir: path.resolve(packagesDirectory, packages[1], `./lib/`),
        useTsconfigDeclarationDir: true
      }
      }),
      terser()
    ]
  })

  await bundle.write({
    file: path.resolve(packagesDirectory, packages[1], `./lib/${packages[1]}.es.js`),
    format: 'es'
  })
  await bundle.write({
    file: path.resolve(packagesDirectory, packages[1], `./lib/${packages[1]}.esm.js`),
    format: 'esm'
  })
  await bundle.write({
    file: path.resolve(packagesDirectory, packages[1], `./lib/${packages[1]}.js`),
    format: 'cjs'
  })
}

build()