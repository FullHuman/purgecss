# Purgecss  
[![Build Status](https://travis-ci.org/FullHuman/purgecss.svg?branch=master)](https://travis-ci.org/FullHuman/purgecss) [![CircleCi](https://circleci.com/gh/FullHuman/purgecss/tree/master.svg?style=shield)]() [![dependencies Status](https://david-dm.org/fullhuman/purgecss/status.svg)](https://david-dm.org/fullhuman/purgecss) [![devDependencies Status](https://david-dm.org/fullhuman/purgecss/dev-status.svg)](https://david-dm.org/fullhuman/purgecss?type=dev)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2f2f3fb0a5c541beab2018483e62a828)](https://www.codacy.com/app/FullHuman/purgecss?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=FullHuman/purgecss&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/2f2f3fb0a5c541beab2018483e62a828)](https://www.codacy.com/app/FullHuman/purgecss?utm_source=github.com&utm_medium=referral&utm_content=FullHuman/purgecss&utm_campaign=Badge_Coverage)


<p align="center">
	<img src="./.assets/logo.png" height="200" width="200" alt="Purgecss logo"/>
</p>


### Getting Started

#### Installation

```
npm i --save-dev purgecss
```

### Documentation

- [API](./docs/API.md)
- [Extractor](./docs/Extractor.md)

### Usage

```js
import Purgecss from "purgecss"
import purgeHtml from "purgecss-from-html"
const purgeCss = new Purgecss({
    content: ["**/*.html"],
    css: ["**/*.css"],
    extractors: [
        {
            extractor: purgeHtml,
            extensions: ["html"]
        }
    ]
})
const result = purgecss.purge()
```

#### Build Plugin

<div align="center">
	<a href="https://github.com/webpack/webpack">
    	<img width="200" heigth="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  	</a>
	<a href="https://github.com/FullHuman/gulp-purgecss">
    	<img height="200" width="89" src="https://raw.githubusercontent.com/gulpjs/artwork/master/gulp-2x.png">
  	</a>
  	<a href="https://github.com/FullHuman/rollup-plugin-purgecss">
  		<img height="200" width="200" src="https://rollupjs.org/logo.svg"/>
	</a>
</div>

##### Gulp

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

##### Webpack

> In progress

##### Rollup

```js
import { rollup } from 'rollup';
import purgecss from 'rollup-plugin-purgecss';

rollup({
    entry: 'main.js',
    plugins: [
        purgecss({
            content: ["index.html"]
        })
    ]
});
```

## Contributing

Please read [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details


## Troubleshooting

#### Wrong extractor is selected

The extractors needs to be defined from the more specific to the less specific. Meaning that you need to define `js` extractor after `ejs`. So the `js` extractor will not be selected for ejs files.
> You can specified extensions like `.es.js`.

#### Some unused css are not removed

If you are using the default or legacy extractor, look here.
Head over the repository of the extractor and open an issue.
Be as precise as possible when describing the issue, provide the
css file and content file if possible.

