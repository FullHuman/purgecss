---
title: Vue | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Vue with the webpack plugin.
  - name: keywords
    content: PurgeCSS Vue.js Vue webpack plugin
---

# Vue

## Use the vue CLI plugin

![vue cli plugin purgecss](https://i.imgur.com/ZYnJSin.png)

### Install

If you haven't yet installed vue-cli 3, first follow the install instructions here: https://github.com/vuejs/vue-cli

Generate a project using vue-cli 3.0:

```bash
vue create my-app
```

Before installing the PurgeCSS plugin, make sure to commit or stash your changes in case you need to revert the changes.

To install the PurgeCSS plugin simply navigate to your application folder and add PurgeCSS.

```bash
cd my-app

vue add purgecss
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
  whitelist: [],
  whitelistPatterns: [ /-(leave|enter|appear)(|-(to|from|active))$/, /^(?!(|.*?:)cursor-move).+-move$/, /^router-link(|-exact)-active$/, /data-v-.*/ ],
}
```
