---
title: Gulp
description: "Remove unused CSS in gulp tasks with gulp-purgecss: installation, usage in a pipe and plugin options."
lang: en-US
---

# Gulp

## Installation

```sh
npm i -D gulp-purgecss
npm install --save-dev gulp-purgecss
```

## Usage

By default, `purgecss` outputs the source CSS _with unused selectors removed_:

```js
const gulp = require('gulp')
const purgecss = require('gulp-purgecss')

gulp.task('purgecss', () => {
    return gulp.src('src/**/*.css')
        .pipe(purgecss({
            content: ['src/**/*.html']
        }))
        .pipe(gulp.dest('build/css'))
})
```

By setting the `rejected` option, you can 'invert' the output to list _only the removed selectors_: 

```js
const gulp = require('gulp')
const rename = require('gulp-rename')
const purgecss = require('gulp-purgecss')

gulp.task('purgecss-rejected', () => {
    return gulp.src('src/**/*.css')
        .pipe(rename({
            suffix: '.rejected'
        }))
        .pipe(purgecss({
            content: ['src/**/*.html'],
            rejected: true
        }))
        .pipe(gulp.dest('build/css'))
})
```

## Source maps

The plugin updates the source map of the files that have one, so that it still points to the original CSS. Create the source maps with the `sourcemaps` option of gulp:

```js
const gulp = require('gulp')
const purgecss = require('gulp-purgecss')

gulp.task('purgecss', () => {
    return gulp.src('src/**/*.css', { sourcemaps: true })
        .pipe(purgecss({
            content: ['src/**/*.html']
        }))
        .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
})
```

or with [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps):

```js
const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const purgecss = require('gulp-purgecss')

gulp.task('purgecss', () => {
    return gulp.src('src/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(purgecss({
            content: ['src/**/*.html']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/css'))
})
```

## Options

The plugin accepts the [PurgeCSS options](../configuration.md), except `css`, which is replaced by the files of the stream. Some of them work differently:

- #### content

An array of paths and globs of the content files, e.g. `['src/**/*.html', 'src/**/*.js']`. They are relative to the current working directory, which the gulp CLI sets to the directory of the gulpfile. The files matching `skippedContentGlobs` are not used. When no file matches, PurgeCSS prints a warning and all the selectors are removed.

- #### rejected

When `true`, the content of each file is replaced by the list of its removed selectors, one `selector {}` per line.

- #### sourceMap

The option has no effect: the source maps are created with gulp, see [Source maps](#source-maps).

The `rejectedCss`, `output`, `stdin` and `stdout` options have no effect either.

::: tip
Each file of the stream is purged on its own. With `fontFace`, `keyframes` or `variables`, a `@font-face`, `@keyframes` or CSS variable only used by another file is removed. To keep it, concatenate the files before purging them, e.g. with [gulp-concat](https://www.npmjs.com/package/gulp-concat).
:::
