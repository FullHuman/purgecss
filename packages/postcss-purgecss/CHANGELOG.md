# @fullhuman/postcss-purgecss

## 9.0.0

### Major Changes

- 145e717: Require Node.js 22.12 or later. Every package now declares `"engines": { "node": ">=22.12.0" }`, the version the `purgecss` command line already requires since the update to commander 15.

### Patch Changes

- f13dd14: Load the options of `purgecss.config.js` the same way as the PurgeCSS API. A config file written with `module.exports = { ... }` or `export default { ... }` was silently ignored, and the config file was not loaded on Windows.

  A `purgecss.config.js` that exists but fails to load, for example because of a syntax error, now fails with `Error loading the config file ...` instead of being silently ignored. The `safelist` of the config file and the `safelist` of the plugin options are now combined, instead of the plugin option replacing the config file's safelist, even when it was empty.

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
