# [3.1](https://github.com/FullHuman/purgecss/compare/v3.1.0-alpha.0...v) (2020-12-14)

* **PurgeCSS** Update to PostCSS 8
* **postcss-purgecss** Add compatibility with PostCSS 8
* **purgecss-webpack-plugin** Fix deprecation warning with Webpack 5

### Bug Fixes

* ci update to postcss 8.2 ([72302ff](https://github.com/FullHuman/purgecss/commit/72302ffa475a2f74af4211c5a3caa70f2de4abfd))
* safelist option in CLI ([43dbe3c](https://github.com/FullHuman/purgecss/commit/43dbe3c498292a9c1ef2166d8c714275fcb9d62a)), closes [#513](https://github.com/FullHuman/purgecss/issues/513)



# [3.0](https://github.com/FullHuman/purgecss/compare/v2.3.0...v) (2020-09-06)


### Features

* **CLI:** add blocklist option ([3961afb](https://github.com/FullHuman/purgecss/commit/3961afbc6d90eae83fe4862a4498857fa7ba3ff6))
* add blocklist option ([04223f7](https://github.com/FullHuman/purgecss/commit/04223f7fe27f8d818961a53900a7c5293d2322b6))
* add safelist option, replace whitelist
* add safelist keyframes and css variables ([dc59d30](https://github.com/FullHuman/purgecss/commit/dc59d309a4a4be9845c40966a19f9705c42a33a1)), closes [#418](https://github.com/FullHuman/purgecss/issues/418) [#439](https://github.com/FullHuman/purgecss/issues/439)


# [](https://github.com/FullHuman/purgecss/compare/v2.0.1-alpha.0...v) (2019-11-23)


## [2.0.1-alpha.0](https://github.com/FullHuman/purgecss/compare/1.4.0...v2.0.1-alpha.0) (2019-10-08)


### Features

* **postcss-purgecss:** add package ([2b0616f](https://github.com/FullHuman/purgecss/commit/2b0616fb9adc69255171aae53ef22580d131852b))



# [1.4.0](https://github.com/FullHuman/purgecss/compare/v1.3.0...1.4.0) (2019-09-01)

* Merged https://github.com/FullHuman/purgecss/commit/bc9f3b5b9d670832f0d1cca7bc7facfb253fb60b, ensure classes beginning with numbers are properly purged
* Merged https://github.com/FullHuman/purgecss/pull/214, fix font-face processing
* update dependencies

# [1.3.0](https://github.com/FullHuman/purgecss/compare/1.2.0...v1.3.0) (2019-04-20)

* Merged https://github.com/FullHuman/purgecss/pull/183, adding `defaultExtractor` option
* remove ignore comment once purged, issue https://github.com/FullHuman/purgecss/issues/121

# [1.2.0](https://github.com/FullHuman/purgecss/compare/1.1.0...1.2.0) (2019-04-05)

* fix issue https://github.com/FullHuman/purgecss/issues/148, so the default extract is used for any file type that is not specified
* Merged https://github.com/FullHuman/purgecss/pull/167, fixing issue #166
* Merged https://github.com/FullHuman/purgecss/pull/176, fixing invalid json output by the CLI
* Update dependencies
* Update dev dependencies, including babel 7

### Bug Fixes

* **package:** update postcss to version 7.0.0 ([3657c4d](https://github.com/FullHuman/purgecss/commit/3657c4de55be13b3cddec91288b8d3ff2ec5dbc6))
* **package:** update postcss-selector-parser to version 6.0.0 ([8dd2442](https://github.com/FullHuman/purgecss/commit/8dd244216951eebaddf70323bf28298d40b4af3c))



# [1.0.0](https://github.com/FullHuman/purgecss/compare/v0.20.1...1.0.0) (2018-05-22)

* Merge https://github.com/FullHuman/purgecss/pull/81, fixing https://github.com/FullHuman/purgecss/issues/80
* Change default extractor, does not return error for empty file anymore
* Remove legacy option
* Add rejected option https://github.com/FullHuman/purgecss/issues/55
* Add range ignore comment (`purgecss start ignore` and `purgecss end ignore`) https://github.com/FullHuman/purgecss/issues/66

### Reverts

* Revert "adds keepChildren ability from whitelistPatterns Object[]" ([c52c81b](https://github.com/FullHuman/purgecss/commit/c52c81b248ba01ded6e6ac4965871af426821eec))
* Revert "fixes style code" ([2213be6](https://github.com/FullHuman/purgecss/commit/2213be632b4bf6ec28d06c63866fdd4e85c2adfc))



## [0.20.1](https://github.com/FullHuman/purgecss/compare/v0.20.0...v0.20.1) (2018-03-12)



# [0.20.0](https://github.com/FullHuman/purgecss/compare/v0.19.0...v0.20.0) (2018-01-30)

* https://github.com/FullHuman/purgecss/pull/48, fix https://github.com/FullHuman/purgecss/issues/41
* New option `fontFace` to remove unused font-face declaration
* Remove unused vendor-prefixed keyframes rules
* Update dependencies

# [0.18.0](https://github.com/FullHuman/purgecss/compare/v0.16.0...v0.18.0) (2018-01-04)

* Change default extractor regex, fixing https://github.com/FullHuman/purgecss/issues/37
* Update dependencies
* Use files property in package.json: importing only necessary files.

# [0.16.0](https://github.com/FullHuman/purgecss/compare/v0.14.0...v0.16.0) (2017-12-18)

* `keyframes` option set to `false` by default, `keyframes: true` causing issue with bootstrap https://github.com/FullHuman/purgecss/issues/33
* Update dependencies.

# [0.14.0](https://github.com/FullHuman/purgecss/compare/v0.9.0...v0.14.0) (2017-12-07)

* Merge PR https://github.com/FullHuman/purgecss/pull/29 by @jsnanigans: add
  `raw` for content option to pass a raw string instead of a filepath.
* Fix incorrect logic that removes attributes selectors.
* Update dependencies.

# [0.9.0](https://github.com/FullHuman/purgecss/compare/v0.8.0...v0.9.0) (2017-11-07)



# [0.8.0](https://github.com/FullHuman/purgecss/compare/v0.4.0...v0.8.0) (2017-10-23)



# [0.4.0](https://github.com/FullHuman/purgecss/compare/v0.3.0...v0.4.0) (2017-07-31)



# [0.3.0](https://github.com/FullHuman/purgecss/compare/v0.2.0...v0.3.0) (2017-07-23)



# 0.2.0 (2017-07-16)



