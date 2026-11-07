---
title: Webpack
description: "Remove unused CSS from webpack and Rspack builds with purgecss-webpack-plugin: installation, configuration, CSS modules, watch mode and plugin options."
lang: en-US
---

# Webpack

:::tip
You can use either the Webpack plugin directly in your webpack configuration or use the [PostCSS plugin](postcss.md) when you are using the Webpack postCSS loader.
:::

The plugin works with webpack 5 and, since 9.1.0, with Rspack 1 and 2.

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

### With Rspack

Since 9.1.0, the plugin works with Rspack without webpack installed: it uses the classes of the compiler running it (`compiler.webpack`), and its TypeScript declarations do not depend on webpack. `webpack` and `@rspack/core` are optional peer dependencies. Use it with `CssExtractRspackPlugin`, or with the native CSS support of Rspack (`type: "css/auto"`).

```js
const path = require("path");
const glob = require("glob");
const { rspack } = require("@rspack/core");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [rspack.CssExtractRspackPlugin.loader, "css-loader"],
        type: "javascript/auto",
      },
    ],
  },
  plugins: [
    new rspack.CssExtractRspackPlugin(),
    new PurgeCSSPlugin({
      paths: glob.sync(`${path.join(__dirname, "src")}/**/*`, { nodir: true }),
    }),
  ],
};
```

### With Next.js

Next.js 16 builds with Turbopack by default, which does not run webpack plugins. Build with webpack to use the plugin: `next build --webpack` (and `next dev --webpack`), with the plugin added in the `webpack` function of `next.config.js`. To purge the CSS under Turbopack, use the [PostCSS plugin](postcss.md#turbopack-next-js) instead.

## How the CSS is purged

The plugin purges the CSS assets of the chunks in the `processAssets` hook, at the `PROCESS_ASSETS_STAGE_ADDITIONAL` stage. Plugins that derive assets from the CSS at a later stage read the purged CSS, and the CSS is purged before the CSS minimizers (`PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE`), source map extraction and content hashing.

Since 9.1.0, the content files of `paths` are read and their selectors extracted once per compilation, for all the CSS assets, instead of once per asset.

When the `devtool` option generates source maps, the source maps of the purged CSS point to the original CSS files.

### Watch mode

In watch mode (`--watch`, webpack-dev-server, `rspack dev`), the content files are watched since 9.1.0: a change to one of them triggers a new compilation, even if it is not imported by the JavaScript code, and only the files that changed since the previous compilation are read and extracted again. The directories are not watched: when `paths` is a function, a new file is part of the content from the next compilation on, once something else triggered it. A content file that does not exist is reported as an error of the compilation, and the compilation runs again once the file is created.

The watcher of the bundler applies its own options to the content files. When a content file is a symbolic link, e.g. a file of a workspace package linked in `node_modules`, the plugin watches its target as well. Rspack ignores the changes to the files of `node_modules` by default (`watchOptions.ignored`), the content files included.

::: tip
With webpack-dev-server, when only a content file outside the module graph changed (e.g. an HTML template), the CSS is purged again but the hash of the compilation is the same, so webpack-dev-server does not tell the browser: reload the page to see the new CSS. With Rspack, the hash changes.
:::

## CSS modules

The class names of [CSS modules](https://github.com/css-modules/css-modules) are hashed (`.modUsed` becomes `.card-module__modUsed--VlNeS`), while the content uses the name of the export (`styles.modUsed`). Since 9.1.0, the plugin reads the export map of each CSS module of the purged chunks and keeps the hashed class names whose export name is found in the content, along with the classes they compose. The other classes of the CSS modules are removed, like unused global classes. Before 9.1.0, every hashed class was removed.

The export maps are read from:

- the JavaScript module that mini-css-extract-plugin or `CssExtractRspackPlugin` (Rspack 1.1 or later) generates for a CSS module (`css-loader` with `modules`);
- the JavaScript code generated by the native CSS support of Rspack 1.3 or later (`type: "css/auto"`). In production, with `optimization.usedExports`, Rspack only generates the exports used by the JavaScript code: they are all kept;
- the exports of the native CSS support of webpack 5.97 or later (`experiments.css` with `type: "css/auto"`). With older versions, used classes of the CSS modules may be removed.

An export name is found in the content when the extractor yields it as a selector, as the default extractor does for `styles.modUsed`, or when it is a word of a selector: an extractor that yields `styles.modUsed` as one selector, such as the extractor of Tailwind CSS, keeps the classes of `modUsed` too. The JavaScript assets of the chunks are not added to the content, as they list every export of the CSS modules, used or not.

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

The webpack plugin passes the following options of the purgecss [Configuration](https://www.purgecss.com/configuration.html) to PurgeCSS: `defaultExtractor`, `extractors`, `fontFace`, `keyframes`, `variables`, `safelist`, `blocklist`, `dynamicAttributes` and `rejected`. The plugin purges the CSS assets of the compilation and uses `paths` as the content, so it doesn't take the `css` and `content` options. Source maps are generated when the webpack `devtool` option is set, and keep the original CSS files as their sources. Other options, such as `rejectedCss` or `skippedContentGlobs`, have no effect.

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

If you want to regenerate the list of paths on every compilation (e.g. when using `--watch`), then you can also pass a function to the `paths` option as in the following example. The files that did not change since the previous compilation are not read again:

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

If `true`, the removed selectors of each CSS asset are stored in the `purgedStats` property of the plugin instance, an object whose keys are the names of the assets. They are not added to the [Stats Data](https://webpack.js.org/api/stats/) of webpack.

```js
const purgeCSSPlugin = new PurgeCSSPlugin({ paths, rejected: true });
// after the compilation
console.log(purgeCSSPlugin.purgedStats["main.css"]);
```
