---
title: PostCSS | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project.
  - name: keywords
    content: PurgeCSS PostCSS remove unused CSS optimization web
---

# PostCSS

## Installation

```
npm i -D @fullhuman/postcss-purgecss
```

## Usage

In `postcss.config.js`:

```js
const purgecss = require('@fullhuman/postcss-purgecss')

module.exports = {
  plugins: [
    purgecss({
      content: ['./**/*.html']
    })
  ]
}
```

Using PostCSS API:

```js
const purgecss = require('@fullhuman/postcss-purgecss')
postcss([
  purgecss({
    content: ['./src/**/*.html']
  })
])
```

See [PostCSS](https://github.com/postcss/postcss) documentation for examples for your environment.

## Options

All of the options of PurgeCSS are available to use with the plugins.
You will find below the type definition of the main options available. For the complete list, go to the [PurgeCSS documentation website](https://www.purgecss.com/configuration.html#options).

```ts
interface UserDefinedOptions {
  content: Array<string | RawContent>
  css: Array<string | RawCSS>
  defaultExtractor?: ExtractorFunction
  extractors?: Array<Extractors>
  fontFace?: boolean
  keyframes?: boolean
  output?: string
  variables?: boolean
  whitelist?: string[]
  whitelistPatterns?: Array<RegExp>
  whitelistPatternsChildren?: Array<RegExp>
}

interface RawContent {
  extension: string
  raw: string
}

interface RawCSS {
  raw: string
}
```
