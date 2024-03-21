---
title: Next.js
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Next.js with the plugin next-purgecss or with the postcss plugin.
  - itemprop: description
    content: PurgeCSS can be used with Next.js with the plugin next-purgecss or with the postcss plugin.
  - property: og:url
    content:  https://purgecss.com/guides/next
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
    content: PurgeCSS can be used with Next.js with the plugin next-purgecss or with the postcss plugin.
---

# Next.js

> Next.js is a React framework for production grade applications that scale. The world's leading companies use Next.js to build server-rendered applications, static websites, and more.

You can use PurgeCSS with Next.js by using the postCSS plugin in the Next.js configuration

## Customize PostCSS configuration (Next.js >= 9.3)

To customize the PostCSS configuration, create a postcss.config.js file in the root of your project.

> Warning: When you define a custom PostCSS configuration file, Next.js completely disables the default behavior. Be sure to manually configure all the features you need compiled, including [Autoprefixer](https://github.com/postcss/autoprefixer). You also need to install any plugins included in your custom configuration manually, i.e. `npm install postcss-flexbugs-fixes postcss-preset-env`.

> By default, the outer document containing `html` and `body` is inside nextjs node module. Add `safelist:["html", "body"]` to make sure PurgeCSS does not remove those style.

Add PurgeCSS to the default configuration:

```js
module.exports = {
  "plugins": [
    "postcss-flexbugs-fixes",
    [
      "postcss-preset-env",
      {
        "autoprefixer": {
          "flexbox": "no-2009"
        },
        "stage": 3,
        "features": {
          "custom-properties": false
        }
      }
    ],
    [
      '@fullhuman/postcss-purgecss',
      {
        content: [
            './pages/**/*.{js,jsx,ts,tsx}',
            './components/**/*.{js,jsx,ts,tsx}'
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: ["html", "body"]
      }
    ],
  ]
}
```

## Next.js plugin (Next.js < 9.3)

### Installation

`next-purgecss` requires one of the following **css next plugins** :

- [next-css](https://github.com/zeit/next-plugins/tree/master/packages/next-css)
- [next-less](https://github.com/zeit/next-plugins/tree/master/packages/next-less)
- [next-sass](https://github.com/zeit/next-plugins/tree/master/packages/next-sass)

Just pick the one that fits your needs. In the following steps, I will use `next-css` but it works the same for the other **css next plugins**.

For example, install `next-css` and `next-purgecss` :

:::: code-group
::: code-group-item NPM
```sh
npm install @zeit/next-css next-purgecss --save-dev
```
:::
::: code-group-item YARN
```sh
yarn add @zeit/next-css next-purgecss --dev
```
:::
::::

Once you installed the packages, you need to edit `next.config.js`.

```js
// next.config.js
const withCss = require("@zeit/next-css");
const withPurgeCss = require("next-purgecss");

module.exports = withCss(withPurgeCss());
```

### Options

#### `purgeCssEnabled`

By default, `next-purgecss` will always remove unused CSS, regardless of build environment. You can change that by defining a function for the `purgeCssEnabled` option. The `purgeCssEnabled` function receives two arguments:

| Argument   | Type      | Description                                                                                      |
| ---------- | --------- | ------------------------------------------------------------------------------------------------ |
| `dev`      | `Boolean` | `true` in development mode (running `next`) or `false` in production mode (running `next start`) |
| `isServer` | `Boolean` | `true` during server side compilation or `false` during client side compilation                  |

```js
// next.config.js
module.exports = withCss(
  withPurgeCss({
    purgeCssEnabled: ({ dev, isServer }) => !dev && !isServer, // Only enable PurgeCSS for client-side production builds
  })
);
```

#### `purgeCssPaths`

By default, this plugin will scan `components` and `pages`
directories for classnames. You can change that by defining `purgeCssPaths`.

```js
// next.config.js
module.exports = withCss(
  withPurgeCss({
    purgeCssPaths: [
      "pages/**/*",
      "components/**/*",
      "other-components/**/*", // also scan other-components folder
    ],
  })
);
```

#### `purgeCss`

You can pass custom options to
[PurgeCSS](https://github.com/FullHuman/purgecss-webpack-plugin) by defining
`purgeCss` object in your `next.config.js`.

```js
// next.config.js
module.exports = withCss(
  withPurgeCss({
    purgeCss: {
      whitelist: () => ["my-custom-class"],
    },
  })
);
```

The list of available options are documented in [`purgecss-webpack-plugin`
docs](https://github.com/FullHuman/purgecss-webpack-plugin#options).

::: warning
`purgeCss.paths` will overwrite `purgeCssPaths`
:::
