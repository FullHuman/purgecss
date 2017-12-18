# purgecss-webpack-plugin

[![Build Status](https://travis-ci.org/FullHuman/purgecss-webpack-plugin.svg?branch=master)](https://travis-ci.org/FullHuman/purgecss-webpack-plugin)
[![CircleCi](https://circleci.com/gh/FullHuman/purgecss-webpack-plugin/tree/master.svg?style=shield)]()
[![dependencies Status](https://david-dm.org/fullhuman/purgecss-webpack-plugin/status.svg)](https://david-dm.org/fullhuman/purgecss-webpack-plugin)
[![devDependencies Status](https://david-dm.org/fullhuman/purgecss-webpack-plugin/dev-status.svg)](https://david-dm.org/fullhuman/purgecss-webpack-plugin?type=dev)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c23bd13d30104a7a89bed239166aaf69)](https://www.codacy.com/app/FullHuman/purgecss-webpack-plugin?utm_source=github.com&utm_medium=referral&utm_content=FullHuman/purgecss-webpack-plugin&utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/c23bd13d30104a7a89bed239166aaf69)](https://www.codacy.com/app/FullHuman/purgecss-webpack-plugin?utm_source=github.com&utm_medium=referral&utm_content=FullHuman/purgecss-webpack-plugin&utm_campaign=Badge_Coverage)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![npm](https://img.shields.io/npm/v/purgecss-webpack-plugin.svg)](https://www.npmjs.com/package/purgecss-webpack-plugin)
[![license](https://img.shields.io/github/license/fullhuman/purgecss-webpack-plugin.svg)]()

[Webpack](https://github.com/webpack/webpack) plugin to remove unused css.

## Install

```sh
npm i purgecss-webpack-plugin -D
```

## Usage

```js
const path = require('path')
const glob = require('glob')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')

const PATHS = {
  src: path.join(__dirname, 'src')
}

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader?sourceMap'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css?[hash]'),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/*`)
    })
  ]
}
```

you can also limit plugin to certain entrypoints via `only` param:

```
new PurgecssPlugin({
  paths: glob.sync(`${PATHS.src}/*`),
  styleExtensions: ['.css'],
  only: ['bundle', 'vendor']
})
```

## Contributing

Please read [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Acknowledgment

Purgecss was originally thought as the v2 of purifycss. And because of it, it is greatly inspired by it.
The plugins such as purgecss-webpack-plugin are based on the purifycss plugin.
Below is the list of the purifycss repositories:

* [purifycss](https://github.com/purifycss/purifycss)
* [gulp-purifycss](https://github.com/purifycss/gulp-purifycss)
* [purifycss-webpack](https://github.com/webpack-contrib/purifycss-webpack)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
