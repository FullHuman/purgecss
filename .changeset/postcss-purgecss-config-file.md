---
"@fullhuman/postcss-purgecss": patch
---

Load the options of `purgecss.config.js` the same way as the PurgeCSS API. A config file written with `module.exports = { ... }` or `export default { ... }` was silently ignored, and the config file was not loaded on Windows.
