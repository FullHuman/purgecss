---
title: Razzle | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Razzle with the plugin razzle-plugin-purgecss or with the PostCSS plugin.
  - itemprop: description
    content: PurgeCSS can be used with Razzle with the plugin razzle-plugin-purgecss or with the PostCSS plugin.
  - property: og:url
    content:  https://purgecss.com/guides/razzle
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
    content: PurgeCSS can be used with Razzle with the plugin razzle-plugin-purgecss or with the PostCSS plugin.
---

# Razzle

This example shows how to set up PurgeCSS with `create-razzle-app` template.  

## Installation

### 1. Install the packages

Once you initialized your project with `npx create-razzle-app my-app`, install the PurgeCSS plugin:

if you're using `npm`:

```
npm i --save-dev razzle-plugin-purgecss
```

if you're using `yarn`:

```
yarn add --dev razzle-plugin-purgecss
```

### 2. Edit `razzle.config.js`

```js
// razzle.config.js
const path = require('path');

module.exports = {
  plugins: [
    {
      name: 'purgecss',
      options: {
        // This path options is required for PurgeCSS to analyzed all of yours content
        path: path.resolve(__dirname, 'src/**/*'),
      }
    }
  ],
};
```

## Options

- only

  You can specify entrypoints to the PurgeCSS with the option `only`:

  ```js
  // razzle.config.js
  const path = require('path');

  module.exports = {
    plugins: [
      {
        name: 'purgecss',
        options: {
          path: path.resolve(__dirname, 'src/**/*'),
          only: ['bundle', 'vendor'],
        }
      }
    ],
  };
  ```

- whitelist (default: [])

  You can `whitelist` selectors to stop PurgeCSS from removing them from your CSS. This can be accomplished with the options `whitelist` and `whitelistPatterns`.

  ```js
  // razzle.config.js
  const path = require('path');

  module.exports = {
    plugins: [
      {
        name: 'purgecss',
        options: {
          path: path.resolve(__dirname, 'src/**/*'),
          whitelist: ['random', 'yep', 'button'],
        }
      }
    ],
  };
  ```

- whitelistPatterns (default: [])

  You can whitelist selectors based on a regular expression with whitelistPatterns.

  ```js
  // razzle.config.js
  const path = require('path');

  module.exports = {
    plugins: [
      {
        name: 'purgecss',
        options: {
          path: path.resolve(__dirname, 'src/**/*'),
          whitelistPatterns: [/red$/],
        }
      }
    ],
  };
  ```

- keyframes (default: false)

  If you are using a CSS animation library such as animate.css, you can remove unused keyframes by setting the keyframes option to true.

  ```js
  // razzle.config.js
  const path = require('path');

  module.exports = {
    plugins: [
      {
        name: 'purgecss',
        options: {
          path: path.resolve(__dirname, 'src/**/*'),
          keyframes: true
        }
      }
    ],
  };
  ```

- fontFace (default: false)

  If there are any unused `@font-face` rules in your css, you can remove them by setting the fontFace option to true

  ```js
  // razzle.config.js
  const path = require('path');

  module.exports = {
    plugins: [
      {
        name: 'purgecss',
        options: {
          path: path.resolve(__dirname, 'src/**/*'),
          fontFace: true,
        }
      }
    ],
  };
  ```

- rejected (default: false)

  It can sometimes be more practical to scan through the removed list to see if there's anything obviously wrong. If you want to do it, use the rejected option.

  ```js
  // razzle.config.js
  const path = require('path');

  module.exports = {
    plugins: [
      {
        name: 'purgecss',
        options: {
          path: path.resolve(__dirname, 'src/**/*'),
          rejected: true,
        }
      }
    ],
  };
  ```
