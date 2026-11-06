---
title: API Programmatique
description: "Utilisez l'API JavaScript de PurgeCSS dans Node.js : créez une instance PurgeCSS, purgez vos fichiers de contenu et CSS, et récupérez le CSS obtenu."
lang: fr-FR
---

# API Programmatique

Commencez par installer PurgeCSS comme dépendance de développement.

:::: code-group
::: code-group-item NPM
```sh
npm install purgecss --save-dev
```
:::
::: code-group-item YARN
```sh
yarn add purgecss --dev
```
:::
::::

Vous pouvez maintenant utiliser PurgeCSS dans un fichier JavaScript.

Dans les exemples suivants, les options passées à PurgeCSS sont les mêmes que celles décrites [ici](configuration.md). Le résultat `purgecssResult` est un tableau d'objets contenant le nom des fichiers avec le CSS purgé.

## Utilisation

### Syntaxe d'import ES Module
```js
import { PurgeCSS } from 'purgecss'
const purgeCSSResult = await new PurgeCSS().purge({
  content: ['**/*.html'],
  css: ['**/*.css']
})
```

### Syntaxe CommonJS
```js
const { PurgeCSS } = require('purgecss')
const purgeCSSResult = await new PurgeCSS().purge({
  content: ['**/*.html'],
  css: ['**/*.css']
})
```

Le format de purgeCSSResult est

```js
[
    {
        file: 'main.css',
        css: '/* css purgé pour main.css */'
    },
    {
        file: 'animate.css',
        css: '/* css purgé pour animate.css */'
    }
]
```

Le type du résultat est

```typescript
interface ResultPurge {
  css: string;
  file?: string;
  rejected?: string[];
  rejectedCss?: string;
}
```
