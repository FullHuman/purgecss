---
title: Programmatic API
description: "Use the PurgeCSS JavaScript API in Node.js: create a PurgeCSS instance, purge your content and CSS files, and read the resulting CSS."
lang: en-US
---

# Programmatic API

Start by installing PurgeCSS as a dev dependency.

:::: code-group
::: code-group-item NPM
```sh
npm install purgecss --save-dev
```
:::
::: code-group-item YARN
```sh
yarn add purgecss --dev
```
:::
::::

You can now use PurgeCSS inside a JavaScript file.

In the following examples, the options passed to PurgeCSS are the same as the ones [here](configuration.md). The result `purgecssResult` is an array of an object containing the name of the files with the purged CSS.

## Usage

### ES Module Import Syntax
```js
import { PurgeCSS } from 'purgecss'
const purgeCSSResult = await new PurgeCSS().purge({
  content: ['**/*.html'],
  css: ['**/*.css']
})
```

### CommonJS Syntax
```js
const { PurgeCSS } = require('purgecss')
const purgeCSSResult = await new PurgeCSS().purge({
  content: ['**/*.html'],
  css: ['**/*.css']
})
```

The format of purgeCSSResult is

```js
[
    {
        file: 'main.css',
        css: '/* purged css for main.css */'
    },
    {
        file: 'animate.css',
        css: '/* purged css for animate.css */'
    }
]
```

The type of the result is

```typescript
interface ResultPurge {
  css: string;
  file?: string;
  rejected?: string[];
  rejectedCss?: string;
}
```
