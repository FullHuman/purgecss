# (2023-02-26)

### Bug Fixes

- [#268](https://github.com/Shorifpatwary/purgecss/issues/268) add details open atttribute to whitelist ([97f40e9](https://github.com/Shorifpatwary/purgecss/commit/97f40e986bba79ac68b79352b7bce28e62ab5e04))
- add default options to webpack plugin ([a1f09c9](https://github.com/Shorifpatwary/purgecss/commit/a1f09c9551873e828542f970022f32eb91b6da99))
- add safelist variables to postcss-purgecss [#840](https://github.com/Shorifpatwary/purgecss/issues/840) ([c822058](https://github.com/Shorifpatwary/purgecss/commit/c822058a703a0544c0bb683427937d9683688742))
- Added missing "main" tag on package.json file and index.js file as initial module. ([ca6fd4c](https://github.com/Shorifpatwary/purgecss/commit/ca6fd4ccd1af37e9bef1a8ecc08d476adb356fc6))
- Allow Absolute Paths ([#679](https://github.com/Shorifpatwary/purgecss/issues/679)) ([15335a2](https://github.com/Shorifpatwary/purgecss/commit/15335a2f4643a60593ab071064ad51db8f47ce77))
- attribute selector with spaces being removed ([418dc7e](https://github.com/Shorifpatwary/purgecss/commit/418dc7e0a7a30b57e1d7d9d10272e8f47eeb46fb)), closes [#392](https://github.com/Shorifpatwary/purgecss/issues/392)
- blocklist acts as not present ([1d587d8](https://github.com/Shorifpatwary/purgecss/commit/1d587d871f48dda798b05c0f0feae44d5e65d339))
- check chunk.files type at runtime ([501249c](https://github.com/Shorifpatwary/purgecss/commit/501249cc08826bcebb9e8ada796da826ffa30011))
- ci update to postcss 8.2 ([72302ff](https://github.com/Shorifpatwary/purgecss/commit/72302ffa475a2f74af4211c5a3caa70f2de4abfd))
- **CLI:** exit process on error with code 1 ([761eed8](https://github.com/Shorifpatwary/purgecss/commit/761eed87c623ee87338ef999ea755099b36bd7ae)), closes [#477](https://github.com/Shorifpatwary/purgecss/issues/477)
- compatibility with node 8 ([06b4677](https://github.com/Shorifpatwary/purgecss/commit/06b4677396ba47ddce1ae999af21d9407f0293e6))
- correct output for purgecss cli [#802](https://github.com/Shorifpatwary/purgecss/issues/802) ([b8aa978](https://github.com/Shorifpatwary/purgecss/commit/b8aa9782dc51b5e92544230689de955c647c325c))
- css variable removed when declared in wrong order ([89ece42](https://github.com/Shorifpatwary/purgecss/commit/89ece42929a3fd62b2a84fb0b57c0ac16c98908f)), closes [#518](https://github.com/Shorifpatwary/purgecss/issues/518)
- export named on default ([4502583](https://github.com/Shorifpatwary/purgecss/commit/4502583599c0401b46fd892e0d89096780674e10))
- Fix interaction with other plugins ([#647](https://github.com/Shorifpatwary/purgecss/issues/647)) ([fb08e3a](https://github.com/Shorifpatwary/purgecss/commit/fb08e3a3c27a1b25e4f023cbcbfca35a0cc2b43e))
- github worflow ([4115e11](https://github.com/Shorifpatwary/purgecss/commit/4115e11f1f283a0c2fab08180b2e957071c39cb9))
- github workflow ([b1075bb](https://github.com/Shorifpatwary/purgecss/commit/b1075bb025f83ba61b7dd32aadbf40647c1ecc2c))
- github workflow ([9d23fc2](https://github.com/Shorifpatwary/purgecss/commit/9d23fc2ebb54ebccc4144945f30ee13e4c1c62d3))
- glob filter out directories ([94203b1](https://github.com/Shorifpatwary/purgecss/commit/94203b1190a38158dced55859ca13771fc8e7be6)), closes [#430](https://github.com/Shorifpatwary/purgecss/issues/430)
- **grunt-purgecss:** add all files for publishing ([63b9622](https://github.com/Shorifpatwary/purgecss/commit/63b96229a94b8d659772f174429fb97f50d7bf25))
- **grunt-purgecss:** Fix plugin not ouputting all files ([#723](https://github.com/Shorifpatwary/purgecss/issues/723)) ([646e419](https://github.com/Shorifpatwary/purgecss/commit/646e419cac01b3e647cc77ffebcfd5c31d087e23))
- **gulp-purgecss:** fix support for stream input ([fd5d3bf](https://github.com/Shorifpatwary/purgecss/commit/fd5d3bf578344f2512d1c0961d8dbbb1f3b8d0d5))
- **gulp-purgecss:** move vinyl-sourcemaps-apply to deps [#999](https://github.com/Shorifpatwary/purgecss/issues/999) ([7858b7a](https://github.com/Shorifpatwary/purgecss/commit/7858b7a910efda13162095d8f528fb9e668cc190))
- **gulp-purgecss:** support skippedContentGlobs option [#853](https://github.com/Shorifpatwary/purgecss/issues/853) ([b72de77](https://github.com/Shorifpatwary/purgecss/commit/b72de77323fd74d5d53695409fef26e369656839))
- handle pseudo selectors ([74c7cfa](https://github.com/Shorifpatwary/purgecss/commit/74c7cfac0f1b41f963e93751d6c0920e6853f5df))
- ignore user defined attributes ([8a93a83](https://github.com/Shorifpatwary/purgecss/commit/8a93a83794b4597a3e6080d13fa2420ed779d687))
- Keep keyframe decimals for prefixed [@keyframes](https://github.com/keyframes) ([#749](https://github.com/Shorifpatwary/purgecss/issues/749)) ([b804441](https://github.com/Shorifpatwary/purgecss/commit/b80444195c08e2ae62f5e5f249a1e346b1d70097))
- keep root pseudo elements [#653](https://github.com/Shorifpatwary/purgecss/issues/653) ([5cd89a6](https://github.com/Shorifpatwary/purgecss/commit/5cd89a65d3130ac9d5ecd93a5b5437808453d2b0))
- **package:** update postcss to version 7.0.0 ([3657c4d](https://github.com/Shorifpatwary/purgecss/commit/3657c4de55be13b3cddec91288b8d3ff2ec5dbc6))
- **package:** update postcss-selector-parser to version 6.0.0 ([8dd2442](https://github.com/Shorifpatwary/purgecss/commit/8dd244216951eebaddf70323bf28298d40b4af3c))
- **postcss-purgecss:** remove postcss as peer dependency ([ff2eff5](https://github.com/Shorifpatwary/purgecss/commit/ff2eff5b0aea0c8ac7b132263792b055fcf1a857))
- purgecss cli ([9595902](https://github.com/Shorifpatwary/purgecss/commit/9595902bfd6e3f3ea6770273cb6e17e9f54afa3a))
- Purgecss webpack plugin/only filter fix ([#933](https://github.com/Shorifpatwary/purgecss/issues/933)) ([f8e4c2c](https://github.com/Shorifpatwary/purgecss/commit/f8e4c2c48440c26ca612b2486a6e9561be6f56d0))
- **purgecss-from-pug:** class attribute with multiple values not correctly handled with pug ([#678](https://github.com/Shorifpatwary/purgecss/issues/678)) ([ba6285d](https://github.com/Shorifpatwary/purgecss/commit/ba6285def36c304ca7ae3fa5999cec378065060c)), closes [#677](https://github.com/Shorifpatwary/purgecss/issues/677)
- **purgecss-webpack-plugin:** add sourcemap support [#409](https://github.com/Shorifpatwary/purgecss/issues/409) ([b3f73ed](https://github.com/Shorifpatwary/purgecss/commit/b3f73ed5293fa1d840aff98b5796f635343d48ec))
- **purgecss-webpack-plugin:** allow dynamic paths ([2743cfa](https://github.com/Shorifpatwary/purgecss/commit/2743cfade113b68ec089df5d37eb6de4c1f3b71b))
- **purgecss-webpack-plugin:** export as named export as well as default ([#821](https://github.com/Shorifpatwary/purgecss/issues/821)) ([a6a2c8e](https://github.com/Shorifpatwary/purgecss/commit/a6a2c8e0634324cc9ab276e02d5447d5d6c1e6e3))
- remove buggy stdin CLI feature ([7cc372f](https://github.com/Shorifpatwary/purgecss/commit/7cc372fc659d9761ffec565a334d8506bca1a316)), closes [#405](https://github.com/Shorifpatwary/purgecss/issues/405)
- remove github package registry ([2161227](https://github.com/Shorifpatwary/purgecss/commit/216122731bb75825c3f53e35b9d89300b36d4fca))
- remove named export for gulp plugin [#800](https://github.com/Shorifpatwary/purgecss/issues/800) ([3131d5b](https://github.com/Shorifpatwary/purgecss/commit/3131d5b5b1e6e08a5f6da223ac8310c0f2f010d8))
- removes duplicated css variables [#779](https://github.com/Shorifpatwary/purgecss/issues/779) ([18c5e80](https://github.com/Shorifpatwary/purgecss/commit/18c5e80bfd3ff06073b2a666b6661c0ad81f2694))
- safelist option in CLI ([43dbe3c](https://github.com/Shorifpatwary/purgecss/commit/43dbe3c498292a9c1ef2166d8c714275fcb9d62a)), closes [#513](https://github.com/Shorifpatwary/purgecss/issues/513)
- **test:** webpack test type error ([c41ad27](https://github.com/Shorifpatwary/purgecss/commit/c41ad27fac09fca62343ba5bdc0a6b7f53aeb757))
- **typo:** Add valid docs file name extension ([6f9ac00](https://github.com/Shorifpatwary/purgecss/commit/6f9ac00b4fa878ddcc17b669b6955af1f3aaf65b))
- **typo:** Change docs URL to valid ([6857cb7](https://github.com/Shorifpatwary/purgecss/commit/6857cb7b933a5e8d32d7a85cf4be07e038bc2b67))
- update node version circleci config ([ed6049b](https://github.com/Shorifpatwary/purgecss/commit/ed6049b1deae5064d5ec89ee12cd083ab6c0fc17))
- **vue-cli-plugin-purgecss:** update postcss-purgecss version ([5c9433b](https://github.com/Shorifpatwary/purgecss/commit/5c9433bae2d700d160be422a6dac88303df86113))
- webpack 4 compatibility ([a38bdbe](https://github.com/Shorifpatwary/purgecss/commit/a38bdbef95981faf7761630d2dcfd2280781bb1a))
- webpack plugin option blocklist types ([5b029c2](https://github.com/Shorifpatwary/purgecss/commit/5b029c21eb0269bc464d8e5f5a4ab9c3eed23064))
- webpack tests search does not have argument version ([a72dd3b](https://github.com/Shorifpatwary/purgecss/commit/a72dd3b86a277b6a09c344d7c2ad5dc7020c528d))
- webpack types ([84da7ca](https://github.com/Shorifpatwary/purgecss/commit/84da7ca98872bae29317f88c4295b400a6c02d06))
- **whitelist:** allow whitelisting of attributes ([1a83312](https://github.com/Shorifpatwary/purgecss/commit/1a833128465e88a8bd7164eaebe0589a8ac13a2b))
- workflow: set CI to false ([8aea4e9](https://github.com/Shorifpatwary/purgecss/commit/8aea4e9594453bb9af9e7e42980a05c86332f9a3))
- wrong path import ([4f3ddd0](https://github.com/Shorifpatwary/purgecss/commit/4f3ddd0a47ec29cf8a723bd68ebc4b724e03dc7e))

### Features

- add blocklist option ([04223f7](https://github.com/Shorifpatwary/purgecss/commit/04223f7fe27f8d818961a53900a7c5293d2322b6))
- add dynamic attributes option ([9b0fdc3](https://github.com/Shorifpatwary/purgecss/commit/9b0fdc3219b1b24856e302e0798e4d22ab006a5a)), closes [#588](https://github.com/Shorifpatwary/purgecss/issues/588)
- add dynamicAttributes option ([2f9cc65](https://github.com/Shorifpatwary/purgecss/commit/2f9cc653ba77b0eb58ebed40269bcb6923b3fe83))
- add option blocklist to webpack plugin ([#610](https://github.com/Shorifpatwary/purgecss/issues/610)) ([0148cea](https://github.com/Shorifpatwary/purgecss/commit/0148cea584f9a09c26846b505dbb4945b4c1b536))
- add option to ouput unused css ([#763](https://github.com/Shorifpatwary/purgecss/issues/763)) ([3a3d958](https://github.com/Shorifpatwary/purgecss/commit/3a3d9582f28434acceaca5622f82c39f598a85e1))
- add purgecss-from-tsx ([#716](https://github.com/Shorifpatwary/purgecss/issues/716)) ([e556afc](https://github.com/Shorifpatwary/purgecss/commit/e556afc6401a56886f10f8fda7f729853c0735e7))
- add safelist keyframes and css variables ([dc59d30](https://github.com/Shorifpatwary/purgecss/commit/dc59d309a4a4be9845c40966a19f9705c42a33a1)), closes [#418](https://github.com/Shorifpatwary/purgecss/issues/418) [#439](https://github.com/Shorifpatwary/purgecss/issues/439)
- add skippedContentGlobs option to webpack and gulp plugin ([e3dce1a](https://github.com/Shorifpatwary/purgecss/commit/e3dce1a43791d32f5967d4aa320f2ec80690b299))
- add source map support [#526](https://github.com/Shorifpatwary/purgecss/issues/526) ([f2a9c5a](https://github.com/Shorifpatwary/purgecss/commit/f2a9c5ac575af9a1e3f85be63b758fb9c37077e1))
- add usage and fix cli ([948186c](https://github.com/Shorifpatwary/purgecss/commit/948186c3fcae46f293cd58a8ef1dd7b78d8a4689))
- async extractors ([2fbb2eb](https://github.com/Shorifpatwary/purgecss/commit/2fbb2ebbcb931147df3dd6f402cb3efcaa52d3ad))
- **CLI:** add blocklist option ([3961afb](https://github.com/Shorifpatwary/purgecss/commit/3961afbc6d90eae83fe4862a4498857fa7ba3ff6))
- **CLI:** read from stdin ([59f6463](https://github.com/Shorifpatwary/purgecss/commit/59f6463f23bdaf924d770a0aa0631ca633d09b45))
- **CLI:** use variadic options for css, content ([35e5c45](https://github.com/Shorifpatwary/purgecss/commit/35e5c45f1f0954696457792fa2e58930977fe385))
- **content-options:** add option contentFunction to be able to declare content glob based on current input source css file ([e066817](https://github.com/Shorifpatwary/purgecss/commit/e066817552b7a1cdb082b657a9790449b9ea2278))
- export all types [#780](https://github.com/Shorifpatwary/purgecss/issues/780) ([1a959c6](https://github.com/Shorifpatwary/purgecss/commit/1a959c6700bf82975fd52ac32ec1012b3e2e1b5b))
- **gulp-purgecss:** add support for gulp-sourcemaps [#257](https://github.com/Shorifpatwary/purgecss/issues/257) ([55c26d2](https://github.com/Shorifpatwary/purgecss/commit/55c26d2790b8502f115180cfe02aba5720c84b7b))
- new purgecss-from-jsx plugin ([#692](https://github.com/Shorifpatwary/purgecss/issues/692)) ([3570c7d](https://github.com/Shorifpatwary/purgecss/commit/3570c7db9a4028e494ad684a7689f2cc5a99a585))
- **postcss-purgecss:** add package ([2b0616f](https://github.com/Shorifpatwary/purgecss/commit/2b0616fb9adc69255171aae53ef22580d131852b))
- **postcss-purgecss:** load options from purgecss config ([4de3bd8](https://github.com/Shorifpatwary/purgecss/commit/4de3bd8e198985670502f77c57567eb43fcccbd4))
- **postcss-purgecss:** remove compatibility with postcss 7 ([48ce28f](https://github.com/Shorifpatwary/purgecss/commit/48ce28fa10cb4bd72385f2ac0b25303f67c581be)), closes [#488](https://github.com/Shorifpatwary/purgecss/issues/488) [#540](https://github.com/Shorifpatwary/purgecss/issues/540)
- **purgecss-webpack-plugin:** load config file automatically [#767](https://github.com/Shorifpatwary/purgecss/issues/767) ([726faaa](https://github.com/Shorifpatwary/purgecss/commit/726faaa1e6eeb96f6c6b223d1ba925f9d7f33cba))
- **purgecss:** add support for :where and :is [#978](https://github.com/Shorifpatwary/purgecss/issues/978) ([bb5782b](https://github.com/Shorifpatwary/purgecss/commit/bb5782bff296805f95c6bae0ce434be314bd1580))
- remove unused css variables ([4af9b26](https://github.com/Shorifpatwary/purgecss/commit/4af9b2674b55c4de880152e22366bc65dd3470c6))
- update to PostCSS 8 ([beb4a59](https://github.com/Shorifpatwary/purgecss/commit/beb4a5913c5508a88053aa77926b9db9354013ee))
- use detailed extractor for purgecss-from-html ([6dc099d](https://github.com/Shorifpatwary/purgecss/commit/6dc099d7f284a0bcf530fe03665ee4c69f1cfd63))
- **vue-cli-plugin:** add vue-cli-plugin-purgecss ([18cc8b2](https://github.com/Shorifpatwary/purgecss/commit/18cc8b27d82048dbe287af3be777fa378e0f2930))
- webpack 5 compatibility ([f2cfcf5](https://github.com/Shorifpatwary/purgecss/commit/f2cfcf59eb9083b31739da60c139d20c9307b971))

### Performance Improvements

- Add a performance test of packages/purgecss. ([fa54f11](https://github.com/Shorifpatwary/purgecss/commit/fa54f1194cd35efb60ec5b517c2715cfa5573838))
- Avoid expensive copies of ExtractorResultDetailed objects. ([5c5bcdc](https://github.com/Shorifpatwary/purgecss/commit/5c5bcdcd83e0e0d4aa29c2f5e63aa3647f9e376c)), closes [#300](https://github.com/Shorifpatwary/purgecss/issues/300)
- Remove excessive jest.setTimeout(60000) now that perf is better. ([2b5eaa7](https://github.com/Shorifpatwary/purgecss/commit/2b5eaa764fc226a87b2d302f6803e1f31faf2bc3))

### Reverts

- Revert "build:" ([1e6d3cc](https://github.com/Shorifpatwary/purgecss/commit/1e6d3cc31bd690b0604070b287bc657d3ba416a5))
- Revert "adds keepChildren ability from whitelistPatterns Object[]" ([c52c81b](https://github.com/Shorifpatwary/purgecss/commit/c52c81b248ba01ded6e6ac4965871af426821eec))
- Revert "fixes style code" ([2213be6](https://github.com/Shorifpatwary/purgecss/commit/2213be632b4bf6ec28d06c63866fdd4e85c2adfc))

### BREAKING CHANGES

- **purgecss-webpack-plugin:** drop webpack 4 support
- **postcss-purgecss:** dropping support for postcss 7

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
