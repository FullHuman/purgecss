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
