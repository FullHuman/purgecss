# grunt-purgecss

[![Build Status](https://travis-ci.org/FullHuman/grunt-purgecss.svg?branch=master)](https://travis-ci.org/FullHuman/purgecss)
[![CircleCi](https://circleci.com/gh/FullHuman/grunt-purgecss/tree/master.svg?style=shield)]()
[![dependencies Status](https://david-dm.org/fullhuman/grunt-purgecss/status.svg)](https://david-dm.org/fullhuman/grunt-purgecss)
[![devDependencies Status](https://david-dm.org/fullhuman/grunt-purgecss/dev-status.svg)](https://david-dm.org/fullhuman/grunt-purgecss?type=dev)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/7710684c644d4f7cb725dc10a2a5953f)](https://www.codacy.com/app/FullHuman/grunt-purgecss?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=FullHuman/grunt-purgecss&amp;utm_campaign=Badge_Grade)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![npm](https://img.shields.io/npm/v/grunt-purgecss.svg)](https://www.npmjs.com/package/grunt-purgecss)
[![license](https://img.shields.io/github/license/fullhuman/grunt-purgecss.svg)]()

> Grunt plugin for purgecss.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-purgecss --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-purgecss');
```

## The "purgecss" task

### Overview
In your project's Gruntfile, add a section named `purgecss` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    // Configuration to be run (and then tested).
    purgecss: {
      my_target: {
        options: {
          content: ['./src/**/*.html']
        },
        files: {
          'dist/app.css': ['src/css/app.css']
        }
      }
    }
  });
```

### Options

All of the options of purgecss are available to use with the plugins.
You will find below the main options available. For the complete list, go to the [purgecss documentation website](https://www.purgecss.com/configuration.html#options)

#### options.content
Type: `string | Object`

You can specify content that should be analyzed by Purgecss with an array of filenames or globs. The files can be HTML, Pug, Blade, etc.

#### options.extractors
Type: `Array<Object>`

Purgecss can be adapted to suit your needs. If you notice a lot of unused CSS is not being removed, you might want to use a custom extractor.
More information about extractors [here](https://www.purgecss.com/extractors.html).

#### options.whitelist
Type: `Array<string>`

You can whitelist selectors to stop Purgecss from removing them from your CSS. This can be accomplished with the options whitelist and whitelistPatterns.

#### options.whitelistPatterns
Type: `Array<RegExp>`

You can whitelist selectors based on a regular expression with whitelistPatterns.

#### options.keyframes
Type: `boolean`
Default value: `false`

If you are using a CSS animation library such as animate.css, you can remove unused keyframes by setting the keyframes option to true.

#### options.fontFace
Type: `boolean`
Default value: `false`

If there are any unused @font-face rules in your css, you can remove them by setting the fontFace option to true.

### Usage Examples

The example below is using all of the main options available.

```js
grunt.initConfig({
    // Configuration to be run (and then tested).
    purgecss: {
      my_target: {
        options: {
          content: ['./src/**/*.html', `src/**/*.js`, 'src/**/*.blade', 'src/**/*.vue'],
          extractors: {
            extractor: class {
                static extract(content) {
                    content.match(/a-Z/) || []
                }
            },
            extension: ['html', 'blade']
          },
          whitelist: ['random', 'yep', 'button'],
          whitelistPatterns: [/red$/],
          keyframes: true,
          fontFace: true
        },
        files: {
          'dist/app.css': ['src/css/app.css']
        }
      }
    }
  });
```

