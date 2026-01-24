---
title: API Programmatique
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez utiliser son API programmatique dans votre flux de travail de développement.
  - itemprop: description
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez utiliser son API programmatique dans votre flux de travail de développement.
  - property: og:url
    content:  https://purgecss.com/fr/api
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: fr_FR
  - property: og:title
    content: Supprimer le CSS inutilisé - PurgeCSS
  - property: og:description
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez utiliser son API programmatique dans votre flux de travail de développement.
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
