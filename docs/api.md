---
title: Programmatic API | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use its programmatic API to use it as part of your development workflow.
  - itemprop: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use its programmatic API to use it as part of your development workflow.
  - property: og:url
    content:  https://purgecss.com/api
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: en_US
  - property: og:title
    content: Remove unused CSS - PurgeCSS
  - property: og:description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use its programmatic API to use it as part of your development workflow.
---

# Programmatic API

Start by installing PurgeCSS as a dev dependency.

```text
npm i -D purgecss
```

You can now use PurgeCSS inside a JavaScript file.

In the following examples, the options passed to PurgeCSS are the same as the ones [here](configuration.md). The result `purgecssResult` is an array of an object containing the name of the files with the purged CSS.

## Usage

### ES Module Import Syntax
```javascript
import PurgeCSS from 'purgecss'
const purgeCSSResult = await new PurgeCSS().purge({
  content: ['**/*.html'],
  css: ['**/*.css']
})
```

### CommonJS Syntax
```javascript
const { PurgeCSS } = require('purgecss')
const purgeCSSResult = await new PurgeCSS().purge({
  content: ['**/*.html'],
  css: ['**/*.css']
})
```

The format of purgeCSSResult is

```javascript
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
}
```
