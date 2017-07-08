import { createFilter } from 'rollup-pluginutils'
import Purgecss from "purgecss"

const pluginPurgecss = function( options = {} ) {
    const filter = createFilter( options.include || ['**/*.css'], options.exclude || 'node_modules/**')

    const purgecssOptions = Object.assign(options.options, {
        css: options.include
    })
    const purgecss = new Purgecss({
        content: options.content,
        css: options.include
    })

    return {
        transform(code, id) {
            if (!filter(id)) return



            return {
                code: "" 
            }
        },
        ongenerate(opts, result) {

        }
    }
}

export default pluginPurgecss