---
title: Configuration
lang: en-US
meta:
  - name: description
    content: PurgeCSS has a list of options that allow you to customize its behavior. Customization can improve the performance and efficiency of PurgeCSS. Details about the configuration of PurgeCSS and options available.
  - itemprop: description
    content: PurgeCSS has a list of options that allow you to customize its behavior. Customization can improve the performance and efficiency of PurgeCSS. Details about the configuration of PurgeCSS and options available.
  - property: og:url
    content:  https://purgecss.com/configuration
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: en_US
  - property: og:title
    content: Remove unused CSS - PurgeCSS
  - property: og:description
    content: PurgeCSS has a list of options that allow you to customize its behavior. Customization can improve the performance and efficiency of PurgeCSS. Details about the configuration of PurgeCSS and options available.
---

# Configuration

PurgeCSS has a list of options that allow you to customize its behavior. Customization can improve the performance and efficiency of PurgeCSS. You can create a configuration file with the following options.

## Configuration file

The configuration file is a simple JavaScript file. By default, the JavaScript API will look for `purgecss.config.js`.

```js
module.exports = {
  content: ['index.html'],
  css: ['style.css']
}
```

You can then use PurgeCSS with the config file:

```js
const purgecss = await new PurgeCSS().purge()
// or use the path to the file as the only parameter
const purgecss = await new PurgeCSS().purge('./purgecss.config.js')
```

## Options

The options are defined by the following types:

```ts
interface UserDefinedOptions {
  content: Array<string | RawContent>;
  css: Array<string | RawCSS>;
  defaultExtractor?: ExtractorFunction;
  extractors?: Array<Extractors>;
  fontFace?: boolean;
  keyframes?: boolean;
  output?: string;
  rejected?: boolean;
  rejectedCss?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  safelist?: UserDefinedSafelist;
  blocklist?: StringRegExpArray;
}

interface RawContent {
  extension: string
  raw: string
}

interface RawCSS {
  raw: string
}

type StringRegExpArray = Array<RegExp | string>;

type ComplexSafelist = {
  standard?: StringRegExpArray;
  deep?: RegExp[];
  greedy?: RegExp[];
  variables?: StringRegExpArray;
  keyframes?: StringRegExpArray;
};

type UserDefinedSafelist = StringRegExpArray | ComplexSafelist;
```

- **content**

You can specify content that should be analyzed by PurgeCSS with an array of filenames or [globs](https://github.com/isaacs/node-glob/blob/master/README.md#glob-primer). The files can be HTML, Pug, Blade, etc.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css']
})
```

PurgeCSS also works with raw content. To do this, you need to pass an object with the `raw` property instead of a filename. To work properly with custom extractors you need to pass the `extension` property along with the raw content.

```js
await new PurgeCSS().purge({
  content: [
    {
      raw: '<html><body><div class="app"></div></body></html>',
      extension: 'html'
    },
    '**/*.js',
    '**/*.html',
    '**/*.vue'
  ],
  css: [
    {
      raw: 'body { margin: 0 }'
    },
    'css/app.css'
  ]
})
```

- **css**

Similar to `content`, you can specify css that should be processed by PurgeCSS with an array of filenames or [globs](https://github.com/isaacs/node-glob/blob/master/README.md#glob-primer).

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css']
})
```

PurgeCSS also works with raw css. To do this, you need to pass an object with the `raw` property instead of a filename.

```js
await new PurgeCSS().purge({
  content: [
    {
      raw: '<html><body><div class="app"></div></body></html>',
      extension: 'html'
    },
    '**/*.js',
    '**/*.html',
    '**/*.vue'
  ],
  css: [
    {
      raw: 'body { margin: 0 }'
    }
  ]
})
```

- **defaultExtractor**

PurgeCSS can be adapted to suit your needs. If you notice a lot of unused CSS is not being removed, you might want to use a custom extractor. Extractors can be used based on extensions files. If you want to use the same with every types of files, specify your extractor in `defaultExtractor`.

```js
await new PurgeCSS().purge({
  // ...
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
})
```

- **extractors**

