---
title: Getting Started
description: "Install PurgeCSS and remove unused CSS with the command line, the JavaScript API, or a plugin for PostCSS, webpack, Gulp or Grunt."
lang: en-US
---

# Getting Started

Most bundlers and frameworks to build websites are using PostCSS. The easiest way to configure PurgeCSS is with its PostCSS plugin.

PurgeCSS requires Node.js 22.12 or later.

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
import purgeCSSPlugin from '@fullhuman/postcss-purgecss';

export default {
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
