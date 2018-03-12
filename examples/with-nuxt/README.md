# with-nuxt

> Nuxt.js project

## Created with nuxtjs starter template

This example shows how to set up Purgecss with nuxtjs starter template.
Once you initialzed your project with
```
vue init nuxt-community/starter-template <project-name>
```
install the webpack plugin for purgecss:
```
npm i --save-dev glob-all purgecss-webpack-plugin
```

You need to modify the file `nuxt.config.js` by adding he following code:

line 1

```js
const PurgecssPlugin = require('purgecss-webpack-plugin')
const glob = require('glob-all')
const path = require('path')
```

line 44

```js
if (!isDev) {
  // Remove unused CSS using purgecss. See https://github.com/FullHuman/purgecss
  // for more information about purgecss.
  config.plugins.push(
    new PurgecssPlugin({
      paths: glob.sync([
        path.join(__dirname, './pages/**/*.vue'),
        path.join(__dirname, './layouts/**/*.vue'),
        path.join(__dirname, './components/**/*.vue')
      ]),
      whitelist: ['html', 'body']
    })
  )
}
```

## Results

This example is importing the tachyons css framework.\
Without purgecss, the css file size is **88.2 kB**.\
Using purgecss, the css file is **1.56 kB**