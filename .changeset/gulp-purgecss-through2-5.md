---
"gulp-purgecss": major
---

Update through2 to v5. through2 is now an ES module, so the CommonJS build of `gulp-purgecss` requires a Node.js version that supports `require()` of ES modules (20.19, 22.12 or later). A file that fails to purge now ends the stream with a `gulp-purgecss` plugin error, instead of emitting the error and leaving the stream waiting for the file.
