# with-vue-webpack

> A Vue.js project

## Created with vue-cli

This example shows how to set up Purgecss with vue-webpack template.\
Once you initialized your project with `vue init webpack`, install the webpack plugin
for purgecss:

```
npm i --save-dev glob-all purgecss-webpack-plugin
```

You need to modify the file `webpack.prod.conf.js` by adding the following code:

line 13

```js
// import Purgecss webpack plugin and glob-all
const PurgecssPlugin = require('purgecss-webpack-plugin')
const glob = require('glob-all')
```

line 58

```js
    // Remove unused CSS using purgecss. See https://github.com/FullHuman/purgecss
    // for more information about purgecss.
    new PurgecssPlugin({
      paths: glob.sync([
        path.join(__dirname, './../src/index.html'),
        path.join(__dirname, './../**/*.vue'),
        path.join(__dirname, './../src/**/*.js')
      ])
    }),
```

## Results

This example is importing the bootstrap css framework.\
Without purgecss, the css file size is **117 kB**.\
Using purgecss, the css file size is **2.98 kB**
