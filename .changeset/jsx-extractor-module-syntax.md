---
"@fullhuman/purgecss-from-jsx": patch
"@fullhuman/purgecss-from-tsx": patch
---

Parse the JSX files that have `import` or `export` statements with the default options. `purgeFromJsx()` parsed the code as a script, so a file with `import React from "react"` threw `'import' and 'export' may appear only with 'sourceType: module'` and PurgeCSS failed. The code is now parsed as a script that can have the syntax of ES modules (`import`, `export`, `import.meta` and top-level `await`), so both ES modules and scripts are parsed. The same goes for `purgeFromTsx()` when the `module` option of TypeScript keeps the ES modules, e.g. `ESNext`. Options passed to the extractor still replace the defaults.
