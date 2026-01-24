# [8.0.0](https://github.com/FullHuman/purgecss/compare/v7.0.2...v8.0.0)

### BREAKING CHANGES

- Revert the changes from v7.0.2 that modified the import of the PostCSS plugin. This was causing issues (see [#1295](https://github.com/FullHuman/purgecss/issues/1295). The PostCSS plugin should now be imported via a default import:
```ts
import purgeCSSPlugin from '@fullhuman/postcss-purgecss';
```

### Features

* feat: add --preserve-paths option to CLI for maintaining folder hierarchy ([aa5ac9d](https://github.com/FullHuman/purgecss/commit/aa5ac9d)), closes [#377](https://github.com/FullHuman/purgecss/issues/377)

### Bug fixes

* fix:  for code scanning alert no. 5: Incomplete multi-character sanitization (#1403) ([3f39411](https://github.com/FullHuman/purgecss/commit/3f39411)), closes [#1403](https://github.com/FullHuman/purgecss/issues/1403)
* fix: enhance setOptions to support both ES modules and CommonJS config exports ([4ad48c4](https://github.com/FullHuman/purgecss/commit/4ad48c4)), closes [#1340](https://github.com/FullHuman/purgecss/issues/1340)
* fix: fix glob expression illegal operations on directories (#1308) ([b27293f](https://github.com/FullHuman/purgecss/commit/b27293f)), closes [#1308](https://github.com/FullHuman/purgecss/issues/1308) [#1266](https://github.com/FullHuman/purgecss/issues/1266)
* fix: update import statements for purgeCSSPlugin in documentation and source files ([e5cbce2](https://github.com/FullHuman/purgecss/commit/e5cbce2)), closes [#1295](https://github.com/FullHuman/purgecss/issues/1295)
* fix(#995): preserve relative paths in source maps ([4f6c4d9](https://github.com/FullHuman/purgecss/commit/4f6c4d9)), closes [#995](https://github.com/FullHuman/purgecss/issues/995)
* fix: enhance keyframes handling to preserve animations referenced via CSS variables ([076c027](https://github.com/FullHuman/purgecss/commit/076c027)), closes [#478](https://github.com/FullHuman/purgecss/issues/478)

### Changes (commits since v7.0.2)

* Add French documentation for PurgeCSS guides and plugins ([b9f4309](https://github.com/FullHuman/purgecss/commit/b9f4309))
* fix for "Workflow does not contain permissions" ([eb6d3b8](https://github.com/FullHuman/purgecss/commit/eb6d3b8))
* fix(#995): preserve relative paths in source maps ([4f6c4d9](https://github.com/FullHuman/purgecss/commit/4f6c4d9)), closes [#995](https://github.com/FullHuman/purgecss/issues/995)
* v8.0.0 ([2e315a5](https://github.com/FullHuman/purgecss/commit/2e315a5))
* chore: format ([6c0c84e](https://github.com/FullHuman/purgecss/commit/6c0c84e))
* chore: format ([7ad2fb7](https://github.com/FullHuman/purgecss/commit/7ad2fb7))
* docs: add breaking changes for v7 about named export for postcss plugin ([7d86fb5](https://github.com/FullHuman/purgecss/commit/7d86fb5))
* docs: add changelog for v7 ([bafb8a1](https://github.com/FullHuman/purgecss/commit/bafb8a1))
* docs: add SEO enhancements and sitemap support to documentation ([6505b7d](https://github.com/FullHuman/purgecss/commit/6505b7d))
* docs: remove outdated TailwindCSS sponsor image ([3949790](https://github.com/FullHuman/purgecss/commit/3949790))
* docs: update sponsorship images and remove outdated link ([bdf87e4](https://github.com/FullHuman/purgecss/commit/bdf87e4))
* docs: use named export for postcss plugin ([8eb027d](https://github.com/FullHuman/purgecss/commit/8eb027d))
* feat: add --preserve-paths option to CLI for maintaining folder hierarchy ([aa5ac9d](https://github.com/FullHuman/purgecss/commit/aa5ac9d)), closes [#377](https://github.com/FullHuman/purgecss/issues/377)
* feat: enhance keyframes handling to preserve animations referenced via CSS variables ([076c027](https://github.com/FullHuman/purgecss/commit/076c027)), closes [#478](https://github.com/FullHuman/purgecss/issues/478)
* build(deps-dev): bump @eslint/eslintrc from 3.1.0 to 3.2.0 (#1303) ([8308cdb](https://github.com/FullHuman/purgecss/commit/8308cdb)), closes [#1303](https://github.com/FullHuman/purgecss/issues/1303)
* build(deps-dev): bump @eslint/js from 9.11.1 to 9.39.0 (#1391) ([2348f82](https://github.com/FullHuman/purgecss/commit/2348f82)), closes [#1391](https://github.com/FullHuman/purgecss/issues/1391)
* build(deps-dev): bump @rollup/plugin-typescript from 12.1.0 to 12.1.2 (#1312) ([9387a9b](https://github.com/FullHuman/purgecss/commit/9387a9b)), closes [#1312](https://github.com/FullHuman/purgecss/issues/1312)
* build(deps-dev): bump @rollup/plugin-typescript from 12.1.2 to 12.3.0 (#1407) ([5902189](https://github.com/FullHuman/purgecss/commit/5902189)), closes [#1407](https://github.com/FullHuman/purgecss/issues/1407)
* build(deps-dev): bump @types/glob from 8.0.0 to 9.0.0 (#1408) ([aa30f0f](https://github.com/FullHuman/purgecss/commit/aa30f0f)), closes [#1408](https://github.com/FullHuman/purgecss/issues/1408)
* build(deps-dev): bump @types/jest from 29.5.13 to 29.5.14 (#1301) ([cb3d1c4](https://github.com/FullHuman/purgecss/commit/cb3d1c4)), closes [#1301](https://github.com/FullHuman/purgecss/issues/1301)
* build(deps-dev): bump @types/node from 22.13.0 to 25.0.3 (#1406) ([ca242ee](https://github.com/FullHuman/purgecss/commit/ca242ee)), closes [#1406](https://github.com/FullHuman/purgecss/issues/1406)
* build(deps-dev): bump @types/node from 22.8.6 to 22.13.0 (#1322) ([0d9f594](https://github.com/FullHuman/purgecss/commit/0d9f594)), closes [#1322](https://github.com/FullHuman/purgecss/issues/1322)
* build(deps-dev): bump @typescript-eslint/parser from 8.14.0 to 8.46.2 (#1390) ([67b5b0c](https://github.com/FullHuman/purgecss/commit/67b5b0c)), closes [#1390](https://github.com/FullHuman/purgecss/issues/1390)
* build(deps-dev): bump @vuepress/plugin-search (#1320) ([00251a7](https://github.com/FullHuman/purgecss/commit/00251a7)), closes [#1320](https://github.com/FullHuman/purgecss/issues/1320)
* build(deps-dev): bump @vuepress/plugin-search (#1372) ([307f8d2](https://github.com/FullHuman/purgecss/commit/307f8d2)), closes [#1372](https://github.com/FullHuman/purgecss/issues/1372)
* build(deps-dev): bump @vuepress/theme-default (#1405) ([047f0ea](https://github.com/FullHuman/purgecss/commit/047f0ea)), closes [#1405](https://github.com/FullHuman/purgecss/issues/1405)
* build(deps-dev): bump axios from 1.7.7 to 1.13.2 (#1401) ([bb14e06](https://github.com/FullHuman/purgecss/commit/bb14e06)), closes [#1401](https://github.com/FullHuman/purgecss/issues/1401)
* build(deps-dev): bump eslint from 9.39.1 to 9.39.2 (#1409) ([4a24603](https://github.com/FullHuman/purgecss/commit/4a24603)), closes [#1409](https://github.com/FullHuman/purgecss/issues/1409)
* build(deps-dev): bump eslint-plugin-tsdoc from 0.3.0 to 0.4.0 (#1304) ([447d424](https://github.com/FullHuman/purgecss/commit/447d424)), closes [#1304](https://github.com/FullHuman/purgecss/issues/1304)
* build(deps-dev): bump form-data from 4.0.0 to 4.0.4 (#1374) ([0853fd4](https://github.com/FullHuman/purgecss/commit/0853fd4)), closes [#1374](https://github.com/FullHuman/purgecss/issues/1374)
* build(deps-dev): bump globals from 15.11.0 to 16.5.0 (#1393) ([cfc4939](https://github.com/FullHuman/purgecss/commit/cfc4939)), closes [#1393](https://github.com/FullHuman/purgecss/issues/1393)
* build(deps-dev): bump lodash from 4.17.21 to 4.17.23 (#1414) ([f79b815](https://github.com/FullHuman/purgecss/commit/f79b815)), closes [#1414](https://github.com/FullHuman/purgecss/issues/1414)
* build(deps-dev): bump prettier from 3.3.3 to 3.4.2 (#1315) ([504f025](https://github.com/FullHuman/purgecss/commit/504f025)), closes [#1315](https://github.com/FullHuman/purgecss/issues/1315)
* build(deps-dev): bump prettier from 3.4.2 to 3.7.4 (#1413) ([bb778ad](https://github.com/FullHuman/purgecss/commit/bb778ad)), closes [#1413](https://github.com/FullHuman/purgecss/issues/1413)
* build(deps-dev): bump rollup from 4.53.3 to 4.54.0 (#1410) ([14052e6](https://github.com/FullHuman/purgecss/commit/14052e6)), closes [#1410](https://github.com/FullHuman/purgecss/issues/1410)
* build(deps-dev): bump vuepress from 2.0.0-rc.19 to 2.0.0-rc.26 ([a0bcec5](https://github.com/FullHuman/purgecss/commit/a0bcec5))
* build(deps-dev): update @typescript-eslint packages to version 8.48.1 ([52c16f4](https://github.com/FullHuman/purgecss/commit/52c16f4))
* build(deps-dev): update conventional-changelog-cli to conventional-changelog version 7.1.1 ([2745ee9](https://github.com/FullHuman/purgecss/commit/2745ee9))
* build(deps-dev): update conventional-changelog-cli to conventional-changelog version 7.1.1 ([69d8bbb](https://github.com/FullHuman/purgecss/commit/69d8bbb))
* build(deps): bump actions/checkout from 4 to 6 (#1399) ([f1f9930](https://github.com/FullHuman/purgecss/commit/f1f9930)), closes [#1399](https://github.com/FullHuman/purgecss/issues/1399)
* build(deps): bump actions/setup-node from 4 to 6 (#1389) ([256eea7](https://github.com/FullHuman/purgecss/commit/256eea7)), closes [#1389](https://github.com/FullHuman/purgecss/issues/1389)
* build(deps): bump actions/stale from 9 to 10 (#1384) ([3f67275](https://github.com/FullHuman/purgecss/commit/3f67275)), closes [#1384](https://github.com/FullHuman/purgecss/issues/1384)
* build(deps): bump coverallsapp/github-action from 2.3.4 to 2.3.6 (#1319) ([53edc4f](https://github.com/FullHuman/purgecss/commit/53edc4f)), closes [#1319](https://github.com/FullHuman/purgecss/issues/1319)
* build(deps): bump coverallsapp/github-action from 2.3.6 to 2.3.7 (#1398) ([9f760aa](https://github.com/FullHuman/purgecss/commit/9f760aa)), closes [#1398](https://github.com/FullHuman/purgecss/issues/1398)
* build(deps): bump js-yaml, @microsoft/api-documenter and lerna (#1402) ([1505cac](https://github.com/FullHuman/purgecss/commit/1505cac)), closes [#1402](https://github.com/FullHuman/purgecss/issues/1402)
* build(deps): bump nanoid from 3.3.7 to 3.3.8 (#1307) ([5e13f33](https://github.com/FullHuman/purgecss/commit/5e13f33)), closes [#1307](https://github.com/FullHuman/purgecss/issues/1307)
* build(deps): bump postcss from 8.5.1 to 8.5.6 (#1371) ([c5b9e06](https://github.com/FullHuman/purgecss/commit/c5b9e06)), closes [#1371](https://github.com/FullHuman/purgecss/issues/1371)
* build(deps): bump postcss-selector-parser from 6.1.2 to 7.0.0 (#1306) ([23cf540](https://github.com/FullHuman/purgecss/commit/23cf540)), closes [#1306](https://github.com/FullHuman/purgecss/issues/1306)
* build(deps): bump postcss-selector-parser from 7.0.0 to 7.1.1 (#1404) ([b1f2eab](https://github.com/FullHuman/purgecss/commit/b1f2eab)), closes [#1404](https://github.com/FullHuman/purgecss/issues/1404)
* build(deps): bump tmp and inquirer (#1400) ([9a05d07](https://github.com/FullHuman/purgecss/commit/9a05d07)), closes [#1400](https://github.com/FullHuman/purgecss/issues/1400)
* build(deps): bump typescript from 5.6.3 to 5.9.3 (#1412) ([0ee0b45](https://github.com/FullHuman/purgecss/commit/0ee0b45)), closes [#1412](https://github.com/FullHuman/purgecss/issues/1412)
* fix:  for code scanning alert no. 5: Incomplete multi-character sanitization (#1403) ([3f39411](https://github.com/FullHuman/purgecss/commit/3f39411)), closes [#1403](https://github.com/FullHuman/purgecss/issues/1403)
* fix: enhance setOptions to support both ES modules and CommonJS config exports ([4ad48c4](https://github.com/FullHuman/purgecss/commit/4ad48c4)), closes [#1340](https://github.com/FullHuman/purgecss/issues/1340)
* fix: fix glob expression illegal operations on directories (#1308) ([b27293f](https://github.com/FullHuman/purgecss/commit/b27293f)), closes [#1308](https://github.com/FullHuman/purgecss/issues/1308) [#1266](https://github.com/FullHuman/purgecss/issues/1266)
* fix: update import statements for purgeCSSPlugin in documentation and source files ([e5cbce2](https://github.com/FullHuman/purgecss/commit/e5cbce2)), closes [#1295](https://github.com/FullHuman/purgecss/issues/1295)



# [7.0.0](https://github.com/FullHuman/purgecss/compare/v6.0.0...v7.0.1)

### Bug Fixes

* fix: fix issue where pseudo classes like :where, :not, :is were always removed at root level ([89024ce](https://github.com/FullHuman/purgecss/commit/89024ce)), closes [#1282](https://github.com/FullHuman/purgecss/issues/1282) [#978](https://github.com/FullHuman/purgecss/issues/978)
* build: add named export for postcss plugin ([87d15b7](https://github.com/FullHuman/purgecss/commit/87d15b7)), closes [#1263](https://github.com/FullHuman/purgecss/issues/1263)

### Features

* feat(purgecss-from-pug): returns ExtractorResultDetailed instead of selectors ([fb51dc6](https://github.com/FullHuman/purgecss/commit/fb51dc6))

### BREAKING CHANGES

- PostCSS plugin should now be imported via purgeCSSPlugin
```ts
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';
```
- drop support for node 18

# [](https://github.com/FullHuman/purgecss/compare/v6.0.0...v) (2024-03-29)

# [6.0.0](https://github.com/FullHuman/purgecss/compare/v5.0.0...v6.0.0) (2024-03-29)

### Bug Fixes

- collect of used variables for changed selector ([#1217](https://github.com/FullHuman/purgecss/issues/1217)) ([9fbb592](https://github.com/FullHuman/purgecss/commit/9fbb5920164d3ffd296c0eaab6a4d2b4477b418c))
- **gulp-purgecss:** move vinyl-sourcemaps-apply to deps [#999](https://github.com/FullHuman/purgecss/issues/999) ([7858b7a](https://github.com/FullHuman/purgecss/commit/7858b7a910efda13162095d8f528fb9e668cc190))

### Features

- **purgecss:** add support for :where and :is [#978](https://github.com/FullHuman/purgecss/issues/978) ([bb5782b](https://github.com/FullHuman/purgecss/commit/bb5782bff296805f95c6bae0ce434be314bd1580))
- warn if no files are found [#642](https://github.com/FullHuman/purgecss/issues/642) ([6188505](https://github.com/FullHuman/purgecss/commit/61885055f46bc36c839f77c07e7d680378083567))

# [](https://github.com/FullHuman/purgecss/compare/v5.0.0...v) (2022-09-13)

# [5.0.0](https://github.com/FullHuman/purgecss/compare/v4.1.3...v5.0.0) (2022-09-13)

### Bug Fixes

- add safelist variables to postcss-purgecss [#840](https://github.com/FullHuman/purgecss/issues/840) ([c822058](https://github.com/FullHuman/purgecss/commit/c822058a703a0544c0bb683427937d9683688742))
- **gulp-purgecss:** support skippedContentGlobs option [#853](https://github.com/FullHuman/purgecss/issues/853) ([b72de77](https://github.com/FullHuman/purgecss/commit/b72de77323fd74d5d53695409fef26e369656839))
- Purgecss webpack plugin/only filter fix ([#933](https://github.com/FullHuman/purgecss/issues/933)) ([f8e4c2c](https://github.com/FullHuman/purgecss/commit/f8e4c2c48440c26ca612b2486a6e9561be6f56d0))
- **purgecss-webpack-plugin:** add sourcemap support [#409](https://github.com/FullHuman/purgecss/issues/409) ([b3f73ed](https://github.com/FullHuman/purgecss/commit/b3f73ed5293fa1d840aff98b5796f635343d48ec))
- **purgecss-webpack-plugin:** export as named export as well as default ([#821](https://github.com/FullHuman/purgecss/issues/821)) ([a6a2c8e](https://github.com/FullHuman/purgecss/commit/a6a2c8e0634324cc9ab276e02d5447d5d6c1e6e3))
- wrong path import ([4f3ddd0](https://github.com/FullHuman/purgecss/commit/4f3ddd0a47ec29cf8a723bd68ebc4b724e03dc7e))

### Features

- add source map support [#526](https://github.com/FullHuman/purgecss/issues/526) ([f2a9c5a](https://github.com/FullHuman/purgecss/commit/f2a9c5ac575af9a1e3f85be63b758fb9c37077e1))
- **gulp-purgecss:** add support for gulp-sourcemaps [#257](https://github.com/FullHuman/purgecss/issues/257) ([55c26d2](https://github.com/FullHuman/purgecss/commit/55c26d2790b8502f115180cfe02aba5720c84b7b))
- **postcss-purgecss:** load options from purgecss config ([4de3bd8](https://github.com/FullHuman/purgecss/commit/4de3bd8e198985670502f77c57567eb43fcccbd4))
- **purgecss-webpack-plugin:** load config file automatically [#767](https://github.com/FullHuman/purgecss/issues/767) ([726faaa](https://github.com/FullHuman/purgecss/commit/726faaa1e6eeb96f6c6b223d1ba925f9d7f33cba))

### BREAKING CHANGES

- **purgecss-webpack-plugin:** drop webpack 4 support

# [](https://github.com/FullHuman/purgecss/compare/v5.0.0...v) (2022-09-13)

# [4.1.0](https://github.com/FullHuman/purgecss/compare/v4.0.3...v4.1.0) (2021-11-28)

### Bug Fixes

- Allow Absolute Paths ([#679](https://github.com/FullHuman/purgecss/issues/679)) ([15335a2](https://github.com/FullHuman/purgecss/commit/15335a2f4643a60593ab071064ad51db8f47ce77))
- css variable removed when declared in wrong order ([89ece42](https://github.com/FullHuman/purgecss/commit/89ece42929a3fd62b2a84fb0b57c0ac16c98908f)), closes [#518](https://github.com/FullHuman/purgecss/issues/518)
- Fix interaction with other plugins ([#647](https://github.com/FullHuman/purgecss/issues/647)) ([fb08e3a](https://github.com/FullHuman/purgecss/commit/fb08e3a3c27a1b25e4f023cbcbfca35a0cc2b43e))
- **grunt-purgecss:** Fix plugin not ouputting all files ([#723](https://github.com/FullHuman/purgecss/issues/723)) ([646e419](https://github.com/FullHuman/purgecss/commit/646e419cac01b3e647cc77ffebcfd5c31d087e23))
- **gulp-purgecss:** fix support for stream input ([fd5d3bf](https://github.com/FullHuman/purgecss/commit/fd5d3bf578344f2512d1c0961d8dbbb1f3b8d0d5))
- Keep keyframe decimals for prefixed [@keyframes](https://github.com/keyframes) ([#749](https://github.com/FullHuman/purgecss/issues/749)) ([b804441](https://github.com/FullHuman/purgecss/commit/b80444195c08e2ae62f5e5f249a1e346b1d70097))
- **purgecss-from-pug:** class attribute with multiple values not correctly handled with pug ([#678](https://github.com/FullHuman/purgecss/issues/678)) ([ba6285d](https://github.com/FullHuman/purgecss/commit/ba6285def36c304ca7ae3fa5999cec378065060c)), closes [#677](https://github.com/FullHuman/purgecss/issues/677)

### Features

- add dynamicAttributes option ([2f9cc65](https://github.com/FullHuman/purgecss/commit/2f9cc653ba77b0eb58ebed40269bcb6923b3fe83))
- add option to ouput unused css ([#763](https://github.com/FullHuman/purgecss/issues/763)) ([3a3d958](https://github.com/FullHuman/purgecss/commit/3a3d9582f28434acceaca5622f82c39f598a85e1))
- add purgecss-from-tsx ([#716](https://github.com/FullHuman/purgecss/issues/716)) ([e556afc](https://github.com/FullHuman/purgecss/commit/e556afc6401a56886f10f8fda7f729853c0735e7))
- export all types [#780](https://github.com/FullHuman/purgecss/issues/780) ([1a959c6](https://github.com/FullHuman/purgecss/commit/1a959c6700bf82975fd52ac32ec1012b3e2e1b5b))
- new purgecss-from-jsx plugin ([#692](https://github.com/FullHuman/purgecss/issues/692)) ([3570c7d](https://github.com/FullHuman/purgecss/commit/3570c7db9a4028e494ad684a7689f2cc5a99a585))

# [](https://github.com/FullHuman/purgecss/compare/v4.0.3...v) (2021-06-07)

### Bug Fixes

- Allow Absolute Paths ([#679](https://github.com/FullHuman/purgecss/issues/679)) ([15335a2](https://github.com/FullHuman/purgecss/commit/15335a2f4643a60593ab071064ad51db8f47ce77))
- **purgecss-from-pug:** class attribute with multiple values not correctly handled with pug ([#678](https://github.com/FullHuman/purgecss/issues/678)) ([ba6285d](https://github.com/FullHuman/purgecss/commit/ba6285def36c304ca7ae3fa5999cec378065060c)), closes [#677](https://github.com/FullHuman/purgecss/issues/677)
- css variable removed when declared in wrong order ([89ece42](https://github.com/FullHuman/purgecss/commit/89ece42929a3fd62b2a84fb0b57c0ac16c98908f)), closes [#518](https://github.com/FullHuman/purgecss/issues/518)
- Fix interaction with other plugins ([#647](https://github.com/FullHuman/purgecss/issues/647)) ([fb08e3a](https://github.com/FullHuman/purgecss/commit/fb08e3a3c27a1b25e4f023cbcbfca35a0cc2b43e))

### Features

- add dynamicAttributes option ([2f9cc65](https://github.com/FullHuman/purgecss/commit/2f9cc653ba77b0eb58ebed40269bcb6923b3fe83))

## [4.0.3](https://github.com/FullHuman/purgecss/compare/v4.0.2...v4.0.3) (2021-03-20)

### Features

- add dynamic attributes option ([9b0fdc3](https://github.com/FullHuman/purgecss/commit/9b0fdc3219b1b24856e302e0798e4d22ab006a5a)), closes [#588](https://github.com/FullHuman/purgecss/issues/588)
- add skippedContentGlobs option to webpack and gulp plugin ([e3dce1a](https://github.com/FullHuman/purgecss/commit/e3dce1a43791d32f5967d4aa320f2ec80690b299))

## [4.0.2](https://github.com/FullHuman/purgecss/compare/v4.0.1...v4.0.2) (2021-02-21)

## [4.0.1](https://github.com/FullHuman/purgecss/compare/v4.0.0...v4.0.1) (2021-02-21)

### Bug Fixes

- attribute selector with spaces being removed ([418dc7e](https://github.com/FullHuman/purgecss/commit/418dc7e0a7a30b57e1d7d9d10272e8f47eeb46fb)), closes [#392](https://github.com/FullHuman/purgecss/issues/392)
- webpack plugin option blocklist types ([5b029c2](https://github.com/FullHuman/purgecss/commit/5b029c21eb0269bc464d8e5f5a4ab9c3eed23064))

### Features

- add option blocklist to webpack plugin ([#610](https://github.com/FullHuman/purgecss/issues/610)) ([0148cea](https://github.com/FullHuman/purgecss/commit/0148cea584f9a09c26846b505dbb4945b4c1b536))

# [4.0.0](https://github.com/FullHuman/purgecss/compare/v3.1.3...v4.0.0) (2021-01-17)

### Bug Fixes

- **test:** webpack test type error ([c41ad27](https://github.com/FullHuman/purgecss/commit/c41ad27fac09fca62343ba5bdc0a6b7f53aeb757))

### Features

- **postcss-purgecss:** remove compatibility with postcss 7 ([48ce28f](https://github.com/FullHuman/purgecss/commit/48ce28fa10cb4bd72385f2ac0b25303f67c581be)), closes [#488](https://github.com/FullHuman/purgecss/issues/488) [#540](https://github.com/FullHuman/purgecss/issues/540)

### BREAKING CHANGES

- **postcss-purgecss:** dropping support for postcss 7
  Drop PostCSS 7 support, use @fullhuman/postcss-purgecss 3.0 with PostCSS 7.

# [](https://github.com/FullHuman/purgecss/compare/v3.1.3-alpha.0...v) (2020-12-15)

- **postcss-purgecss** remove postcss 8 as peer dependency
- **purgecss-webpack-plugin** fix backward compatibility with webpack 4

# [3.1](https://github.com/FullHuman/purgecss/compare/v3.1.0-alpha.0...v) (2020-12-14)

- **PurgeCSS** Update to PostCSS 8
- **postcss-purgecss** Add compatibility with PostCSS 8
- **purgecss-webpack-plugin** Fix deprecation warning with Webpack 5

### Bug Fixes

- ci update to postcss 8.2 ([72302ff](https://github.com/FullHuman/purgecss/commit/72302ffa475a2f74af4211c5a3caa70f2de4abfd))
- safelist option in CLI ([43dbe3c](https://github.com/FullHuman/purgecss/commit/43dbe3c498292a9c1ef2166d8c714275fcb9d62a)), closes [#513](https://github.com/FullHuman/purgecss/issues/513)

# [3.0](https://github.com/FullHuman/purgecss/compare/v2.3.0...v) (2020-09-06)

### Features

- **CLI:** add blocklist option ([3961afb](https://github.com/FullHuman/purgecss/commit/3961afbc6d90eae83fe4862a4498857fa7ba3ff6))
- add blocklist option ([04223f7](https://github.com/FullHuman/purgecss/commit/04223f7fe27f8d818961a53900a7c5293d2322b6))
- add safelist option, replace whitelist
- add safelist keyframes and css variables ([dc59d30](https://github.com/FullHuman/purgecss/commit/dc59d309a4a4be9845c40966a19f9705c42a33a1)), closes [#418](https://github.com/FullHuman/purgecss/issues/418) [#439](https://github.com/FullHuman/purgecss/issues/439)

# [](https://github.com/FullHuman/purgecss/compare/v2.0.1-alpha.0...v) (2019-11-23)

## [2.0.1-alpha.0](https://github.com/FullHuman/purgecss/compare/1.4.0...v2.0.1-alpha.0) (2019-10-08)

### Features

- **postcss-purgecss:** add package ([2b0616f](https://github.com/FullHuman/purgecss/commit/2b0616fb9adc69255171aae53ef22580d131852b))

# [1.4.0](https://github.com/FullHuman/purgecss/compare/v1.3.0...1.4.0) (2019-09-01)

- Merged https://github.com/FullHuman/purgecss/commit/bc9f3b5b9d670832f0d1cca7bc7facfb253fb60b, ensure classes beginning with numbers are properly purged
- Merged https://github.com/FullHuman/purgecss/pull/214, fix font-face processing
- update dependencies

# [1.3.0](https://github.com/FullHuman/purgecss/compare/1.2.0...v1.3.0) (2019-04-20)

- Merged https://github.com/FullHuman/purgecss/pull/183, adding `defaultExtractor` option
- remove ignore comment once purged, issue https://github.com/FullHuman/purgecss/issues/121

# [1.2.0](https://github.com/FullHuman/purgecss/compare/1.1.0...1.2.0) (2019-04-05)

- fix issue https://github.com/FullHuman/purgecss/issues/148, so the default extract is used for any file type that is not specified
- Merged https://github.com/FullHuman/purgecss/pull/167, fixing issue #166
- Merged https://github.com/FullHuman/purgecss/pull/176, fixing invalid json output by the CLI
- Update dependencies
- Update dev dependencies, including babel 7

### Bug Fixes

- **package:** update postcss to version 7.0.0 ([3657c4d](https://github.com/FullHuman/purgecss/commit/3657c4de55be13b3cddec91288b8d3ff2ec5dbc6))
- **package:** update postcss-selector-parser to version 6.0.0 ([8dd2442](https://github.com/FullHuman/purgecss/commit/8dd244216951eebaddf70323bf28298d40b4af3c))

# [1.0.0](https://github.com/FullHuman/purgecss/compare/v0.20.1...1.0.0) (2018-05-22)

- Merge https://github.com/FullHuman/purgecss/pull/81, fixing https://github.com/FullHuman/purgecss/issues/80
- Change default extractor, does not return error for empty file anymore
- Remove legacy option
- Add rejected option https://github.com/FullHuman/purgecss/issues/55
- Add range ignore comment (`purgecss start ignore` and `purgecss end ignore`) https://github.com/FullHuman/purgecss/issues/66

### Reverts

- Revert "adds keepChildren ability from whitelistPatterns Object[]" ([c52c81b](https://github.com/FullHuman/purgecss/commit/c52c81b248ba01ded6e6ac4965871af426821eec))
- Revert "fixes style code" ([2213be6](https://github.com/FullHuman/purgecss/commit/2213be632b4bf6ec28d06c63866fdd4e85c2adfc))

## [0.20.1](https://github.com/FullHuman/purgecss/compare/v0.20.0...v0.20.1) (2018-03-12)

# [0.20.0](https://github.com/FullHuman/purgecss/compare/v0.19.0...v0.20.0) (2018-01-30)

- https://github.com/FullHuman/purgecss/pull/48, fix https://github.com/FullHuman/purgecss/issues/41
- New option `fontFace` to remove unused font-face declaration
- Remove unused vendor-prefixed keyframes rules
- Update dependencies

# [0.18.0](https://github.com/FullHuman/purgecss/compare/v0.16.0...v0.18.0) (2018-01-04)

- Change default extractor regex, fixing https://github.com/FullHuman/purgecss/issues/37
- Update dependencies
- Use files property in package.json: importing only necessary files.

# [0.16.0](https://github.com/FullHuman/purgecss/compare/v0.14.0...v0.16.0) (2017-12-18)

- `keyframes` option set to `false` by default, `keyframes: true` causing issue with bootstrap https://github.com/FullHuman/purgecss/issues/33
- Update dependencies.

# [0.14.0](https://github.com/FullHuman/purgecss/compare/v0.9.0...v0.14.0) (2017-12-07)

- Merge PR https://github.com/FullHuman/purgecss/pull/29 by @jsnanigans: add
  `raw` for content option to pass a raw string instead of a filepath.
- Fix incorrect logic that removes attributes selectors.
- Update dependencies.

# [0.9.0](https://github.com/FullHuman/purgecss/compare/v0.8.0...v0.9.0) (2017-11-07)

# [0.8.0](https://github.com/FullHuman/purgecss/compare/v0.4.0...v0.8.0) (2017-10-23)

# [0.4.0](https://github.com/FullHuman/purgecss/compare/v0.3.0...v0.4.0) (2017-07-31)

# [0.3.0](https://github.com/FullHuman/purgecss/compare/v0.2.0...v0.3.0) (2017-07-23)

# 0.2.0 (2017-07-16)
