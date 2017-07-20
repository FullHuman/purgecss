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

            // Output debug information through a callback pattern
            // to avoid unnecessary processing
            const output = this.options.verbose
                ? messageCb => console.info(...messageCb())
                : () => {}

            compilation.plugin('additional-assets', cb => {
                // Go through chunks and purify as configured
                compilation.chunks.forEach(
                    ({ name: chunkName, files, modules }) => {
                        console.log('chunkForEach')
                        const assetsToPurify = search
                            .assets(compilation.assets, ['.css'])
                            .filter(asset => files.indexOf(asset.name) >= 0)

                        output(() => [
                            'Assets to purify:',
                            assetsToPurify.map(({ name }) => name).join(', ')
                        ])
                        console.log(assetsToPurify)

                        assetsToPurify.forEach(({ name, asset }) => {
                            console.log('assetsToPurify')
                            const filesToSearch = parse
                                .entries(entryPaths, chunkName)
                                .concat(
                                    search.files(
                                        modules,
                                        this.options.moduleExtensions || [],
                                        file => file.resource
                                    )
                                )

                            output(() => [
                                'Files to search for used rules:',
                                filesToSearch.join(', ')
                            ])

                            // Compile through Purify and attach to output.
                            // This loses sourcemaps should there be any!
                            const purgecss = new Purgecss({
                                content: [filesToSearch],
                                css: [asset.source],
                                stdin: true,
                                info: this.options.verbose,
                                minify: this.options.minimize
                            })
                            console.log(purgecss.purge())
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
