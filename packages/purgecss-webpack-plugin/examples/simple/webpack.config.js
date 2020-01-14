const path = require('path')
const glob = require('glob')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const PurgecssPlugin = require('purgecss-webpack-plugin')

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
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css"
    }),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/*`),
      styleExtensions: ['.css'],
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
