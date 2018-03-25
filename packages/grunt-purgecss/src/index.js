import Purgecss from 'purgecss'
import { getAvailableFiles } from './utils'

const gruntPurgecss = grunt => {
    grunt.registerMultiTask('purgecss', 'Grunt plugin for purgecss', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({})

        // Iterate over all specified file groups.
        this.files.forEach(f => {
            const src = getAvailableFiles(grunt, f.src)
            // purgecss content
            const purgecssResult = new Purgecss({
                ...options,
                css: src
            }).purge()[0].css

            // Write the destination file.
            grunt.file.write(f.dest, purgecssResult)

            // Print a success message
            grunt.log.writeln(`File "${f.dest}" created.`)
        })
    })
}

export default gruntPurgecss
