---
title: Vue | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Vue with the webpack plugin.
  - name: keywords
    content: PurgeCSS Vue.js Vue webpack plugin
---

# Vue

## Created with vue-cli

This example shows how to set up PurgeCSS with vue-webpack template.  
Once you initialized your project with `vue init webpack`, install the webpack plugin for PurgeCSS:

```text
npm i --save-dev glob-all purgecss-webpack-plugin
```

You need to modify the file `webpack.prod.conf.js` by adding the following code:

```javascript
// import PurgeCSS webpack plugin and glob-all
const PurgecssPlugin = require('purgecss-webpack-plugin')
const glob = require('glob-all')
```

```javascript
    // Remove unused CSS using PurgeCSS. See https://github.com/FullHuman/purgecss
    // for more information about PurgeCSS.
    new PurgecssPlugin({
      paths: glob.sync([
        path.join(__dirname, './../src/index.html'),
        path.join(__dirname, './../**/*.vue'),
        path.join(__dirname, './../src/**/*.js')
      ])
    }),
```
