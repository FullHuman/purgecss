# Javascript API

Start by installing Purgecss as a development dependency.

```
npm i -D purgecss
```

You can then use purgecss inside a javascript file.

In the following examples, the options passed to Purgecss are the same as the ones [here](/configuration.md). The result `purgecssResult` is an array of an object containing the name of the files with the purged css.

## ES6 with import

```js
import Purgecss from 'purgecss'
const purgeCss = new Purgecss({
  content: ['**/*.html'],
  css: ['**/*.css']
})
const purgecssResult = purgecss.purge()
```

The format of purgecssResult is

```js
[
    {
        file: 'main.css',
        css: '/* purged css for main.css */'
    },
    {
        file: 'animate.css',
        css: '/* purged css for animate.css */'
    }
]
```

## ES5 with require

```js
var Purgecss = require('purgecss').default
var purgecss = new Purgecss({
  content: ['**/*.html'],
  css: ['**/*.css']
})
var purgecssResult = purgecss.purge()
```

## 



