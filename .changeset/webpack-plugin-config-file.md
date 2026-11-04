---
"purgecss-webpack-plugin": patch
---

Load the options of `purgecss.config.js` the same way as the PurgeCSS API. The plugin used the imported module as the options, so a config file written with `module.exports = { ... }` or `export default { ... }` was silently ignored, and the config file was not loaded on Windows.

A `purgecss.config.js` that exists but fails to load, for example because of a syntax error, now fails the build with `Error loading the config file ...` instead of being silently ignored.
