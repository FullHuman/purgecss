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

## Fichier de configuration

Le plugin lit aussi les options de `purgecss.config.js` si ce fichier se trouve dans le répertoire de travail, le dossier où vous lancez le build. Les options passées au plugin ont la priorité sur celles du fichier de configuration, sauf `safelist` : les safelists des deux s'additionnent.

```js
// purgecss.config.js
module.exports = {
  content: ['./src/**/*.html'],
  safelist: ['active', /^modal-/]
}
```

```js
// postcss.config.js
import purgeCSSPlugin from '@fullhuman/postcss-purgecss';

export default {
  plugins: [
    purgeCSSPlugin({})
  ]
}
```

Le plugin a besoin d'un objet d'options, même vide, lorsque toutes les options sont dans `purgecss.config.js`. Si `purgecss.config.js` existe mais ne peut pas être chargé, par exemple à cause d'une erreur de syntaxe, le build échoue avec `Error loading the config file ...`.

::: warning
Jusqu'à la version 8.0.0, les options exportées avec `module.exports = { ... }` ou `export default { ... }` sont ignorées, un fichier de configuration qui ne peut pas être chargé est ignoré lui aussi, et une `safelist` dans les options du plugin remplace celle de `purgecss.config.js` au lieu de s'y ajouter.
:::

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
