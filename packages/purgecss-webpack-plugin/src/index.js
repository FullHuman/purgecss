import fs from 'fs'
import Purgecss from 'purgecss'
import { ConcatSource } from 'webpack-sources'
import * as parse from './parse'
import * as search from './search'

export default class PurgecssPlugin {
    constructor(options) {
        this.options = options
    }

    apply(compiler) {
        compiler.plugin('this-compilation', compilation => {
            const entryPaths = parse.entryPaths(this.options.paths)

            parse.flatten(entryPaths).forEach(p => {
                if (!fs.existsSync(p))
                    throw new Error(`Path ${p} does not exist.`)
            })

            compilation.plugin('additional-assets', cb => {
                // Go through chunks and purge as configured
                compilation.chunks.forEach(
                    ({ name: chunkName, files, modules }) => {
                        const assetsToPurge = search
                            .assets(compilation.assets, ['.css'])
                            .filter(asset => files.indexOf(asset.name) >= 0)

                        assetsToPurge.forEach(({ name, asset }) => {
                            const filesToSearch = parse
                                .entries(entryPaths, chunkName)
                                .concat(
                                    search.files(
                                        modules,
                                        this.options.moduleExtensions || [],
                                        file => file.resource
                                    )
                                )
                                .filter(v => !v.endsWith('.css'))

                            // Compile through Purgecss and attach to output.
                            // This loses sourcemaps should there be any!
                            const purgecss = new Purgecss({
                                content: filesToSearch,
                                css: [asset.source()],
                                stdin: true
                            })
                            compilation.assets[name] = new ConcatSource(
                                purgecss.purge()[0].css
                            )
                        })
                    }
                )

                cb()
            })
        })
    }
}
