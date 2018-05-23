const path = require('path')
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
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
    mode: 'development',
    entry: './src/index.js',
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
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new PurgecssPlugin({
            paths: () => glob.sync(`${PATHS.src}/*`),
            whitelist: () => ['whitelisted'],
            whitelistPatterns: () => [/^whitelistedPat/],
            extractors: [
                {
                    extractor: CustomExtractor,
                    extensions: ['html', 'js']
                }
            ]
        })
    ]
}
