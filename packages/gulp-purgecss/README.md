# gulp-purgecss

[![Build Status](https://travis-ci.org/FullHuman/gulp-purgecss.svg?branch=master)](https://travis-ci.org/FullHuman/gulp-purgecss)
[![CircleCi](https://circleci.com/gh/FullHuman/gulp-purgecss/tree/master.svg?style=shield)]()
[![David](https://img.shields.io/david/FullHuman/gulp-purgecss.svg)]()
[![David](https://img.shields.io/david/dev/FullHuman/gulp-purgecss.svg)]()


> [gulp](http://gulpjs.com/) plugin to removed unused CSS, using [purgecss](https://github.com/FullHuman/purgecss)

## Regarding Issues

This is just a simple [gulp](https://github.com/gulpjs/gulp) plugin, which means it's nothing more than a thin wrapper around `purgecss`. If it looks like you are having CSS related issues, please go to the [purgecss](https://github.com/FullHuman/purgecss/issues) repo. Only create a new issue if it looks like you're having a problem with the plugin itself.

## Install

```
npm i -D gulp-purgecss
npm install --save-dev gulp-purgecss
```

## Usage

```js
const gulp = require('gulp')
const purgecss = require('gulp-purgecss')

gulp.task('purgecss', () => {
    return gulp.src('src/**/*.css')
        .pipe(purgecss({
            content: ["src/**/*.html"]
        }))
        .pipe(gulp.dest('build/css'))
})
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

