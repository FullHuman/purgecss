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

Before diving into the individual attributes, here are the default settings of the module (see [`src/config.ts`](https://github.com/Developmint/nuxt-purgecss/blob/main/src/config.ts) for the current version):

```js
{
  enabled: !nuxt.options.dev,
  content: [
    'components/**/*.{vue,jsx?,tsx?}',
    'layouts/**/*.{vue,jsx?,tsx?}',
    'pages/**/*.{vue,jsx?,tsx?}',
    'composables/**/*.{vue,jsx?,tsx?}',
    'App.{vue,jsx?,tsx?}',
    'app.{vue,jsx?,tsx?}',
    'plugins/**/*.{js,ts}',
    'nuxt.config.{js,ts}'
  ],
  defaultExtractor: (content) => {
    const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '') // Remove inline vue styles
    return contentWithoutStyleBlocks.match(/[\w-.:/]+(?<!:)/g) || [] // Default extractor
  },
  safelist: [
    'body',
    'html',
    'nuxt-progress',
    '__nuxt',
    /-(leave|enter|appear)(|-(to|from|active))$/, // Normal transitions
    /^nuxt-link(|-exact)-active$/, // Nuxt link classes
    /^(?!cursor-move).+-move$/, // Move transitions
    /.*data-v-.*/, // Keep scoped styles
    // New Vue3 selectors
    /:slotted/,
    /:deep/,
    /:global/,
    /nuxt-devtools-.*/
  ]
}
```

These settings should be a good foundation for a variety of projects.

#### Merging defaults

Your options are merged with the defaults using [`defu`](https://github.com/unjs/defu). Write your values as usual: arrays such as `content` and `safelist` are added to the default ones, and the other options replace their default value.

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

::::: code-tabs
@tab npm
```sh
npm i -D @fullhuman/postcss-purgecss
```
@tab yarn
```sh
yarn add @fullhuman/postcss-purgecss --dev
```
:::::

```js
'@fullhuman/postcss-purgecss': {
  content: ['./pages/**/*.vue', './layouts/**/*.vue', './components/**/*.vue'],
  safelist: ['html', 'body']
}
```
