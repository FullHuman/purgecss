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

## Réutiliser le contenu extrait entre les exécutions

Les intégrations qui exécutent PurgeCSS de nombreuses fois avec le même contenu, comme un plugin PostCSS appelé une fois par fichier CSS ou un plugin de bundler en mode watch, peuvent partager un `ContentCache` entre leurs instances de PurgeCSS. Un fichier de contenu n'est alors relu et extrait à nouveau que lorsque sa date de modification, sa date de changement, sa taille, son inode ou son extracteur ont changé. Les exécutions simultanées partagent les fichiers en cours de lecture et d'extraction, si bien que chaque fichier n'est extrait qu'une fois.

```js
import { ContentCache, PurgeCSS } from 'purgecss'

const contentCache = new ContentCache()

async function purge(css) {
  const purgeCSS = new PurgeCSS()
  purgeCSS.contentCache = contentCache
  return purgeCSS.purge({ content: ['src/**/*.html'], css: [css] })
}
```

Les globs sont toujours résolus à chaque exécution, si bien que les nouveaux fichiers sont pris en compte et que les fichiers supprimés n'apportent plus de sélecteurs. Un fichier modifié ou changé moins de 2 secondes avant d'être lu (par exemple écrit, ou doté d'une date de modification plus ancienne par `touch -r`, `cp -p` ou la restauration d'une sauvegarde) est extrait à nouveau à l'exécution suivante, car un changement dans la limite de précision des horodatages du système de fichiers pourrait passer inaperçu.

Le cache garde une entrée pour chaque fichier qu'il a vu. Appelez `contentCache.prune(paths)` pour ne garder que les fichiers donnés, par exemple les fichiers que les globs du contenu trouvent après un rebuild, ou `contentCache.delete(path)` et `contentCache.clear()`. Les chemins passés à `prune`, `delete` et `has` sont résolus depuis le répertoire de travail courant, et `contentCache.keys()` liste les chemins absolus des fichiers du cache.

Les fichiers de contenu sont lus et extraits en parallèle, avec ou sans cache, au plus 32 à la fois pour l'ensemble des exécutions du processus, si bien que les extracteurs peuvent être appelés en même temps et dans n'importe quel ordre. Un extracteur ne doit dépendre que du contenu qu'il reçoit, et non des fichiers qu'il a vus auparavant.
