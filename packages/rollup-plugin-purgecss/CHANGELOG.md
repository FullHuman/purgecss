# rollup-plugin-purgecss

## 9.0.0

### Major Changes

- 145e717: Require Node.js 22.12 or later. Every package now declares `"engines": { "node": ">=22.12.0" }`, the version the `purgecss` command line already requires since the update to commander 15.

### Patch Changes

- 2857c78: Make the `output` option optional in the TypeScript types. It was declared as required, so the usage shown in the README (`purgecss({ content })`, which exports the purged CSS as a string) did not type-check.
- a896b48: Pass the PurgeCSS options (`safelist`, `blocklist`, `extractors`, `variables`, …) to PurgeCSS. Only `content` was used, so every other option was silently ignored.
- 145e717: Publish only the `lib` folder. The npm package shipped the source, the tests and the build files next to the built plugin. The deprecated `rollup-pluginutils` dependency is replaced with `@rollup/pluginutils`, and `rollup` is declared as a peer dependency.
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
