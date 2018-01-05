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
    entry: {
        bundle: './src/index.js',
        legacy: './src/legacy.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader?sourceMap'
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('[name].css?[hash]'),
        new PurgecssPlugin({
            paths: glob.sync(`${PATHS.src}/*`),
            styleExtensions: ['.css'],
            whitelist: ['whitelisted'],
            only: ['bundle'],
            extractors: [
                {
                    extractor: CustomExtractor,
                    extensions: ['html', 'js']
                }
            ]
        })
    ]
}
