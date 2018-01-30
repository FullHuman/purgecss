# Changelog

# v0.20.0 - 2018-01-31

* https://github.com/FullHuman/purgecss/pull/48, fix https://github.com/FullHuman/purgecss/issues/41
* New option `fontFace` to remove unused font-face declaration
* Remove unused vendor-prefixed keyframes rules
* Update dependencies



# v.0.19.0 - 2018-01-14

* https://github.com/FullHuman/purgecss/pull/34, fix https://github.com/FullHuman/purgecss/issues/33
* Update dependencies
* Modify Rollup configuration: remove commonjs plugin and add glob as external dependency

# v0.18.0 - 2018-01-05

* Change default extractor regex, fixing https://github.com/FullHuman/purgecss/issues/37
* Update dependencies
* Use files property in package.json: importing only necessary files.

# v0.16.0 - 2017-12-18

* `keyframes` option set to `false` by default, `keyframes: true` causing issue with bootstrap https://github.com/FullHuman/purgecss/issues/33
* Update dependencies.

# v0.14.0 - 2017-12-07

* Merge PR https://github.com/FullHuman/purgecss/pull/29 by @jsnanigans: add
  `raw` for content option to pass a raw string instead of a filepath.
* Fix incorrect logic that removes attributes selectors.
* Update dependencies.
