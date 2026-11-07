# purgecss-webpack-plugin

[![npm](https://img.shields.io/npm/v/purgecss-webpack-plugin.svg)](https://www.npmjs.com/package/purgecss-webpack-plugin)
[![license](https://img.shields.io/github/license/fullhuman/purgecss-webpack-plugin.svg)]()

[Webpack](https://github.com/webpack/webpack) plugin to remove unused css.

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

The webpack plugin passes the following options of the purgecss [Configuration](https://www.purgecss.com/configuration.html) to PurgeCSS: `defaultExtractor`, `extractors`, `fontFace`, `keyframes`, `variables`, `safelist`, `blocklist`, `dynamicAttributes` and `rejected`. The plugin purges the CSS assets of the compilation and uses `paths` as the content, so it doesn't take the `css` and `content` options. Source maps are generated when the webpack `devtool` option is set. Other options, such as `rejectedCss` or `skippedContentGlobs`, have no effect.

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

If you want to regenerate the paths list on every compilation (e.g. with `--watch`), then you can also pass a function:

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

If `true` all removed selectors are added to the [Stats Data](https://webpack.js.org/api/stats/) as `purged`.

## Contributing

Please read [CONTRIBUTING.md](./../../CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## License

This project is licensed under the MIT License - see the [LICENSE](./../../LICENSE) file for details
