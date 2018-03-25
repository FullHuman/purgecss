module.exports = grunt => {

  // Project configuration.
  grunt.initConfig({
    // Configuration to be run (and then tested).
    purgecss: {
      simple: {
        options: {
          content: ['./__tests__/fixtures/src/simple/**/*.html']
        },
        files: {
          '__tests__/tmp/simple.css': ['__tests__/fixtures/src/simple/simple.css']
        }
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['purgecss']);

};