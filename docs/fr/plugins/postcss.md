---
title: PostCSS
description: "Supprimez le CSS inutilisé dans PostCSS avec @fullhuman/postcss-purgecss : installation, configuration du contenu et des listes blanches, et options du plugin."
lang: fr-FR
---

# PostCSS

::: warning
Si vous utilisez PostCSS 7, installez @fullhuman/postcss-purgecss 3.0.0 : `npm i -D @fullhuman/postcss-purgecss@3.0.0`.
À partir de la version 4.0, il est compatible uniquement avec PostCSS >=8.
:::

## Installation

```sh
npm i -D @fullhuman/postcss-purgecss postcss
```

## Utilisation

Dans `postcss.config.js` :

```js
import purgeCSSPlugin from '@fullhuman/postcss-purgecss';

export default {
  plugins: [
    purgeCSSPlugin({
      content: ['./**/*.html']
    })
  ]
}
```

Si votre configuration PostCSS est un module CommonJS, utilisez plutôt `require` :

```js
const purgeCSSPlugin = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    purgeCSSPlugin({
      content: ['./**/*.html']
    })
  ]
}
```

En utilisant l'API PostCSS :

```js
import purgeCSSPlugin from '@fullhuman/postcss-purgecss';

postcss([
  purgeCSSPlugin({
    content: ['./src/**/*.html']
  })
])
```

Consultez la documentation de [PostCSS](https://github.com/postcss/postcss) pour des exemples adaptés à votre environnement.

## Options

Toutes les options de PurgeCSS sont disponibles avec les plugins.
Vous trouverez ci-dessous la définition de type des principales options disponibles. Pour la liste complète, consultez le [site de documentation de PurgeCSS](https://www.purgecss.com/fr/configuration.html#options).

```ts
export interface UserDefinedOptions {
  content?: Array<string | RawContent>;
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
  extension: string
  raw: string
}

interface RawCSS {
  raw: string
}

type StringRegExpArray = Array<RegExp | string>;
```
