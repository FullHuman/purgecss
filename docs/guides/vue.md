---
title: Vue | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Vue with the webpack plugin.
  - itemprop: description
    content: PurgeCSS can be used with Vue with the webpack plugin.
  - property: og:url
    content:  https://purgecss.com/guides/vue
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

## Use the vue CLI plugin

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
