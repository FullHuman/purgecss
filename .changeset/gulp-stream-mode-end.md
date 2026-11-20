---
"gulp-purgecss": patch
---

Fix stream mode with gulp 5 (`gulp.src(glob, { buffer: false })`). The purged CSS was written, but its stream never ended, so `gulp.dest` never finished and gulp reported "The following tasks did not complete". The plugin piped the contents it had already read into the purged stream, and the streamx streams of gulp 5 do not end the destination when they are piped after they have ended.
