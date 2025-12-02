# PurgeCSS

[![npm](https://img.shields.io/npm/v/purgecss?style=for-the-badge)](https://www.npmjs.com/package/purgecss)
![npm](https://img.shields.io/npm/dm/purgecss?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/FullHuman/purgecss?style=for-the-badge)
![Dependabot](https://img.shields.io/badge/dependabot-enabled-%23024ea4?style=for-the-badge)

<p align="center">
	<img src="https://i.imgur.com/UEiUiJ0.png" height="200" width="200" alt="PurgeCSS logo"/>
</p>

## What is PurgeCSS?

When you are building a website, chances are that you are using a css framework like Bootstrap, Materializecss, Foundation, etc... But you will only use a small set of the framework and a lot of unused css styles will be included.

This is where PurgeCSS comes into play. PurgeCSS analyzes your content and your css files. Then it matches the selectors used in your css files with the ones in your content files. It removes unused selectors from your css, resulting in smaller css files.

## Sponsors 🥰

[<img src="https://avatars.githubusercontent.com/u/133211198?v=4" height="85" style="margin-right: 10px">](https://www.bairesdev.com/sponsoring-open-source-projects/)

## Documentation

You can find the PurgeCSS documentation on [this website](https://purgecss.com).

### Table of Contents

#### PurgeCSS

- [Configuration](https://purgecss.com/configuration.html)
- [Command Line Interface](https://purgecss.com/CLI.html)
- [Programmatic API](https://purgecss.com/api.html)
- [Safelisting](https://purgecss.com/safelisting.html)
- [Extractors](https://purgecss.com/extractors.html)
- [Comparison](https://purgecss.com/comparison.html)

#### Plugins

- [PostCSS](https://purgecss.com/plugins/postcss.html)
- [Webpack](https://purgecss.com/plugins/webpack.html)
- [Gulp](https://purgecss.com/plugins/gulp.html)
- [Grunt](https://purgecss.com/plugins/grunt.html)
- [Gatsby](https://purgecss.com/plugins/gatsby.html)

#### Guides

- [Vue.js](https://purgecss.com/guides/vue.html)
- [Nuxt.js](https://purgecss.com/guides/nuxt.html)
- [React.js](https://purgecss.com/guides/react.html)
- [Next.js](https://purgecss.com/guides/next.html)
- [Razzle](https://purgecss.com/guides/razzle.html)
- [Hugo](https://purgecss.com/guides/hugo.html)

## Getting Started

#### Installation

```sh
npm install purgecss --save-dev
```

## Usage

```js
import { PurgeCSS } from "purgecss";
const purgeCSSResults = await new PurgeCSS().purge({
  content: ["**/*.html"],
  css: ["**/*.css"],
});
```

## Packages

This repository is a monorepo that we manage using [Lerna](https://github.com/lerna/lerna). That means that we actually publish [several packages](/packages) to npm from the same codebase, including:

| Package                                                      | Version                                                                                     | Description                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [purgecss](/packages/purgecss)                               | ![npm](https://img.shields.io/npm/v/purgecss?style=flat-square)                             | The core of PurgeCSS                       |
| [postcss-purgecss](/packages/postcss-purgecss)               | ![npm (scoped)](https://img.shields.io/npm/v/@fullhuman/postcss-purgecss?style=flat-square) | PostCSS plugin for PurgeCSS                |
| [purgecss-webpack-plugin](/packages/purgecss-webpack-plugin) | ![npm](https://img.shields.io/npm/v/purgecss-webpack-plugin?style=flat-square)              | Webpack plugin for PurgeCSS                |
| [gulp-purgecss](/packages/gulp-purgecss)                     | ![npm](https://img.shields.io/npm/v/gulp-purgecss?style=flat-square)                        | Gulp plugin for PurgeCSS                   |
| [grunt-purgecss](/packages/grunt-purgecss)                   | ![npm](https://img.shields.io/npm/v/grunt-purgecss?style=flat-square)                       | Grunt plugin for PurgeCSS                  |
| [rollup-plugin-purgecss](/packages/rollup-plugin-purgecss)   | ![npm](https://img.shields.io/npm/v/rollup-plugin-purgecss?style=flat-square)               | Rollup plugin for PurgeCSS                 |
| [purgecss-from-html](/packages/purgecss-from-html)           | ![npm](https://img.shields.io/npm/v/purgecss-from-html?style=flat-square)                   | Html extractor for PurgeCSS                |
| [purgecss-from-pug](/packages/purgecss-from-pug)             | ![npm](https://img.shields.io/npm/v/purgecss-from-pug?style=flat-square)                    | Pug extractor for PurgeCSS                 |
| [purgecss-with-wordpress](/packages/purgecss-with-wordpress) | ![npm](https://img.shields.io/npm/v/purgecss-with-wordpress?style=flat-square)              | Collection of safelist items for WordPress |
| [vue-cli-plugin-purgecss](/packages/vue-cli-plugin-purgecss) | ![npm](https://img.shields.io/npm/v/@fullhuman/vue-cli-plugin-purgecss?style=flat-square)   | Vue CLI Plugin for PurgeCSS                |
