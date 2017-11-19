# Purgecss  
[![Build Status](https://travis-ci.org/FullHuman/purgecss.svg?branch=master)](https://travis-ci.org/FullHuman/purgecss) [![CircleCi](https://circleci.com/gh/FullHuman/purgecss/tree/master.svg?style=shield)]() [![dependencies Status](https://david-dm.org/fullhuman/purgecss/status.svg)](https://david-dm.org/fullhuman/purgecss) [![devDependencies Status](https://david-dm.org/fullhuman/purgecss/dev-status.svg)](https://david-dm.org/fullhuman/purgecss?type=dev)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2f2f3fb0a5c541beab2018483e62a828)](https://www.codacy.com/app/FullHuman/purgecss?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=FullHuman/purgecss&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/2f2f3fb0a5c541beab2018483e62a828)](https://www.codacy.com/app/FullHuman/purgecss?utm_source=github.com&utm_medium=referral&utm_content=FullHuman/purgecss&utm_campaign=Badge_Coverage)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![license](https://img.shields.io/github/license/fullhuman/purgecss.svg)]()


<p align="center">
	<img src="./.assets/logo.png" height="200" width="200" alt="Purgecss logo"/>
</p>


- [What is purgecss?](#what-is-purgecss)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Build plugin](#build-plugin)
- [CLI](#cli)
- [Differences with](#differences-with)
- [Contributing](#contributing)


## What is purgecss?

Purgecss is a tool inspired by Purifycss to remove unused css. Originally thought as the v2 of purifycss,
purgecss has for goal to act in a similar way while correcting the known ploblems of purifycss. If you want
to know more about the differences between purifycss and purgecss, go to the section [Differences with](#differences-with).  
When you are building a website, chances are that you are using a css framework. Bootstrap, Materializecss, Foundation are
some of the big css framework that you can include to your website, but you will only use a small set of the framework and
a lot of unused css styles will be included.  
This is where Purgecss comes into play. Purgecss takes your content and your css and matches the selectors used in your files
with the one in your content files. It removes every unused selectors from your css files, resulting in smaller, optimize css
files.

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
import purgeHtml from "purge-from-html"
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
	<a href="https://github.com/FullHuman/purgecss-webpack-plugin">
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


```js
const path = require('path')
const glob = require('glob')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const PurgecssPlugin = require('../../')

const PATHS = {
    src: path.join(__dirname, 'src')
}

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader?sourceMap'
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('[name].css?[hash]'),
        new PurgecssPlugin({
            paths: glob.sync(`${PATHS.src}/*`),
            styleExtensions: ['.css']
        })
    ]
}
```

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

#### CLI

```
purgecss --css <css> --content <content> [option]

Options:
  --con, --content  glob of content files                                [array]
  -c, --config      configuration file                                  [string]
  -o, --out         Filepath directory to write purified css files to   [string]
  -w, --whitelist   List of classes that should not be removed
                                                           [array] [default: []]
  -h, --help        Show help                                          [boolean]
  -v, --version     Show version number                                [boolean]
```


### Extractor

Purgecss can be adapted to suit your need. If you want to purify exclusively html file, you might want
to consider the _purge-from-html_ extractor.  
Purgecss relies on extractors to get the list of selector used in a file.
There are multiples types of files that can contains selectors such as html files, templating files like pug, or even javascript file.

#### Using an extractor

You can use an extractor by settings the extractors option in the purgecss config file.
```js
import purgeJs from "purgecss-from-js"
import purgeHtml from "purge-from-html"

const options = {
    content: [],// files to extract the selectors from
    css: [],// css
    extractors: [
        {
            extractor: purgeJs,
            extensions: ["js"]
        },
        {
            extractor: purgeHtml,
            extensions: ["html"]
        }
    ]
}
export default options
```

#### Default extractor

Purgecss provides a default extractor that is working with all types of files but can be limited and not fit exactly the type of files that you are using.  
The default extractor considers every word of a file as a selector.
The default extractor has a few limitations:
- Do not consider special characters such as `@`. 

#### Legacy extractor

The legacy extractor reproduces the behavior of _purifycss_. You can use the Legacy extractor by setting the option `legacy: true`.
The legacy extractor has a few limitations:
- Do not extract uppercase selector
- Do not extract numbers

#### Create an extractor

An extractor is a simple class with one method. The method `extract` takes the content of a file as a string and return an array of selectors.
By convention, the name of the npm package is `purge-from-[typefile]` (e.g. purge-from-pug). You can look at the list of extractor on npm by searching `purge-from`.

```js

class PurgeFromJs {
    static extract(content) {
        // return array of css selectors
    }
}

```


### Differences with

#### Purifycss

The biggest flaw with purifycss is its lack of modularity. It is also is biggest benefit, purifycss can work with any files,
not just html or javascript. But purifycss works by looking at all the words in the files and comparing them with the selectors
in the css. Every words is consider a selector, which means that a lot of selectors can be consider used because you have the
selector name in a paragraph or somewhere in your files.

Purgecss fixes this problem by providing the possibility to create an _extractor_, an extractor is a function that takes the content
of a file and extract the list of css selectors in it. It allows a perfect removal of unused css. The extractor can used a parser
that returns an ast and then looks through it to select the css selectors. That is the way `purge-from-html` works.
You can specified which selectors you want to use for each types of files, and so, get the most accurate results.
You can still use the default or the legacy extractor that will act the same way as purifycss.

#### Uncss

As indicated in its Readme, Uncss works the following way:
1. The HTML files are loaded by jsdom and JavaScript is executed.
2. All the stylesheets are parsed by PostCSS.
3. document.querySelector filters out selectors that are not found in the HTML files.
4. The remaining rules are converted back to CSS.

Because of the emulation of html, and the execution of javascript, uncss is effective at removing unused selectors from web application.
But the emulation can have a cost in term of performance and practicality. Uncss works by emulating the html files. To remove unused css
from pug template files, you will need to convert pug to html and then emulate the page inside jsdom and uncss will run `document.querySelector`
on each selectors and step 4.  
Uncss by its design is probably the most accurate tool to remove css out of a web application at this moment.  

Purgecss does not have an extractor right now for javascript files. But because of its modularity, developers can create an extractor for specific
framework (vue, react, aurelia) and files (pug, ejs) and get the most accurate result without the need of emulation.


## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

Purgecss use [SemVer](http://semver.org/) for versioning. 

## Acknowledgment

Purgecss was originally thought as the v2 of purifycss. And because of it, it is greatly inspired by it.  
The plugins such as purgecss-webpack-plugin are based on the purifycss plugin.   
Below is the list of the purifycss repositories:  
- [purifycss](https://github.com/purifycss/purifycss)
- [gulp-purifycss](https://github.com/purifycss/gulp-purifycss)
- [purifycss-webpack](https://github.com/webpack-contrib/purifycss-webpack)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Troubleshooting

#### Wrong extractor is selected

The extractors needs to be defined from the more specific to the less specific. Meaning that you need to define `js` extractor after `ejs`. So the `js` extractor will not be selected for ejs files.
> You can specified extensions like `.es.js`.

#### Some unused css are not removed

If you are using the default or legacy extractor, look here.
Head over the repository of the extractor and open an issue.
Be as precise as possible when describing the issue, provide the
css file and content file if possible.

