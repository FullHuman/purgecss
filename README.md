# PurgeCSS

![Travis (.org)](https://img.shields.io/travis/FullHuman/purgecss?label=Travis&style=for-the-badge)
![CircleCI](https://img.shields.io/circleci/build/github/FullHuman/purgecss?label=Circleci&style=for-the-badge)
![David](https://img.shields.io/david/FullHuman/purgecss?style=for-the-badge)
![David](https://img.shields.io/david/dev/FullHuman/purgecss?style=for-the-badge)
![Dependabot](https://img.shields.io/badge/dependabot-enabled-%23024ea4?style=for-the-badge)
![npm](https://img.shields.io/npm/v/purgecss?style=for-the-badge)
![npm](https://img.shields.io/npm/dw/purgecss?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/FullHuman/purgecss?style=for-the-badge)
![Codacy grade](https://img.shields.io/codacy/grade/2f2f3fb0a5c541beab2018483e62a828?style=for-the-badge)
![Codacy coverage](https://img.shields.io/codacy/coverage/2f2f3fb0a5c541beab2018483e62a828?style=for-the-badge)

<p align="center">
	<img src="https://i.imgur.com/UEiUiJ0.png" height="200" width="200" alt="PurgeCSS logo"/>
</p>

## What is PurgeCSS?

When you are building a website, chances are that you are using a css framework like Bootstrap, Materializecss, Foundation, etc... But you will only use a small set of the framework and a lot of unused css styles will be included.

This is where PurgeCSS comes into play. PurgeCSS analyzes your content and your css files. Then it matches the selectors used in your files with the one in your content files. It removes unused selectors from your css, resulting in smaller css files.

## Documentation

You can find the PurgeCSS documentation on [this website](https://purgecss.com).

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
