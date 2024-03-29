import { PurgeCSS, defaultOptions, UserDefinedOptions } from "purgecss";

function getAvailableFiles(
  grunt: IGrunt,
  files: string[] | undefined = [],
): string[] {
  return files.filter((filepath) => {
    // Warn on and remove invalid source files (if nonull was set).
    if (!grunt.file.exists(filepath)) {
      grunt.log.warn(`Source file "${filepath}" not found.`);
      return false;
    }
    return true;
  });
}

function gruntPurgeCSS(grunt: IGrunt): void {
  grunt.registerMultiTask("purgecss", "Grunt plugin for PurgeCSS", function () {
    const done = this.async();
    const options = this.options<UserDefinedOptions>(defaultOptions);
    const promisedPurgedFiles = [];
    for (const file of this.files) {
      const source = getAvailableFiles(grunt, file.src);
      const purgedCss = new PurgeCSS()
        .purge({
          ...options,
          css: source,
        })
        .then((purgeCSSResults) => {
          if (typeof file.dest === "undefined") {
            throw new Error(`Destination file not found`);
          }

          grunt.file.write(file.dest, purgeCSSResults[0].css);
          // Print a success message
          grunt.log.writeln(`File "${file.dest}" created.`);
        });

      promisedPurgedFiles.push(purgedCss);
    }
    Promise.all(promisedPurgedFiles)
      .then(() => {
        done();
      })
      .catch(() => done(false));
  });
}

export default gruntPurgeCSS;
