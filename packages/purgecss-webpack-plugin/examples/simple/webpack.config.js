const path = require('path')
const glob = require('glob')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const PurgecssPlugin = require('../../')

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
                // use: ['style-loader', 'css-loader']
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
            paths: glob.sync(`${PATHS.src}/*`),
            styleExtensions: ['.css']
        })
    ]
}
