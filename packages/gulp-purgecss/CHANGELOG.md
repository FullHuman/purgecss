# gulp-purgecss

## 9.1.0

### Patch Changes

- Updated dependencies [e0f3dd4]
  - purgecss@9.1.0

## 9.0.0

### Major Changes

- 0497a89: Update through2 to v5. through2 is now an ES module, so the CommonJS build of `gulp-purgecss` requires a Node.js version that supports `require()` of ES modules (20.19, 22.12 or later). A file that fails to purge now ends the stream with a `gulp-purgecss` plugin error, instead of emitting the error and leaving the stream waiting for the file.
- 145e717: Require Node.js 22.12 or later. Every package now declares `"engines": { "node": ">=22.12.0" }`, the version the `purgecss` command line already requires since the update to commander 15.

### Patch Changes

- 35d9802: Fix gulp-sourcemaps support. When a file had a source map, the plugin emitted a `Cannot read properties of undefined (reading 'hasOwnProperty')` error because PurgeCSS generated an inline source map. The plugin now generates a separate source map for the purged CSS and chains it with the source map of the file.
- Updated dependencies [3c14e5f]
- Updated dependencies [75c7e49]
- Updated dependencies [414eafc]
- Updated dependencies [86bfcb7]
- Updated dependencies [04bd732]
- Updated dependencies [51673cf]
- Updated dependencies [ae265ec]
- Updated dependencies [f81eae3]
- Updated dependencies [59d91c3]
- Updated dependencies [ca58bf0]
- Updated dependencies [bc4cf02]
- Updated dependencies [32444a1]
- Updated dependencies [b7c74dc]
- Updated dependencies [cdb1e10]
- Updated dependencies [25c4bea]
- Updated dependencies [2b3fd7b]
- Updated dependencies [9cbf249]
- Updated dependencies [145e717]
- Updated dependencies [8426d2c]
- Updated dependencies [3015636]
- Updated dependencies [e224150]
- Updated dependencies [4a5d71d]
  - purgecss@9.0.0
