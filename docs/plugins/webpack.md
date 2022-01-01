---
title: Webpack | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use it with webpack with a plugin.
  - itemprop: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use it with webpack with a plugin.
  - property: og:url
    content:  https://purgecss.com/plugins/webpack
  - property: og:site_name
    content: purgecss.com
  - property: og:type
    content: website
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: en_US
  - property: og:title
    content: Remove unused CSS - PurgeCSS
  - property: og:description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use it with webpack with a plugin.
---

# Webpack

:::tip
You can use either the Webpack plugin directly in your webpack configuration or use the [PostCSS plugin](postcss.md) when you are using the Webpack postCSS loader.
:::

## Installation

```sh
npm i purgecss-webpack-plugin -D
```

## Usage

### With mini-css-extract-plugin

```js
const path = require('path')
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
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
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
    }),
  ]
}
```
### Multiple paths
If you need multiple paths use the npm package `glob-all` instead of `glob`, then you can use this syntax:

```js
new PurgecssPlugin({
  paths: glob.sync([
    // ...
  ])
}),
```
to filter out directories see the glob-all documentation [here](https://www.npmjs.com/package/glob-all#filtering-out-directories).

## Options

The options available in purgecss [Configuration](https://www.purgecss.com/configuration.html) are also available in the webpack plugin, with the exception of the `css` and `content` options.

* #### paths

With the webpack plugin, you can specify the content that should be analyzed by purgecss by providing an array of filenames. These can be html, pug, blade, ... files. You can also use a module like `glob` or `glob-all` to easily get a list of files.

> You likely need to pass `{ noDir: true }` as an option to `glob.sync()` as `glob.sync` is matching a dir which the plugin can't operate on.

```js
const PurgecssPlugin = require('purgecss-webpack-plugin')
const glob = require('glob')
const PATHS = {
  src: path.join(__dirname, 'src')
}

// In the webpack configuration
new PurgecssPlugin({
  paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true })
})
```

If you want to regenerate the list of paths on every compilation (e.g. when using `--watch`), then you can also pass a function to the `paths` option as in the following example:

```js
new PurgecssPlugin({
  paths: () => glob.sync(`${PATHS.src}/**/*`, { nodir: true })
})
```

* #### only

You can specify entrypoints to the purgecss-webpack-plugin with the option `only`:

```js
new PurgecssPlugin({
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

When this option is set to `true` all removed selectors are added to the [Stats Data](https://webpack.js.org/api/stats/) as `purged`.
