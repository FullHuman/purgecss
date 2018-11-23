# with Vue CLI 3

> A Vue.js project

## Created with vue-cli

This example shows how to set up Purgecss with a newly create Vue CLI 3 app.
Once you initialized your project with `vue create app-name`, install the webpack plugin for purgecss and path:

```
npm i --save-dev glob-all purgecss-webpack-plugin path
```

Based on the options you chose, you project may or may not have a `vue.config.js` file in the root directory.
If it doesn't exist, create it with the following content:

```js
const PurgecssPlugin = require('purgecss-webpack-plugin');
const glob = require('glob-all');
const path = require('path');

module.exports = {
  configureWebpack: {
    // Merged into the final Webpack config
    plugins: [
      new PurgecssPlugin({
        paths: glob.sync([
          path.join(__dirname, './src/index.html'),
          path.join(__dirname, './**/*.vue'),
          path.join(__dirname, './src/**/*.js')
        ])
      })
    ]
  }
}
```

## Results

This example is importing the bootstrap css framework.\
Without purgecss, the css file size is **117 kB**.\
Using purgecss, the css file size is **2.98 kB**
