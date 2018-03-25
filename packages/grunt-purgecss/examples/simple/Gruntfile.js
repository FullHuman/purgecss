module.exports = grunt => {

  grunt.initConfig({
    purgecss: {
      options: {
        content: ['./src/**/*.html']
      },
      my_target: {
        files: {
          './app.purged.css': './src/app.css'
        }
      }
    }
  })

  grunt.loadTasks('./../../lib')
  grunt.registerTask('default', ['purgecss']);

}