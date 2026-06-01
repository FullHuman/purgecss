---
title: Nuxt.js
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Nuxt.js with the plugin nuxt-purgecss or with the PostCSS plugin.
  - name: keywords
    content: PurgeCSS Nuxt.js Nuxt plugin postCSS nuxt-purgecss

  - name: description
    content: PurgeCSS can be used with Nuxt.js with the plugin nuxt-purgecss or with the PostCSS plugin.
  - itemprop: description
    content: PurgeCSS can be used with Nuxt.js with the plugin nuxt-purgecss or with the PostCSS plugin.
  - property: og:url
    content:  https://purgecss.com/guides/nuxt
  - property: og:site_name
    content: purgecss.com
  - property: og:type
    content: website
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: en_US
  - property: og:title
    content: Remove unused CSS - PurgeCSS
  - property: og:description
    content: PurgeCSS can be used with Nuxt.js with the plugin nuxt-purgecss or with the PostCSS plugin.
---

# Nuxt.js

> Nuxt.js presets all the configuration needed to make your development of a Vue.js application enjoyable. Nuxt.js can produce Universal, Single Page and Static Generated Applications.

You can use PurgeCSS with Nuxt.js by using the [Nuxt.js plugin](https://github.com/Developmint/nuxt-purgecss) or the PostCSS plugin.

## Nuxt.js plugin

You can use a community module called [nuxt-purgecss](https://github.com/Developmint/nuxt-purgecss) to make the usage of PurgeCSS with Nuxt as easy as possible. With its fitting defaults, you only need to make a few changes (or none at all)
to the configuration.

### Installation

- Add `nuxt-purgecss` dependency using yarn or npm to your project
- Add `nuxt-purgecss` to the `modules` section of `nuxt.config.js` or `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-purgecss',
  ],

  purgecss: {
    // your settings here
  }
})
```

If you are using Nuxt 2, use `nuxt-purgecss` v1.x and the legacy `buildModules` setup. `nuxt-purgecss` v2.x targets Nuxt 3 and uses the `purgecss` configuration key.

### Options

#### Defaults

Before diving into the individual attributes, here are the default settings of the module:

```js
{
  enabled: !nuxt.options.dev,
  content: [
    'components/**/*.vue',
    'layouts/**/*.vue',
    'pages/**/*.vue',
    'plugins/**/*.{js,ts}',
    'app.vue',
    'error.vue',
    'nuxt.config.{js,ts}',
  ],
  safelist: ['body', 'html', 'nuxt-progress'],
}
```

These settings should be a good foundation for a variety of projects.

#### Merging defaults

You can define every option either as function or as static value (primitives, objects, arrays, ...).
if you use a function, the default value will be provided as the first argument.

If you *don't* use a function to define you properties, the module will try to
merge them with the default values. This can be handy for `paths`, `whitelist` and so on because
the defaults are quite sensible. If you don't want to have the defaults include, just use a function.

#### Properties in-depth

##### enabled

* Type: `Boolean`
* Default: `!nuxt.options.dev` (disabled during `nuxt dev`, enabled for builds)

Enables/Disables the module

* If it evaluates to false, the module won't be activated at all

##### PurgeCSS options

Please read [the PurgeCSS docs](https://www.purgecss.com/configuration) for information about
PurgeCSS-related information.

All PurgeCSS options can be written directly in the `purgecss` object. If you add components or pages outside the default Nuxt folders, include them in `content`.

## PostCSS plugin

Using the *extractCSS* option Nuxt will create CSS files that will be loaded separately by the browser.
When generating your application this might be a lot of small files.

To include the CSS into the header of the HTML file you'll need to run the following commands. 
Please note that using this configuration PurgeCSS will be active in production and development mode.

:::: code-group
::: code-group-item NPM
```sh
npm i -D @fullhuman/postcss-purgecss
```
:::
::: code-group-item YARN
```sh
yarn add @fullhuman/postcss-purgecss --dev
```
:::
::::

```js
'@fullhuman/postcss-purgecss': {
  content: ['./pages/**/*.vue', './layouts/**/*.vue', './components/**/*.vue'],
  safelist: ['html', 'body']
}
```
