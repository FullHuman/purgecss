import fs from 'fs'
import Purgecss from 'purgecss'
import { ConcatSource } from 'webpack-sources'
import * as parse from './parse'
import * as search from './search'

let webpackVersion = 4

const styleExtensions = ['.css', '.scss', '.styl', '.sass', '.less']
const pluginName = 'PurgeCSS'
const purgedStats = {}

export default class PurgecssPlugin {
    constructor(options) {
        this.options = options
    }

    apply(compiler) {
        if (typeof compiler.hooks === 'undefined') {
            webpackVersion = 3
        }

        if (webpackVersion === 4) {
            compiler.hooks.compilation.tap(pluginName, compilation => {
                this.initializePlugin(compilation)
            })
            compiler.hooks.done.tapAsync(pluginName, (stats, cb) => {
                this.addStats(stats)
                cb()
            })
        } else {
            compiler.plugin('this-compilation', compilation => {
                this.initializePlugin(compilation)
            })
            compiler.plugin('done', stats => {
                this.addStats(stats)
            })
        }
    }

    addStats(stats) {
        if (this.options.rejected) {
            stats.purged = purgedStats
        }
    }

    initializePlugin(compilation) {
        const entryPaths = parse.entryPaths(this.options.paths)

        parse.flatten(entryPaths).forEach(p => {
            if (!fs.existsSync(p)) throw new Error(`Path ${p} does not exist.`)
        })

        if (webpackVersion === 4) {
            compilation.hooks.additionalAssets.tap(pluginName, () => {
                this.runPluginHook(compilation, entryPaths)
            })
        } else {
            compilation.plugin('additional-assets', callback => {
                this.runPluginHook(compilation, entryPaths, callback)
            })
        }
    }

    runPluginHook(compilation, entryPaths, callback = () => {}) {
        const assetsFromCompilation = search.assets(compilation.assets, ['.css'])
        // Go through chunks and purge as configured

        compilation.chunks.forEach(chunk => {
            const { name: chunkName, files } = chunk
            const assetsToPurge = assetsFromCompilation.filter(asset => {
                if (this.options.only) {
                    return [].concat(this.options.only).some(only => asset.name.indexOf(only) >= 0)
                } else {
                    return files.indexOf(asset.name) >= 0
                }
            })

            assetsToPurge.forEach(({ name, asset }) => {
                const filesToSearch = parse
                    .entries(entryPaths, chunkName)
                    .concat(
                        search.files(
                            chunk,
                            this.options.moduleExtensions || [],
                            file => file.resource,
                            webpackVersion
                        )
                    )
                    .filter(v => {
                        for (let ext of styleExtensions) {
                            if (v.endsWith(ext)) return false
                        }
                        return true
                    })

                // Compile through Purgecss and attach to output.
                // This loses sourcemaps should there be any!
                const options = {
                    ...this.options,
                    content: filesToSearch,
                    css: [
                        {
                            raw: asset.source()
                        }
                    ]
                }
                if (typeof options.whitelist === 'function') {
                    options.whitelist = options.whitelist()
                }
                if (typeof options.whitelistPatterns === 'function') {
                    options.whitelistPatterns = options.whitelistPatterns()
                }
                if (typeof options.whitelistPatternsChildren === 'function') {
                    options.whitelistPatternsChildren = options.whitelistPatternsChildren()
                }

                const purgecss = new Purgecss(options)
                const purged = purgecss.purge()[0]

                if (purged.rejected) {
                    purgedStats[name] = purged.rejected
                }

                compilation.assets[name] = new ConcatSource(purged.css)
            })
        })

        callback()
    }
}
