---
title: Grunt
description: "Remove unused CSS in Grunt builds with grunt-purgecss: installation, configuration of the purgecss task and its options."
lang: en-US
---

# Grunt

## Installation

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

Each destination of `files` is purged with its source files, and the purged CSS of its source files is written to the destination. A source file that does not exist is skipped with a warning when `nonull` is set (Grunt drops it otherwise), and the task fails when a destination has no source file left.

### Options

The task accepts the [PurgeCSS options](../configuration.md), except `css`, which is replaced by the source files of each destination. Some of them work differently:

- #### content

An array of paths and globs of the content files, e.g. `['src/**/*.html', 'src/**/*.js']`. They are relative to the current working directory, which Grunt sets to the directory of the Gruntfile. The files matching `skippedContentGlobs` are not used. When no file matches, PurgeCSS prints a warning and all the selectors are removed.

- #### sourceMap

The source map is added inline at the end of the destination file. Set `to` to the destination file, so that the sources of the map are relative to it:

```js
options: {
  content: ['src/**/*.html'],
  sourceMap: { to: 'dist/app.css' }
}
```

The task doesn't write source map files: with `inline: false`, the source map is lost and the destination file refers to a file that doesn't exist. Each source file adds its own source map, so only a destination with one source file has a usable source map.

- #### stdin

Do not set it: the paths of the source files would be read as CSS and the task fails.

The `rejected`, `rejectedCss`, `output` and `stdout` options have no effect: the task only writes the purged CSS.

::: tip
The source files of a destination are purged together, and each destination on its own. With `fontFace`, `keyframes` or `variables`, a `@font-face`, `@keyframes` or CSS variable only used by the source files of another destination is removed. To keep it, list these source files in the same destination.
:::

### Example

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
