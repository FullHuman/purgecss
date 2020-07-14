# purgecss-webpack-plugin

[![Build Status](https://travis-ci.org/FullHuman/purgecss-webpack-plugin.svg?branch=master)](https://travis-ci.org/FullHuman/purgecss-webpack-plugin)
[![CircleCi](https://circleci.com/gh/FullHuman/purgecss-webpack-plugin/tree/master.svg?style=shield)]()
[![dependencies Status](https://david-dm.org/fullhuman/purgecss-webpack-plugin/status.svg)](https://david-dm.org/fullhuman/purgecss-webpack-plugin)
[![devDependencies Status](https://david-dm.org/fullhuman/purgecss-webpack-plugin/dev-status.svg)](https://david-dm.org/fullhuman/purgecss-webpack-plugin?type=dev)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c23bd13d30104a7a89bed239166aaf69)](https://www.codacy.com/app/FullHuman/purgecss-webpack-plugin?utm_source=github.com&utm_medium=referral&utm_content=FullHuman/purgecss-webpack-plugin&utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/c23bd13d30104a7a89bed239166aaf69)](https://www.codacy.com/app/FullHuman/purgecss-webpack-plugin?utm_source=github.com&utm_medium=referral&utm_content=FullHuman/purgecss-webpack-plugin&utm_campaign=Badge_Coverage)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![npm](https://img.shields.io/npm/v/purgecss-webpack-plugin.svg)](https://www.npmjs.com/package/purgecss-webpack-plugin)
[![license](https://img.shields.io/github/license/fullhuman/purgecss-webpack-plugin.svg)]() [![Greenkeeper badge](https://badges.greenkeeper.io/FullHuman/purgecss-webpack-plugin.svg)](https://greenkeeper.io/)

[Webpack](https://github.com/webpack/webpack) plugin to remove unused css.

## Install
```sh
npm i purgecss-webpack-plugin -D
```

## Usage

### With mini-css-extract-plugin

```js
const path = require('path')
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PurgeCSSPlugin = require('purgecss-webpack-plugin')

const PATHS = {
  src: path.join(__dirname, 'src')
}

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
    }),
  ]
}
```
### Multiple paths
If you need multiple paths use the npm package `glob-all` instead of `glob`, then you can use this syntax:
```javascript
new PurgeCSSPlugin({
  paths: glob.sync([
    // ...
  ])
}),
```
to filter out directories see the glob-all documentation [here](https://www.npmjs.com/package/glob-all#filtering-out-directories).

### Options

The options available in purgecss [Configuration](https://www.purgecss.com/configuration.html) are also available in the webpack plugin with the exception of css and content.

* #### paths

With the webpack plugin, you can specify the content that should be analyzed by purgecss with an array of filename. It can be html, pug, blade, ... files. You can use a module like `glob` or `glob-all` to easily get a list of files.

```js
const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const glob = require('glob')
const PATHS = {
  src: path.join(__dirname, 'src')
}

// In the webpack configuration
new PurgeCSSPlugin({
  paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true })
})
```

If you want to regenerate the paths list on every compilation (e.g. with `--watch`), then you can also pass a function:
```js
new PurgeCSSPlugin({
  paths: () => glob.sync(`${PATHS.src}/**/*`, { nodir: true })
})
```

* #### only

You can specify entrypoints to the purgecss-webpack-plugin with the option only:

```js
new PurgeCSSPlugin({
  paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
  only: ['bundle', 'vendor']
})
```

* #### safelist

Similar as for the `paths` option, you also can define a function for this option:

```js
function collectSafelist() {
  return {
    standard: ['safelisted', /^safelisted-/],
    deep: [/^safelisted-deep-/],
    greedy: [/^safelisted-greedy/]
  }
}

// In the webpack configuration
new PurgeCSSPlugin({
  safelist: collectSafelist
})
```

* #### rejected

If `true` all removed selectors are added to the [Stats Data](https://webpack.js.org/api/stats/) as `purged`.

## Contributing

Please read [CONTRIBUTING.md](./../../CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## License

This project is licensed under the MIT License - see the [LICENSE](./../../LICENSE) file for details
