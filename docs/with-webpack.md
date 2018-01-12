# Webpack

Start by installing the webpack plugin as a dev dependency:

```
npm i -D purgecss-webpack-plugin
```

You will need `extract-text-webpack-plugin` as well.

```
npm i -D extract-text-webpack-plugin
```

```js
const path = require('path')
const glob = require('glob')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')

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
      paths: glob.sync(`${PATHS.src}/*`)
    })
  ]
}
```

## Options

The options available in purgecss [Configuration](/configuration.md) are also avaiable in the webpack plugin with the exception of `css` and `content`.

* paths

With the webpack plugin, you can specified the content that should be analyized by purgecss with an array of filename. It can be html, pug, blade, ... files. You can use a module like `glob`  or `glob-all` to easily get a list of files.

```js
const PurgecssPlugin = require('purgecss-webpack-plugin')
const glob = require('glob')
const PATHS = {
  src: path.join(__dirname, 'src')
}

// In the webpack configuration
new PurgecssPlugin({
    paths: glob.sync(`${PATHS.src}/*`)
})
```

* only

You can specify entrypoints to the purgecss-webpack-plugin with the option `only`:

```js
new PurgecssPlugin({
  paths: glob.sync(`${PATHS.src}/*`),
  only: ['bundle', 'vendor']
})
```



