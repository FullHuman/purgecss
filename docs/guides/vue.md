---
title: Vue
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Vue with the webpack plugin.
  - itemprop: description
    content: PurgeCSS can be used with Vue with the webpack plugin.
  - property: og:url
    content: https://purgecss.com/guides/vue
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
    content: PurgeCSS can be used with Vue with the webpack plugin.
---

# Vue

## Vue 3 with Vite

For Vue 3 projects created with Vite, add PurgeCSS through the PostCSS plugin.

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

Create or update `postcss.config.js`:

```js
import purgeCSSPlugin from "@fullhuman/postcss-purgecss";

export default {
  plugins: [
    purgeCSSPlugin({
      content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
      defaultExtractor(content) {
        const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, "");
        return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || [];
      },
      safelist: [
        /-(leave|enter|appear)(|-(to|from|active))$/,
        /^router-link(|-exact)-active$/,
        /data-v-.*/,
      ],
    }),
  ],
};
```

The `content` entries include the Vite HTML entry point and Vue single-file components. The `defaultExtractor` ignores the `<style>` blocks of single-file components, so that a selector is not kept only because it appears in the component's own styles. The safelist keeps Vue transition classes, router active classes, and scoped style attributes.

## Vue CLI plugin

![vue cli plugin purgecss](https://i.imgur.com/ZYnJSin.png)

### Install

If you haven't yet installed vue-cli 3, first follow the install instructions here: https://github.com/vuejs/vue-cli

Generate a project using vue-cli 3.0:

```sh
vue create my-app
```

Before installing the PurgeCSS plugin, make sure to commit or stash your changes in case you need to revert the changes.

To install the PurgeCSS plugin simply navigate to your application folder and add PurgeCSS.

```sh
cd my-app

vue add @fullhuman/purgecss
```

The PurgeCSS plugin will generate a `postcss.config.js` file with PurgeCSS configured in it. You can then modify the PurgeCSS options.

### Usage

Below are the PurgeCSS options set by this plugin:

```js
{
  content: [ `./public/**/*.html`, `./src/**/*.vue` ],
  defaultExtractor (content) {
    const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '')
    return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || []
  },
  safelist: [ /-(leave|enter|appear)(|-(to|from|active))$/, /^(?!(|.*?:)cursor-move).+-move$/, /^router-link(|-exact)-active$/, /data-v-.*/ ],
}
```
