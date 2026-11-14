# @fullhuman/vue-cli-plugin-purgecss

## 9.1.0

No changes in this release.

## 9.0.0

### Major Changes

- 145e717: Require Node.js 22.12 or later. Every package now declares `"engines": { "node": ">=22.12.0" }`, the version the `purgecss` command line already requires since the update to commander 15.

### Patch Changes

- 88bb113: Install the `@fullhuman/postcss-purgecss` version that matches the plugin. `vue add @fullhuman/purgecss` added `@fullhuman/postcss-purgecss@^4.0.0` to the project, so every project set up with the plugin got PurgeCSS 4.1.3. The README also showed `vue add purgecss`, which fails because it installs `vue-cli-plugin-purgecss` instead of `@fullhuman/vue-cli-plugin-purgecss`.
