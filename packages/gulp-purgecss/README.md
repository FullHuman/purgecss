# gulp-purgecss

[![Build Status](https://travis-ci.org/FullHuman/gulp-purgecss.svg?branch=master)](https://travis-ci.org/FullHuman/gulp-purgecss)
[![CircleCi](https://circleci.com/gh/FullHuman/gulp-purgecss/tree/master.svg?style=shield)]()
[![David](https://img.shields.io/david/FullHuman/gulp-purgecss.svg)]()
[![David](https://img.shields.io/david/dev/FullHuman/gulp-purgecss.svg)]()
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f41103d5c2754ebeac6e7701a142bb17)](https://www.codacy.com/app/FullHuman/gulp-purgecss?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=FullHuman/gulp-purgecss&amp;utm_campaign=Badge_Grade)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![npm](https://img.shields.io/npm/v/gulp-purgecss.svg)](https://www.npmjs.com/package/gulp-purgecss)
[![license](https://img.shields.io/github/license/fullhuman/gulp-purgecss.svg)]() [![Greenkeeper badge](https://badges.greenkeeper.io/FullHuman/gulp-purgecss.svg)](https://greenkeeper.io/)


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

## Versioning

We use [SemVer](http://semver.org/) for versioning. 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

