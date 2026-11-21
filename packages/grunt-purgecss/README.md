# grunt-purgecss

[![npm](https://img.shields.io/npm/v/grunt-purgecss.svg)](https://www.npmjs.com/package/grunt-purgecss)
[![license](https://img.shields.io/github/license/fullhuman/grunt-purgecss.svg)]()

> Grunt plugin for Purgecss.

## Getting Started

This plugin requires Grunt `~0.4.5`.

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

The task accepts the [PurgeCSS options](https://www.purgecss.com/configuration.html#options), except `css`, which is replaced by the source files of each destination. `content` is an array of paths and globs, relative to the current working directory (the directory of the Gruntfile). The source map is added inline to the destination file, with `sourceMap: { to: 'dist/app.css' }` for sources relative to the destination. Do not set `stdin`. The `rejected`, `rejectedCss`, `output` and `stdout` options have no effect.

The source files of a destination are purged together, and each destination on its own: with `fontFace`, `keyframes` or `variables`, a `@font-face`, `@keyframes` or CSS variable only used by the source files of another destination is removed. See the [documentation](https://www.purgecss.com/plugins/grunt.html#options).

### Usage Examples

```js
grunt.initConfig({
    purgecss: {
      my_target: {
        options: {
          content: ['./src/**/*.html', 'src/**/*.js', 'src/**/*.blade', 'src/**/*.vue'],
          extractors: [
            {
              extractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
              extensions: ['html', 'blade']
            }
          ],
          safelist: ['random', 'yep', 'button', /red$/],
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
