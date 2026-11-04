---
"gulp-purgecss": patch
---

Fix gulp-sourcemaps support. When a file had a source map, the plugin emitted a `Cannot read properties of undefined (reading 'hasOwnProperty')` error because PurgeCSS generated an inline source map. The plugin now generates a separate source map for the purged CSS and chains it with the source map of the file.
