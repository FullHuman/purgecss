---
title: Razzle
description: "PurgeCSS peut être utilisé avec Razzle grâce au plugin razzle-plugin-purgecss ou au plugin PostCSS."
lang: fr-FR
---

# Razzle

Cet exemple montre comment configurer PurgeCSS avec le template `create-razzle-app`.

## Installation

### 1. Installer les packages

Une fois que vous avez initialisé votre projet avec `npx create-razzle-app my-app`, installez le plugin PurgeCSS :

:::: code-group
::: code-group-item NPM
```sh
npm i --save-dev razzle-plugin-purgecss
```
:::
::: code-group-item YARN
```sh
yarn add --dev razzle-plugin-purgecss
```
:::
::::

### 2. Modifier `razzle.config.js`

```js
// razzle.config.js
const path = require('path');

module.exports = {
  plugins: [
    {
      name: 'purgecss',
      options: {
        // Cette option path est requise pour que PurgeCSS analyse tout votre contenu
        path: path.resolve(__dirname, 'src/**/*'),
      }
    }
  ],
};
```

## Options

- only

  Vous pouvez spécifier des points d'entrée pour PurgeCSS avec l'option `only` :

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

- whitelist (défaut : [])

  Vous pouvez mettre en liste blanche des sélecteurs pour empêcher PurgeCSS de les supprimer de votre CSS. Cela peut être accompli avec les options `whitelist` et `whitelistPatterns`.

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

- whitelistPatterns (défaut : [])

  Vous pouvez mettre en liste blanche des sélecteurs basés sur une expression régulière avec whitelistPatterns.

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

- keyframes (défaut : false)

  Si vous utilisez une bibliothèque d'animations CSS comme animate.css, vous pouvez supprimer les keyframes inutilisées en définissant l'option keyframes à true.

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

- fontFace (défaut : false)

  S'il y a des règles `@font-face` inutilisées dans votre CSS, vous pouvez les supprimer en définissant l'option fontFace à true

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

- rejected (défaut : false)

  Il peut parfois être plus pratique de parcourir la liste des éléments supprimés pour voir s'il y a quelque chose d'évidemment incorrect. Si vous voulez le faire, utilisez l'option rejected.

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
