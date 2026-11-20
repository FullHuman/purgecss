# gulp-purgecss

[![npm](https://img.shields.io/npm/v/gulp-purgecss.svg)](https://www.npmjs.com/package/gulp-purgecss)
[![license](https://img.shields.io/github/license/fullhuman/gulp-purgecss.svg)]()


> [gulp](http://gulpjs.com/) plugin to removed unused CSS, using [purgecss](https://github.com/FullHuman/purgecss)

## Regarding Issues

This is just a simple [gulp](https://github.com/gulpjs/gulp) plugin, which means it's nothing more than a thin wrapper around `purgecss`. If it looks like you are having CSS related issues, please go to the [purgecss](https://github.com/FullHuman/purgecss/issues) repo. Only create a new issue if it looks like you're having a problem with the plugin itself.

## Install

```
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

### Source maps

The plugin updates the source map of the files that have one, so that it still points to the original CSS. Create the source maps with the `sourcemaps` option of gulp (`gulp.src('src/**/*.css', { sourcemaps: true })` and `gulp.dest('build/css', { sourcemaps: '.' })`) or with [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps). The `sourceMap` option of PurgeCSS has no effect.

### Errors

With gulp 5, an error of the plugin, e.g. for invalid CSS, is not always reported when the task is a chain of `.pipe()`: gulp may only print `Did you forget to signal async completion?` (see [gulpjs/gulp#2812](https://github.com/gulpjs/gulp/issues/2812)). Write the task with `pipeline` of Node.js, which reports the error of any of its streams:

```js
const { pipeline } = require('node:stream/promises')
const gulp = require('gulp')
const purgecss = require('gulp-purgecss')

gulp.task('purgecss', () => {
    return pipeline(
        gulp.src('src/**/*.css'),
        purgecss({
            content: ['src/**/*.html']
        }),
        gulp.dest('build/css')
    )
})
```

## Options

The plugin accepts the [PurgeCSS options](https://www.purgecss.com/configuration.html#options), except `css`, which is replaced by the files of the stream. `content` is an array of paths and globs, relative to the current working directory (the directory of the gulpfile with the gulp CLI). The `rejectedCss`, `output`, `stdin` and `stdout` options have no effect.

Each file of the stream is purged on its own: with `fontFace`, `keyframes` or `variables`, a `@font-face`, `@keyframes` or CSS variable only used by another file is removed. To keep it, concatenate the files before purging them. See the [documentation](https://www.purgecss.com/plugins/gulp.html#options).

## Versioning

We use [SemVer](http://semver.org/) for versioning. 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

