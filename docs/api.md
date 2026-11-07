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
  sourceMap?: string;
}
```

`rejected` and `rejectedCss` are set when the options of the same name are enabled. `sourceMap` is set when the [`sourceMap`](configuration.md#options) option generates a source map that isn't inlined in the CSS, for example with `inline: false`.

## Reusing extracted content across runs

Integrations that run PurgeCSS many times with the same content, such as a PostCSS plugin called once per CSS file or a bundler plugin in watch mode, can share a `ContentCache` between their PurgeCSS instances. A content file is then only read and extracted again when its modification time, change time, size, inode or extractor changed. Runs at the same time share the files being read and extracted, so each file is extracted once.

```js
import { ContentCache, PurgeCSS } from 'purgecss'

const contentCache = new ContentCache()

async function purge(css) {
  const purgeCSS = new PurgeCSS()
  purgeCSS.contentCache = contentCache
  return purgeCSS.purge({ content: ['src/**/*.html'], css: [css] })
}
```

Globs are still resolved on every run, so new files are picked up and deleted files no longer contribute selectors. A file modified or changed less than 2 seconds before it was read (for example written, or given an older modification time by `touch -r`, `cp -p` or a backup restore) is extracted again on the next run, as a change within the precision of the file system timestamps could go unnoticed.

The cache keeps an entry for every file it has seen. Call `contentCache.prune(paths)` to keep only the given files, for example the files the content globs match after a rebuild, or `contentCache.delete(path)` and `contentCache.clear()`. The paths given to `prune`, `delete` and `has` are resolved from the current working directory, and `contentCache.keys()` lists the absolute paths of the files in the cache.

Content files are read and extracted in parallel, with or without a cache, at most 32 at a time for all the runs of the process together, so extractors can be called at the same time and in any order. An extractor must only depend on the content it is given, not on the files it saw before.
