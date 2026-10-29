---
"@fullhuman/postcss-purgecss": patch
---

Load the options of `purgecss.config.js` the same way as the PurgeCSS API. A config file written with `module.exports = { ... }` or `export default { ... }` was silently ignored, and the config file was not loaded on Windows.

A `purgecss.config.js` that exists but fails to load, for example because of a syntax error, now fails with `Error loading the config file ...` instead of being silently ignored. The `safelist` of the config file and the `safelist` of the plugin options are now combined, instead of the plugin option replacing the config file's safelist, even when it was empty.
