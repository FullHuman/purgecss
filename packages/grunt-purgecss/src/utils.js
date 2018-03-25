export const getAvailableFiles = (grunt, files) =>
    files.filter(filepath => {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
            grunt.log.warn(`Source file "${filepath}" not found.`)
            return false
        }
        return true
    })