PurgeCSS can be adapted to suit your needs. If you notice a lot of unused CSS is not being removed, you might want to use a custom extractor. You can find a list of available extractors, they can provide better accuracy and better optimization but their behavior will be proper to them. Which can make things difficult to reason about.

Consider using extractors as an advanced optimization technique that might not be necessary.

```js
import purgeFromHTML from 'purge-from-html'

await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  extractors: [
    {
      extractor: purgeFromHTML,
      extensions: ['html']
    },
    {
      extractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      extensions: ['vue', 'js']
    }
  ]
})
```

You can learn more about extractors [here](extractors.md).

- **fontFace \(default: false\)**

If there are any unused @font-face rules in your css, you can remove them by setting the `fontFace` option to `true`.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  fontFace: true
})
```

- **keyframes \(default: false\)**

If you are using a CSS animation library such as animate.css, you can remove unused keyframes by setting the `keyframes` option to `true`.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  keyframes: true
})
```

- **variables \(default: false\)**

If you are using Custom Properties (CSS variables), or a library using them such as Bootstrap, you can remove unused CSS variables by setting the `variables` option to `true`.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  variables: true
})
```

- **rejected \(default: false\)**

It can sometimes be more practical to scan through the removed list to see if there's anything obviously wrong. If you want to do it, use the `rejected` option.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  rejected: true
})
```
- **rejectedCss \(default: false\)**

If you would like to keep the discarded CSS you can do so by using the `rejectedCss` option.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  rejectedCss: true
})
```

- **safelist**

You can indicate which selectors are safe to leave in the final CSS. This can be accomplished with the option `safelist`.

Two forms are available for this option.

```js
safelist: ['random', 'yep', 'button', /^nav-/]
```

In this form, safelist is an array that can take a string or a regex.

The _complex_ form is:

```js
safelist: {
    standard: ['random', 'yep', 'button', /^nav-/],
    deep: [],
    greedy: [],
    keyframes: [],
    variables: []
}
```

e.g:

```js
const purgecss = await new PurgeCSS().purge({
  content: [],
  css: [],
  safelist: ['random', 'yep', 'button']
})
```

In this example, the selectors `.random`, `#yep`, `button` will be left in the final CSS.

```js
const purgecss = await new PurgeCSS().purge({
  content: [],
  css: [],
  safelist: [/red$/]
})
```

In this example, selectors ending with `red` such as `.bg-red` will be left in the final CSS.

- **safelist.deep**

You can safelist selectors and their children based on a regular expression with `safelist.deep`.

```js
const purgecss = await new PurgeCSS().purge({
  content: [],
  css: [],
  safelist: {
    deep: [/red$/]
  }
})
```

In this example, selectors such as `.bg-red .child-of-bg` will be left in the final CSS, even if `child-of-bg` is not found.

- **safelist.greedy**

Finally, you can safelist whole selectors if any part of that selector matches a regular expression with `safelist.greedy`.

```js
const purgecss = await new PurgeCSS().purge({
  content: [],
  css: [],
  safelist: {
    greedy: [/red$/]
  }
})
```

In this example, selectors such as `button.bg-red.nonexistent-class` will be left in the final CSS, even if `button` and `nonexistent-class` are not found.

- **blocklist**

Blocklist will block the CSS selectors from appearing in the final output CSS. The selectors will be removed even when they are seen as used by PurgeCSS.

```js
blocklist: ['usedClass', /^nav-/]
```
Even if nav-links and usedClass are found by an extractor, they will be removed.

- **skippedContentGlobs**

If you provide globs for the `content` parameter, you can use this option to exclude certain files or folders that would otherwise be scanned. Pass an array of globs matching items that should be excluded. (Note: this option has no effect if `content` is not globs.)

```js
skippedContentGlobs: ['node_modules/**', 'components/**']
```
Here, PurgeCSS will not scan anything in the "node_modules" and "components" folders.

- **dynamicAttributes**

Option to add custom CSS attribute selectors like "aria-selected", "data-selected", ...etc. 

```js
dynamicAttributes: ["aria-selected"]
```