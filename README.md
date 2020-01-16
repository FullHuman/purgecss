# PurgeCSS

![David](https://img.shields.io/david/FullHuman/purgecss?style=for-the-badge)
![David](https://img.shields.io/david/dev/FullHuman/purgecss?style=for-the-badge)
![Dependabot](https://img.shields.io/badge/dependabot-enabled-%23024ea4?style=for-the-badge)
![npm](https://img.shields.io/npm/v/purgecss?style=for-the-badge)
![npm](https://img.shields.io/npm/dw/purgecss?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/FullHuman/purgecss?style=for-the-badge)

<p align="center">
	<img src="https://i.imgur.com/UEiUiJ0.png" height="200" width="200" alt="PurgeCSS logo"/>
</p>

## What is PurgeCSS?

When you are building a website, chances are that you are using a css framework like Bootstrap, Materializecss, Foundation, etc... But you will only use a small set of the framework and a lot of unused css styles will be included.

This is where PurgeCSS comes into play. PurgeCSS analyzes your content and your css files. Then it matches the selectors used in your files with the one in your content files. It removes unused selectors from your css, resulting in smaller css files.

## Version 1

If you are looking for [PurgeCSS 1](https://github.com/FullHuman/purgecss/tree/v1), the documentation is [here](https://purgecss.com)

## Documentation

You can find the PurgeCSS documentation on [this website](https://purgecss.full-human.com).

### Table of Contents

#### PurgeCSS

- [Configuration](https://purgecss.full-human.com/configuration.html)
- [Command Line Interface](https://purgecss.full-human.com/CLI.html)
- [Programmatic API](https://purgecss.full-human.com/api.html)
- [Whitelisting](https://purgecss.full-human.com/whitelisting.html)
- [Extractors](https://purgecss.full-human.com/extractors.html)
- [Comparison](https://purgecss.full-human.com/comparison.html)

#### Plugins

- [PostCSS](https://purgecss.full-human.com/plugins/postcss.html)
- [Webpack](https://purgecss.full-human.com/plugins/webpack.html)
- [Gulp](https://purgecss.full-human.com/plugins/gulp.html)
- [Grunt](https://purgecss.full-human.com/plugins/grunt.html)
- [Gatsby](https://purgecss.full-human.com/plugins/gatsby.html)

#### Guides

- [Vue.js](https://purgecss.full-human.com/guides/vue.html)
- [Nuxt.js](https://purgecss.full-human.com/guides/nuxt.html)
- [React.js](https://purgecss.full-human.com/guides/react.html)
- [Next.js](https://purgecss.full-human.com/guides/next.html)
- [Razzle](https://purgecss.full-human.com/guides/razzle.html)

## Getting Started

#### Installation

```
npm i --save-dev purgecss
```

## Usage

```js
import PurgeCSS from 'purgecss'
const purgeCSSResults = await new Purgecss().purge({
  content: ['**/*.html'],
  css: ['**/*.css']
})
```

## Packages

This repository is a monorepo that we manage using [Lerna](https://github.com/lerna/lerna). That means that we actually publish [several packages](/packages) to npm from the same codebase, including:

| Package                                                      | Version | Description                                 |
| ------------------------------------------------------------ | ------- | ------------------------------------------- |
| [purgecss](/packages/purgecss)                               |         | The core of PurgeCSS                        |
| [postcss-purgecss](/packages/postcss-purgecss)               |         | PostCSS plugin for PurgeCSS                 |
| [purgecss-webpack-plugin](/packages/purgecss-webpack-plugin) |         | Webpack plugin for PurgeCSS                 |
| [gulp-purgecss](/packages/gulp-purgecss)                     |         | Gulp plugin for PurgeCSS                    |
| [grunt-purgecss](/packages/grunt-purgecss)                   |         | Grunt plugin for PurgeCSS                   |
| [purgecss-from-html](/packages/purgecss-from-html)           |         | Html extractor for PurgeCSS                 |
| [purgecss-from-js](/packages/purgecss-from-js)               |         | Js extractor for PurgeCSS                   |
| [purgecss-from-pug](/packages/purgecss-from-pug)             |         | Pug extractor for PurgeCSS                  |
| [purgecss-with-wordpress](/packages/purgecss-with-wordpress) |         | Collection of whitelist items for WordPress |
