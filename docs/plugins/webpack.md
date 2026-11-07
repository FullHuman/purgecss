---
title: Webpack
description: "Remove unused CSS from webpack builds with purgecss-webpack-plugin: installation, webpack configuration and plugin options."
lang: en-US
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
const path = require("path");
const glob = require("glob");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");

const PATHS = {
  src: path.join(__dirname, "src"),
};

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "dist"),
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          test: /\.css$/,
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
    }),
  ],
};
```

### Multiple paths

If you need multiple paths use the npm package `glob-all` instead of `glob`, then you can use this syntax:

```js
new PurgeCSSPlugin({
  paths: glob.sync([
    // ...
  ])
}),
```

to filter out directories see the glob-all documentation [here](https://www.npmjs.com/package/glob-all#filtering-out-directories).

## Configuration file

The plugin also reads the options of `purgecss.config.js` if this file is in the working directory, the folder where you run webpack. The options passed to the plugin take precedence over the ones in the config file, `safelist` included: a `safelist` in the plugin options replaces the one in `purgecss.config.js`. As with the plugin options, `content` and `css` are not used, the content comes from `paths`.

```js
// purgecss.config.js
module.exports = {
  safelist: ['active', /^modal-/]
}
```

If `purgecss.config.js` exists but fails to load, for example because of a syntax error, the build fails with `Error loading the config file ...`.

::: warning
Up to version 8.0.0, options exported with `module.exports = { ... }` or `export default { ... }` are ignored, and so is a config file that fails to load.
:::

## Options

The webpack plugin passes the following options of the purgecss [Configuration](https://www.purgecss.com/configuration.html) to PurgeCSS: `defaultExtractor`, `extractors`, `fontFace`, `keyframes`, `variables`, `safelist`, `blocklist`, `dynamicAttributes` and `rejected`. The plugin purges the CSS assets of the compilation and uses `paths` as the content, so it doesn't take the `css` and `content` options. Source maps are generated when the webpack `devtool` option is set. Other options, such as `rejectedCss` or `skippedContentGlobs`, have no effect.

- #### paths

With the webpack plugin, you can specify the content that should be analyzed by purgecss by providing an array of filenames. These can be html, pug, blade, ... files. You can also use a module like `glob` or `glob-all` to easily get a list of files.

> You likely need to pass `{ nodir: true }` as an option to `glob.sync()` as `glob.sync` is matching a dir which the plugin can't operate on.

```js
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const glob = require("glob");
const PATHS = {
  src: path.join(__dirname, "src"),
};

// In the webpack configuration
new PurgeCSSPlugin({
  paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
});
```

If you want to regenerate the list of paths on every compilation (e.g. when using `--watch`), then you can also pass a function to the `paths` option as in the following example:

```js
new PurgeCSSPlugin({
  paths: () => glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
});
```

- #### only

You can specify chunk names to the purgecss-webpack-plugin with the option `only`:

```js
new PurgeCSSPlugin({
  paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
  only: ["bundle", "vendor"],
});
```

The names are compared with the chunk names (for an entrypoint, its key in `entry`), not with the file names.

- #### safelist

Similar as for the `paths` option, you also can define a function for this option:

```js
function collectSafelist() {
  return {
    standard: ["safelisted", /^safelisted-/],
    deep: [/^safelisted-deep-/],
    greedy: [/^safelisted-greedy/],
  };
}

// In the webpack configuration
new PurgeCSSPlugin({
  safelist: collectSafelist,
});
```

- #### rejected

When this option is set to `true` all removed selectors are added to the [Stats Data](https://webpack.js.org/api/stats/) as `purged`.
