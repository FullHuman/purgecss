# purgecss-webpack-plugin

## 9.0.0

### Major Changes

- 145e717: Require Node.js 22.12 or later. Every package now declares `"engines": { "node": ">=22.12.0" }`, the version the `purgecss` command line already requires since the update to commander 15.
- 145e717: Make `webpack` a peer dependency (`^5.0.0`) instead of a dependency. The plugin now uses the webpack installed in your project instead of installing its own copy, so `webpack` must be installed alongside `purgecss-webpack-plugin`.

### Minor Changes

- 3fe20bd: Compare the `only` option with the chunk names, as documented. It was compared with the asset paths, so `only: ["style"]` also purged `style_print.css` or any asset in a `style/` folder. A configuration that relied on this, such as `only: ["css/main"]` or `only: ["main.css"]`, no longer purges anything: list the chunk names instead, for an entrypoint its key in `entry`.

### Patch Changes

- 63a8662: Load the options of `purgecss.config.js` the same way as the PurgeCSS API. The plugin used the imported module as the options, so a config file written with `module.exports = { ... }` or `export default { ... }` was silently ignored, and the config file was not loaded on Windows.

  A `purgecss.config.js` that exists but fails to load, for example because of a syntax error, now fails the build with `Error loading the config file ...` instead of being silently ignored.

- f5be4e2: Pass the `dynamicAttributes` option to PurgeCSS. The webpack plugin ignored it, so attribute selectors such as `.tab[aria-selected="true"]` were removed even when the attribute was listed in `dynamicAttributes`.
- 0965e29: Make the `safelist` and `blocklist` options optional in the TypeScript types. `new PurgeCSSPlugin({ paths })` failed to type-check because both options were required.
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
