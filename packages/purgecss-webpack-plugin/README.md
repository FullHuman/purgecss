# purgecss-webpack-plugin

[![npm](https://img.shields.io/npm/v/purgecss-webpack-plugin.svg)](https://www.npmjs.com/package/purgecss-webpack-plugin)
[![license](https://img.shields.io/github/license/fullhuman/purgecss-webpack-plugin.svg)]()

[webpack](https://github.com/webpack/webpack) and [Rspack](https://rspack.rs) plugin to remove unused css.

## Install

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

### With Rspack

The plugin works with Rspack as well, without webpack installed: it uses the classes of the bundler running it, and its TypeScript declarations do not depend on webpack. Use it with `CssExtractRspackPlugin`, or with the native CSS support of Rspack (`type: "css/auto"`). The tests run with Rspack 2. With Rspack 1, the used classes of [CSS modules](#css-modules) are kept from Rspack 1.1 on with `CssExtractRspackPlugin`, and from Rspack 1.3 on with the native CSS support; with older versions, the CSS modules are purged as in purgecss-webpack-plugin 9.0, which removes their hashed class names.

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

Next.js 16 builds with Turbopack by default, which does not run webpack plugins. Build with webpack to use the plugin: `next build --webpack` (and `next dev --webpack`), with the plugin added in the `webpack` function of `next.config.js`.

### How the CSS is purged

The plugin purges the CSS assets of the chunks at the `PROCESS_ASSETS_STAGE_ADDITIONAL` stage of the `processAssets` hook, the stage of the deprecated `additionalAssets` hook it used before. Plugins that derive assets from the CSS at a later stage (e.g. a right-to-left copy at `PROCESS_ASSETS_STAGE_DERIVED`) read the purged CSS, and the CSS is purged before CSS minimizers (`PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE`), source map extraction and content hashing.

The content files of `paths` are read and their selectors extracted once per compilation, for all the CSS assets. In watch mode (`--watch`, webpack-dev-server, `rspack dev`), the content files are watched: a change to one of them triggers a new compilation, even if it is not imported by the JavaScript code, and only the files that changed since the previous compilation are read and extracted again. The directories are not watched: when `paths` is a function, a new file is part of the content from the next compilation on, once something else triggered it. A content file that does not exist is reported as an error of the compilation, and the compilation runs again once the file is created.

The watcher of the bundler applies its own options to the content files. When a content file is a symbolic link, e.g. a file of a workspace package linked in `node_modules`, the plugin watches its target as well, as the watchers do not follow symbolic links by default (`watchOptions.followSymlinks`). Rspack ignores the changes to the files of `node_modules` by default (`watchOptions.ignored`), the content files included.

With webpack-dev-server, the CSS is purged again when only a content file outside the module graph changed (e.g. an HTML template), but the hash of the compilation is the same, so webpack-dev-server does not tell the browser: reload the page to see the new CSS. With Rspack, the hash changes.

When the webpack `devtool` option generates source maps, the source maps of the purged CSS keep pointing to the original CSS files.

### CSS modules

The class names of [CSS modules](https://github.com/css-modules/css-modules) are hashed (`.modUsed` becomes `.card-module__modUsed--VlNeS`), while the content uses the name of the export (`styles.modUsed`). The plugin reads the export map of each CSS module of the purged chunks and keeps the hashed class names whose export name is found in the content, along with the classes they compose. The other classes of the CSS modules are removed, like unused global classes.

The export maps are read from:

- the JavaScript module that mini-css-extract-plugin or `CssExtractRspackPlugin` generates for a CSS module (`css-loader` with `modules`), with a default export or named exports;
- the JavaScript code generated by the native CSS support of Rspack (`type: "css/auto"`). In production, with `optimization.usedExports`, Rspack only generates the exports used by the JavaScript code, possibly under mangled names: they are all kept;
- the exports of the native CSS support of webpack 5.97 or later (`experiments.css` with `type: "css/auto"`). With older versions, used classes of the CSS modules may be removed.

An export name is found in the content when the extractor yields it as a selector, as the default extractor does for `styles.modUsed`, or when it is a word of a selector: an extractor that yields `styles.modUsed` as one selector, such as the extractor of Tailwind CSS, keeps the classes of `modUsed` too.

The JavaScript assets of the chunks are not added to the content: they list every export of the CSS modules, used or not, and they contain the code of the dependencies, whose words would keep unused global classes.

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

### Configuration file

The plugin also reads the options of `purgecss.config.js` if this file is in the working directory. The options passed to the plugin take precedence, `safelist` included. `content` and `css` are not used, the content comes from `paths`. A `purgecss.config.js` that fails to load fails the build. See the [documentation](https://www.purgecss.com/plugins/webpack.html#configuration-file).

### Options

The webpack plugin passes the following options of the purgecss [Configuration](https://www.purgecss.com/configuration.html) to PurgeCSS: `defaultExtractor`, `extractors`, `fontFace`, `keyframes`, `variables`, `safelist`, `blocklist`, `dynamicAttributes` and `rejected`. The plugin purges the CSS assets of the compilation and uses `paths` as the content, so it doesn't take the `css` and `content` options. Source maps are generated when the webpack `devtool` option is set, and keep the original CSS files as their sources. Other options, such as `rejectedCss` or `skippedContentGlobs`, have no effect.

- #### paths

With the webpack plugin, you can specify the content that should be analyzed by purgecss with an array of filename. It can be html, pug, blade, ... files. You can use a module like `glob` or `glob-all` to easily get a list of files.

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

If you want to regenerate the paths list on every compilation (e.g. with `--watch`), then you can also pass a function. The files that did not change since the previous compilation are not read again:

```js
new PurgeCSSPlugin({
  paths: () => glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
});
```

- #### only

You can specify entrypoints to the purgecss-webpack-plugin with the option only:

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

## Contributing

Please read [CONTRIBUTING.md](./../../CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## License

This project is licensed under the MIT License - see the [LICENSE](./../../LICENSE) file for details
