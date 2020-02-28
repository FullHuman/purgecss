---
title: Configuration | PurgeCSS
lang: en-US
meta:
  - name: description
    content: Details about the configuration of PurgeCSS and options available.
  - name: keywords
    content: PurgeCSS configuration file options
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
  content: Array<string | RawContent>
  css: Array<string | RawCSS>
  defaultExtractor?: ExtractorFunction
  extractors?: Array<Extractors>
  fontFace?: boolean
  keyframes?: boolean
  output?: string
  registerDependencies?: boolean
  rejected?: boolean
  stdin?: boolean
  stdout?: boolean
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

If there are any unused @font-face rules in your css, you can remove them by setting the `fontFace` option to `true`

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

If your are using Custom Properties (CSS variables), or a library using them such as Bootstrap, you can remove unused CSS variables by setting the `variables` option to `true`.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  variables: true
})
```

- **rejected \(default: false\)**

It can sometimes be more practical to scan through the removed list to see if there's anything obviously wrong.
If you want to do it, use the `rejected` option.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  rejected: true
})
```

- **registerDependencies \(default: false\)**

Some time you may want PurgeCSS to be enabled in development mode, if so then you want it to purge css correctly your css based on updated source content. In order for this to work we need to register all the content files that you specify in content globs as dependencies to webpack. This will inform webpack that when you change content source your css needs to be processed again since the class list may have been updated.

To enable this behaviour just set `registerDependencies` option to `true`;

__Keep in mind__ that if you just specify a very broad glob pattern in `content` option then all that source will have to be scanned and processed for every css entry point, that can be quite expensive and wasteful. Use `contentFunction` to provide a more granular information about what css entry is dependent on what content source files.

```js
await new PurgeCSS().purge({
  contentFunction: (styleSource) => {
    if (/component\.scss$/.test(styleSource)) {
      // if style source is a part of component then
      // it's dependent content is it's component template and code
      return [
        styleSource.replace(/scss$/, 'html'),
        styleSource.replace(/scss$/, 'js')
      ]
    } else {
      return ['./src/**/*.html']
    }
  },
  css: ['css/app.css'],
  registerDependencies: true
})
```

- **whitelist**

You can whitelist selectors to stop PurgeCSS from removing them from your CSS. This can be accomplished with the options `whitelist` and `whitelistPatterns`.

```js
const purgecss = await new PurgeCSS().purge({
  content: [], // content
  css: [], // css
  whitelist: ['random', 'yep', 'button']
})
```

In the example, the selectors `.random`, `#yep`, `button` will be left in the final CSS.

- **whitelistPatterns**

You can whitelist selectors based on a regular expression with `whitelistPatterns`.

```js
const purgecss = await new PurgeCSS().purge({
  content: [], // content
  css: [], // css
  whitelistPatterns: [/red$/]
})
```

In the example, selectors ending with `red` such as `.bg-red` will be left in the final CSS.

- **whitelistPatternsChildren**

You can whitelist selectors based on a regular expression with `whitelistPatternsChildren`. Contrary to `whitelistPatterns`, it will also whitelist children of the selectors.

```js
const purgecss = await new PurgeCSS().purge({
  content: [], // content
  css: [], // css
  whitelistPatternsChildren: [/red$/]
})
```

In the example, selectors such as `red p` or `.bg-red .child-of-bg` will be left in the final CSS.

