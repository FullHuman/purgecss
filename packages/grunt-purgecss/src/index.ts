import PurgeCSS, { defaultOptions } from 'purgecss'
import { UserDefinedOptions } from 'purgecss/src/types'

function getAvailableFiles(grunt: IGrunt, files: string[] | undefined = []) {
    return files.filter(filepath => {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
            grunt.log.warn(`Source file "${filepath}" not found.`)
            return false
        }
        return true
    })
}

function gruntPurgeCSS(grunt: IGrunt) {
  grunt.registerMultiTask('purgecss', 'Grunt plugin for PurgeCSS', function() {
    const done = this.async();
    const options = this.options<UserDefinedOptions>(defaultOptions)
    for (const file of this.files) {
      const source = getAvailableFiles(grunt, file.src)
      new PurgeCSS()
        .purge({
          ...options,
          css: source
        })
        .then(purgeCSSResults => {
          grunt.file.write(file.dest!, purgeCSSResults[0].css)
          // Print a success message
          grunt.log.writeln(`File "${file.dest}" created.`)
          done()
        })
        .catch(() => { done(false) })
    }
  })
}

export default gruntPurgeCSS
