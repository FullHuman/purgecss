module.exports = grunt => {

  grunt.initConfig({
    purgecss: {
      options: {
        content: ['./src/**/*.html']
      },
      my_target: {
        files: {
          './dist/app.purged.css': ['./src/app.css']
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-purgecss')
  grunt.registerTask('default', ['purgecss']);

}