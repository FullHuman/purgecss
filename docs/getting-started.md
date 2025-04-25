---
title: Getting Started
lang: en-US
meta:
  - name: description
    content: PurgeCSS is a tool to remove unused CSS from your project. It can be used as part of your development workflow. PurgeCSS comes with a JavaScript API, a CLI, and plugins for popular build tools.
  - itemprop: description
    content: PurgeCSS is a tool to remove unused CSS from your project. It can be used as part of your development workflow. PurgeCSS comes with a JavaScript API, a CLI, and plugins for popular build tools.
  - property: og:url
    content: https://purgecss.com
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
    content: PurgeCSS is a tool to remove unused CSS from your project. It can be used as part of your development workflow. PurgeCSS comes with a JavaScript API, a CLI, and plugins for popular build tools.
---

# Getting Started

Most bundlers and frameworks to build websites are using PostCSS. The easiest way to configure PurgeCSS is with its PostCSS plugin.

Install the PostCSS plugin:

:::: code-tabs
@tab npm
```sh
npm i -D @fullhuman/postcss-purgecss
```
@tab yarn
```sh
yarn add @fullhuman/postcss-purgecss --dev
```
::::

and add the PurgeCSS plugin to the PostCSS configuration:

```js{1,5-7}
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';

module.exports = {
  plugins: [
    purgeCSSPlugin({
      content: ['./**/*.html']
    })
  ]
}
```

PurgeCSS will remove the CSS that is not in the files specified in the `content` option.

You can find more information about PostCSS plugin and the configuration options on the following pages:
- [PostCSS plugin](/plugins/postcss)
- [Configuration](/configuration)
