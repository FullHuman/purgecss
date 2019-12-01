---
title: Next.js | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Next.js with the plugin next-purgecss.
  - name: keywords
    content: PurgeCSS Next.js Next plugin next-purgecss
---

# Next.js

> Next.js is a React framework for production grade applications that scale. The world's leading companies use Next.js to build server-rendered applications, static websites, and more.

You can use PurgeCSS with Next.js by using the [Next.js plugin](https://github.com/lucleray/next-purgecss) or the PostCSS plugin.

## Next.js plugin

### Intallation

`next-purgecss` requires one of the following **css next plugins** :

- [next-css](https://github.com/zeit/next-plugins/tree/master/packages/next-css)
- [next-less](https://github.com/zeit/next-plugins/tree/master/packages/next-less)
- [next-sass](https://github.com/zeit/next-plugins/tree/master/packages/next-sass)

Just pick the one that fits your needs. In the following steps, I will use `next-css` but it works the same for the other **css next plugins**.

For example, install `next-css` and `next-purgecss` :

```
yarn add @zeit/next-css next-purgecss --dev
```

or with npm :

```
npm install @zeit/next-css next-purgecss --save-dev
```

Once you installed the packages, you need to edit `next.config.js`.

```js
// next.config.js
const withCss = require('@zeit/next-css')
const withPurgeCss = require('next-purgecss')

module.exports = withCss(withPurgeCss())
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
    purgeCssEnabled: ({ dev, isServer }) => !dev && !isServer // Only enable PurgeCSS for client-side production builds
  })
)
```

#### `purgeCssPaths`

By default, this plugin will scan `components` and `pages`
directories for classnames. You can change that by defining `purgeCssPaths`.

```js
// next.config.js
module.exports = withCss(
  withPurgeCss({
    purgeCssPaths: [
      'pages/**/*',
      'components/**/*',
      'other-components/**/*' // also scan other-components folder
    ]
  })
)
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
      whitelist: () => ['my-custom-class']
    }
  })
)
```

The list of available options are documented in [`purgecss-webpack-plugin`
docs](https://github.com/FullHuman/purgecss-webpack-plugin#options).

::: warning
`purgeCss.paths` will overwrite `purgeCssPaths`
:::