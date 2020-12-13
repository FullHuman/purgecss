---
title: Extractors | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS relies on extractors to get the list of selector used in a file. There are multiples types of files that can contains selectors such as html files, templating files like pug, or even javascript file.
  - itemprop: description
    content: PurgeCSS relies on extractors to get the list of selector used in a file. There are multiples types of files that can contains selectors such as html files, templating files like pug, or even javascript file.
  - property: og:url
    content:  https://purgecss.com/extractors
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: en_US
  - property: og:title
    content: Remove unused CSS - PurgeCSS
  - property: og:description
    content: PurgeCSS relies on extractors to get the list of selector used in a file. There are multiples types of files that can contains selectors such as html files, templating files like pug, or even javascript file.
---

# Extractors

PurgeCSS can be adapted to suit your need. If you notice a lot of unused css is not being removed, you might want to use a specific extractor.

PurgeCSS relies on extractors to get the list of selector used in a file. There are multiples types of files that can contains selectors such as html files, templating files like pug, or even javascript file.

## Default extractor

PurgeCSS provides a default extractor that is working with all types of files but can be limited and not fit exactly the type of files or css framework that you are using.

The default extractor considers every word of a file as a selector. The default extractor has a few limitations:

* Does not consider special characters such as `@`, `:`, `/`

## Using an extractor

Using an extractor can be useful if you notice that PurgeCSS does not remove enough unused css or removes used ones.

Using a specific extractor for an extension should provide you with the best accuracy. If you want to purge exclusively html files you might want to consider the `purge-from-html` extractor.

You can use an extractor by settings the extractors option in the PurgeCSS config file.

```javascript
import purgeJs from 'purgecss-from-js'
import purgeHtml from 'purgecss-from-html'

const options = {
  content: [], // files to extract the selectors from
  css: [], // css
  extractors: [
    {
      extractor: purgeJs,
      extensions: ['js']
    },
    {
      extractor: purgeHtml,
      extensions: ['html']
    }
  ]
}
export default options
```

## Creating an extractor

An extractor is a simple function that takes the content of a file as a string and returns an array of selectors. By convention, the name of the npm package is `purge-from-[typefile]` \(e.g. purge-from-pug\). Using this convention will allow users to look at the list of extractor on npm by searching `purge-from`.

```javascript
const purgeFromJs = (content) => {
  // return array of css selectors
}
```

## List of available extractors (in progress)

::: warning
Those extractors are still a work in progress.
It is not encouraged to use them in production yet.
:::

- [purgecss-from-html](https://github.com/FullHuman/purgecss/blob/master/packages/purgecss-from-html): HTML files (.html)
- [purgecss-from-js](https://github.com/FullHuman/purgecss/blob/master/packages/purgecss-from-js): JS files
- [purgecss-from-pug](https://github.com/FullHuman/purgecss/blob/master/packages/purgecss-from-pug): Pug files (.pug)
- [purgecss-from-twig](): Twig files
- [purgecss-from-blade](): Blade files
