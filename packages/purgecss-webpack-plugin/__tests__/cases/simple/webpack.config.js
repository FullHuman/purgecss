const path = require('path')
const glob = require('glob')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const PurgecssPlugin = require('../../../src/').default

class CustomExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:/]+/g)
  }
}

const PATHS = {
  src: path.join(__dirname, 'src')
}

module.exports = {
  entry: './src/index.js',
  // output: {
  //   filename: 'bundle.js',
  //   path: path.join(__dirname, 'dist')
  // },
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
    new ExtractTextPlugin('style.css'),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/*`),
      whitelist: ['whitelisted'],
      extractors: [
        {
          extractor: CustomExtractor,
          extensions: ['html', 'js']
        }
      ]
    })
  ]
}
