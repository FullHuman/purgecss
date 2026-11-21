---
"gulp-purgecss": patch
---

Warn when no file matches the `content` option with buffered files (gulp's default), as with streamed files and the other PurgeCSS integrations. The plugin resolved the globs itself and passed PurgeCSS an empty list, so a wrong path silently removed every selector without the `No files found from the passed PurgeCSS option 'content'.` warning. The `content` globs and `skippedContentGlobs` are now resolved by PurgeCSS in both modes.
