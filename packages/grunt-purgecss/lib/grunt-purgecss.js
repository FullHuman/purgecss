'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Purgecss = _interopDefault(require('purgecss'));

var getAvailableFiles = function getAvailableFiles(grunt, files) {
    return files.filter(function (filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
            grunt.log.warn("Source file \"" + filepath + "\" not found.");
            return false;
        }
        return true;
    });
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var gruntPurgecss = function gruntPurgecss(grunt) {
    grunt.registerMultiTask('purgecss', 'Grunt plugin for purgecss', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({});

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {
            var src = getAvailableFiles(grunt, f.src);
            // purgecss content
            var purgecssResult = new Purgecss(_extends({}, options, {
                css: src
            })).purge()[0].css;

            // Write the destination file.
            grunt.file.write(f.dest, purgecssResult);

            // Print a success message
            grunt.log.writeln('File "' + f.dest + '" created.');
        });
    });
};

module.exports = gruntPurgecss;
