# React

> React is a JavaScript library for building user interfaces. Create React App is a comfortable environment for learning React, and is the best way to start building a new single-page application in React.

This guide assumes you are using create-react-app to build your single-page react application.


## Use `craco`

Custom PostCSS plugins (including PurgeCSS) can be added to Create React App apps using [craco](https://github.com/gsoft-inc/craco/). Follow the [craco installation instructions](https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#installation), then install the `PurgeCSS` PostCSS plugin and add it to the craco config:

```sh
npm i --save-dev @fullhuman/postcss-purgecss
```

```js
// craco.config.js
const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  style: {
    postcss: {
      plugins: [
        purgecss({
          content: ['./src/**/*.html', './src/**/*.tsx', './src/**/*.ts'],
        }),
      ],
    },
  },
};

```

## Run PurgeCSS CLI in `postbuild`

Add the following code in **package.json**

```json
"scripts": {
  "postbuild": "purgecss --css build/static/css/*.css --content build/static/index.html build/static/js/*.js --out build/static/css"
},
```

## `eject` create-react-app 

You need to [eject](https://facebook.github.io/create-react-app/docs/available-scripts#npm-run-eject) in order to expose the webpack configuration offered by original create-react-app

Install the webpack plugin for PurgeCSS:

```sh
npm i --save-dev glob-all purgecss-webpack-plugin
```

Now, modify the file `config/webpack.prod.conf.js` by adding the following code with the rest of the imports:


```js
// import PurgeCSS webpack plugin and glob-all
const PurgecssPlugin = require('purgecss-webpack-plugin')
const glob = require('glob-all')
```

...and directly before `new ManifestPlugin(...)` in the plugins list, add this:

```js
    // Remove unused css with PurgeCSS. See https://github.com/FullHuman/purgecss
    // for more information about PurgeCSS.
    // Specify the path of the html files and source files
    new PurgecssPlugin({
      paths: [paths.appHtml, ...glob.sync(`${paths.appSrc}/*`)]
    }),
```
