---
title: Nuxt.js | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Nuxt.js with the plugin nuxt-purgecss or with the PostCSS plugin.
  - name: keywords
    content: PurgeCSS Nuxt.js Nuxt plugin postCSS nuxt-purgecss
---

# Nuxt.js

> Nuxt.js presets all the configuration needed to make your development of a Vue.js application enjoyable. Nuxt.js can produce Universal, Single Page and Static Generated Applications.

You can use PurgeCSS with Nuxt.js by using the [Nuxt.js plugin](https://github.com/Developmint/nuxt-purgecss) or the PostCSS plugin.

## Nuxt.js plugin

You can use a community module called [nuxt-purgecss](https://github.com/Developmint/nuxt-purgecss) to make the usage of PurgeCSS with Nuxt as easy as possible. With it's fitting defaults, you only need to make a few changes (or none at all)
to the configuration.

### Installation

- Add `nuxt-purgecss` dependency using yarn or npm to your project
- Add `nuxt-purgecss` to `modules` section of `nuxt.config.js`:

```js
{
  modules: [
    'nuxt-purgecss',
  ],

  purgeCSS: {
   // your settings here
  }
}
```

### Options

#### Defaults

Before diving into the individual attributes, here are the default settings of the module:

```js
{
  mode: MODES.webpack,
  enabled: ({ isDev, isClient }) => (!isDev && isClient), // or `false` when in dev/debug mode
  paths: [
    'components/**/*.vue',
    'layouts/**/*.vue',
    'pages/**/*.vue',
    'plugins/**/*.js'
  ],
  styleExtensions: ['.css'],
  whitelist: ['body', 'html', 'nuxt-progress'],
  extractors: [
    {
      extractor: content => content.match(/[A-z0-9-:\\/]+/g) || [],
      extensions: ['html', 'vue', 'js']
    }
  ]
}
```

This settings should be a good foundation for a variety of projects.

#### Merging defaults

You can define every option either as function or as static value (primitives, objects, arrays, ...).
if you use a function, the default value will be provided as the first argument.

If you *don't* use a function to define you properties, the module will try to
merge them with the default values. This can be handy for `paths`, `whitelist` and so on because
the defaults are quite sensible. If you don't want to have the defaults include, just use a function.

#### Properties in-depth

##### mode

* Type: `String` (webpack or postcss)
* Default: `webpack`

Defines the mode, PurgeCSS should be used in.

* Webpack mode can only be used with `build.extractCSS: true`
* PostCSS mode can only be used with a `build.postcss` **object** (no array) or default settings

##### enabled

* Type: `Boolean` or `Function` (only for webpack mode, will receive the build.extend ctx)
* Default: `({ isDev, isClient }) => (!isDev && isClient)` (only activates in production mode) or `false` in debug/dev mode

Enables/Disables the module

* If it evaluates to false, the module won't be activated at all
* If a function is given, it'll be properly evaluated in webpack mode (in postcss mode it'll be handled as true)


##### PurgeCSS options

Please read [the PurgeCSS docs](https://www.purgecss.com/configuration) for information about
PurgeCSS-related information.

Instead of `content` we use `paths` to specify the paths PurgeCSS should look into (explained [here](https://www.purgecss.com/with-webpack#options).
This applies to **both modes**, not only to `webpack mode`.

## PostCSS plugin

Using the *extractCSS* option Nuxt will create CSS files that will be loaded separately by the browser.
When generating your application this might be a lot of small files.

To include the CSS into the header of the HTML file you'll need to run the following commands. 
Please note that using this configuration PurgeCSS will be active in production and development mode.

```text
npm i --save-dev @fullhuman/postcss-purgecss
```

```js
import purgecss from '@fullhuman/postcss-purgecss'
```

```javascript
build: {
  postcss: {
    plugins: [
      purgecss({
        content: ['./pages/**/*.vue', './layouts/**/*.vue', './components/**/*.vue'],
        whitelist: ['html', 'body'],
      })
    ]
  }
}
```