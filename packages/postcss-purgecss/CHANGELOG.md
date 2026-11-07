# @fullhuman/postcss-purgecss

## 9.1.0

### Minor Changes

- e0f3dd4: Make the PostCSS plugin work with the dev servers and the CSS modules of bundlers. The selectors extracted from the content files are kept between CSS files (with the new `ContentCache` of purgecss, shared by all the instances of the plugin), so a bundler that runs PostCSS once per CSS file only reads and extracts a content file again when it changed: 20 CSS files with 1,081 content files went from 7.6 s to 1.6 s. With a `postcss.config.js` that exports a function, which postcss-loader calls for every CSS file, define the extractor functions outside of it to benefit from the cache. The plugin now adds PostCSS `dependency`, `dir-dependency` and `missing-dependency` messages for the content files and globs (from `content` or `contentFunction`), so Vite, webpack and Rspack (postcss-loader), Next.js and Parcel purge the CSS again when a content file changes, instead of serving stale CSS until a restart (Vite picks up a new file matching a content glob at the next run of PostCSS for the CSS file only). Under Turbopack, the content outside the root Next.js infers (the outermost workspace marker or lock file, e.g. the monorepo root) gets no message, and the new option `dependencies: { root }` sets that root (pass the value of `turbopack.root` or `outputFileTracingRoot` when `next.config` sets it); `dependencies: false` and `contentCache: false` turn the features off. When postcss-modules runs before the plugin, as in Vite, the scoped class names and IDs of a CSS module whose local name is used in the content (`styles.button`) are kept, along with the classes they compose, instead of being removed.

### Patch Changes

- Updated dependencies [e0f3dd4]
  - purgecss@9.1.0

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
