---
title: Gatsby | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Gatsby with the plugin gatsby-plugin-purgecss.
  - itemprop: description
    content: PurgeCSS can be used with Gatsby with the plugin gatsby-plugin-purgecss.
  - property: og:url
    content:  https://purgecss.com/plugins/gatbsy
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
    content: PurgeCSS can be used with Gatsby with the plugin gatsby-plugin-purgecss.
---

# Gatsby

::: tip
This plugin has been created by [@anantoghosh](https://github.com/anantoghosh) and this page is an extract from the ReadMe. 
You can find more information on [the plugin repository](https://github.com/anantoghosh/gatsby-plugin-purgecss)
:::

You can remove unused css from css/sass/less/stylus files and modules in your Gatsby project using PurgeCSS. Supports tailwind, bootstrap, bulma etc.

::: warning
This is NOT an install and forget type plugin. By default, it may remove required styles too.  
:::

📘 [Read the latest docs here.](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md) • [Changelog](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/CHANGELOG.md) • 

### Demo
When used in [gatsby-starter-bootstrap](https://github.com/jaxx2104/gatsby-starter-bootstrap)

![demo](https://anantoghosh.github.io/files/gatsby-starter-bootstrap.png)

When used in [gatsby-starter-bootstrap-cv](https://github.com/mhjadav/gatsby-starter-bootstrap-cv) (installed by default)

![demo](https://anantoghosh.github.io/files/gatsby-starter-bootstrap-cv.png)
## Supported files

- `.css` , `.module.css`
- `.scss`, `.sass`, `.module.scss`, `.module.sass` (via [gatsby-plugin-sass](https://next.gatsbyjs.org/packages/gatsby-plugin-sass/))
- `.less`, `.module.less` (via [gatsby-plugin-less](https://next.gatsbyjs.org/packages/gatsby-plugin-less/))
- `.styl`, `.module.styl` (via [gatsby-plugin-stylus](https://next.gatsbyjs.org/packages/gatsby-plugin-sass/))

## Installation

```sh
npm i gatsby-plugin-purgecss
```

### Usage

> **Add the plugin AFTER other css/postcss plugins**

```js
// gatsy-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-stylus`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-less`,
    `gatsby-plugin-postcss`,
    // Add after these plugins if used
    { 
      resolve: `gatsby-plugin-purgecss`,
      options: {
        printRejected: true, // Print removed selectors and processed file names
        // develop: true, // Enable while using `gatsby develop`
        // tailwind: true, // Enable tailwindcss support
        // whitelist: ['whitelist'], // Don't remove this selector
        // ignore: ['/ignored.css', 'prismjs/', 'docsearch.js/'], // Ignore files/folders
        // purgeOnly : ['components/', '/main.css', 'bootstrap/'], // Purge only these files/folders
      }
    }
  ]
};
```

## TLDR
* Define options in `gatsby-config.js`, not `purgecss.config.js`.
* If using tailwindcss, use the [`tailwind: true` option](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md#tailwind).
* Use [`printRejected: true`](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md#printrejected) option to print the removed selectors.
* Only files processed by Webpack will be purged.
* `my-selector` will not match `mySelector`.
* Whitelist required selectors or ignore files/folder using the [Whitelist Solutions](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md#whitelist-solutions) guide.
* Ignore complete packages with [`ignore: ['packagename/']`](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md#ignore).
* To only purge specific files/packages use [`purgeOnly: ['fileOrPackage/']`](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md#purgeOnly).
* Only `js, jsx, ts, tsx` files are scanned for selectors by default. If you want to add `md` or `mdx` use `content: [path.join(process.cwd(), 'src/**/!(*.d).{ts,js,jsx,tsx,md,mdx}')]` or better, just whitelist the required selectors.

