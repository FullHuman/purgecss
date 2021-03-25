---
title: PostCSS | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use it with postcss with a plugin.
  - itemprop: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use it with postcss with a plugin.
  - property: og:url
    content: https://purgecss.com/plugins/postcss
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
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use it with postcss with a plugin.
---

# PostCSS

::: warning
If you are using PostCSS 7, install @fullhuman/postcss-purgecss 3.0.0: `npm i -D @fullhuman/postcss-purgecss@3.0.0`.
From version 4.0, it is compatible with PostCSS >=8 only.
:::

## Installation

```
npm i -D @fullhuman/postcss-purgecss postcss
```

## Usage

In `postcss.config.js`:

```js
const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
  plugins: [
    purgecss({
      content: ["./**/*.html"],
    }),
  ],
};
```

Using PostCSS API:

```js
const purgecss = require("@fullhuman/postcss-purgecss");
postcss([
  purgecss({
    content: ["./src/**/*.html"],
  }),
]);
```

Promises that resolve to either a `string` or `RawContent` are also supported.

```js
const purgecss = require('@fullhuman/postcss-purgecss')
postcss([
  purgecss({
    content: [
      './src/**/*.html',

      fetch('https://your-website/index.html').then(
        res => res.text()
      ),
  })
]);
```

See [PostCSS](https://github.com/postcss/postcss) documentation for examples for your environment.

## Options

All of the options of PurgeCSS are available to use with the plugins.
You will find below the type definition of the main options available. For the complete list, go to the [PurgeCSS documentation website](https://www.purgecss.com/configuration.html#options).

```ts
export interface UserDefinedOptions {
  content?: Array<string | RawContent | Promise<string | RawContent>>;
  contentFunction?: (sourceFile: string) => Array<string | RawContent>;
  defaultExtractor?: ExtractorFunction;
  extractors?: Array<Extractors>;
  fontFace?: boolean;
  keyframes?: boolean;
  output?: string;
  rejected?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  safelist?: UserDefinedSafelist;
  blocklist?: StringRegExpArray;
}

interface RawContent {
  extension: string;
  raw: string;
}

interface RawCSS {
  raw: string;
}

type StringRegExpArray = Array<RegExp | string>;
```
