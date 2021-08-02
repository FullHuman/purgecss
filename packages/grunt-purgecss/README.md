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

All of the options of purgecss are available to use with the plugins.
You will find below the main options available. For the complete list, go to the [Purgecss documentation website](https://www.purgecss.com/configuration.html#options).

#### options.content

Type: `string | Object`

You can specify content that should be analyzed by Purgecss with an array of filenames or globs. The files can be HTML, Pug, Blade, etc.

#### options.extractors

Type: `Array<Object>`

Purgecss can be adapted to suit your needs. If you notice a lot of unused CSS is not being removed, you might want to use a custom extractor.
More information about extractors [here](https://www.purgecss.com/extractors.html).

#### options.safelist

You can indicate which selectors are safe to leave in the final CSS. This can be accomplished with the option `safelist`.

Two forms are available for this option.

```ts
safelist: ['random', 'yep', 'button', /^nav-/]
```

In this form, safelist is an array that can take a string or a regex.

The _complex_ form is:

```ts
safelist: {
    standard: ['random', 'yep', 'button', /^nav-/],
    deep: [],
    greedy: [],
    keyframes: [],
    variables: []
}
```

#### options.keyframes

Type: `boolean`
Default value: `false`

If you are using a CSS animation library such as animate.css, you can remove unused keyframes by setting the `keyframes` option to true.

#### options.fontFace

Type: `boolean`
Default value: `false`

If there are any unused `@font-face` rules in your CSS, you can remove them by setting the `fontFace` option to true.

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
          safelist: ['random', 'yep', 'button', /red$/]
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
