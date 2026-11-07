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

## Bundlers et serveurs de développement

Les bundlers exécutent PostCSS une fois par fichier CSS. Depuis la version 9.1.0, le plugin garde les sélecteurs qu'il extrait de chaque fichier de contenu, si bien que le contenu n'est pas relu pour chaque fichier CSS : un fichier de contenu n'est relu et extrait à nouveau que lorsqu'il a changé, ou lorsque l'extracteur utilisé pour lui est une autre fonction. Les sélecteurs extraits sont partagés par toutes les instances du plugin dans le processus, car postcss-loader (webpack, Rspack) en crée une pour chaque fichier CSS. Les globs de `content` sont toujours résolus pour chaque fichier CSS, si bien que les fichiers ajoutés et supprimés sont pris en compte. Utilisez [`contentCache: false`](#contentcache) pour désactiver ce comportement.

::: tip
postcss-loader appelle un `postcss.config.js` qui exporte une fonction une fois par fichier CSS. Définissez les fonctions d'extraction (`defaultExtractor`, `extractors`) en dehors de cette fonction, afin qu'elles soient les mêmes fonctions pour chaque fichier CSS, sinon le contenu est extrait à nouveau pour chaque fichier CSS.
:::

### Purger à nouveau quand le contenu change

Depuis la version 9.1.0, le plugin indique au bundler de quel contenu dépend chaque fichier CSS, avec les [messages de dépendance de PostCSS](https://github.com/postcss/postcss/blob/main/docs/guidelines/plugin.md#3-dependencies). Vite, webpack et Rspack (postcss-loader), Next.js (Turbopack et webpack) et Parcel les utilisent pour exécuter PostCSS à nouveau lorsqu'un fichier de contenu change ou est supprimé, si bien que le serveur de développement sert un CSS qui correspond au contenu sans redémarrage.

- Un fichier de contenu donne un message `dependency` avec son chemin absolu.
- Un glob qui part d'un sous-répertoire, par exemple `./src/**/*.{js,jsx}`, donne un message `dir-dependency` avec ce répertoire (`<projet>/src`) et le reste du motif. webpack, Rspack, Parcel et Turbopack exécutent PostCSS à nouveau lorsqu'un fichier correspondant est créé. Vite ne surveille que les fichiers qui correspondaient lors de l'exécution de PostCSS : il ne prend en compte un nouveau fichier qu'une fois que quelque chose d'autre exécute à nouveau PostCSS pour le fichier CSS, par exemple la modification d'un fichier qui importe le nouveau.
- Un glob qui part du répertoire de travail ou d'un répertoire parent, par exemple `./*.html` ou `**/*.js`, donne un message `dependency` pour chaque fichier trouvé : avec tous les bundlers, un fichier créé plus tard n'est pris en compte qu'une fois que quelque chose d'autre exécute à nouveau PostCSS. Faites partir les globs d'un sous-répertoire, par exemple `./src/**/*.js`, pour que webpack, Rspack, Parcel et Turbopack prennent en compte les nouveaux fichiers.
- Un fichier de contenu qui n'existe pas encore donne un message `missing-dependency`. Vite et Parcel l'ignorent.

::: warning
Gardez des globs restreints, par exemple `./src/**/*.{js,jsx,ts,tsx}` plutôt que `./**/*` : webpack et Rspack surveillent tout le répertoire dont part un glob, et un répertoire qui contient la sortie du build le relancerait encore et encore.
:::

### Turbopack (Next.js)

Turbopack s'arrête avec une erreur pour un chemin en dehors de sa racine, le plugin laisse donc de côté le contenu situé en dehors de cette racine. Il trouve la racine comme le fait Next.js lorsque ni `turbopack.root` ni `outputFileTracingRoot` ne sont définis : le répertoire le plus externe contenant un marqueur de workspace (`pnpm-workspace.yaml`, `lerna.json`, un `package.json` avec `workspaces`) ou à défaut un fichier de verrouillage, dans le dépôt git. Dans un monorepo, un contenu comme `../../packages/ui/src/**/*.tsx` est dans cette racine et est surveillé.

Si `next.config` définit `turbopack.root` ou `outputFileTracingRoot` (Next.js utilise `outputFileTracingRoot` lorsque les deux sont définis), passez le même répertoire dans [`dependencies: { root }`](#dependencies). Turbopack ne prend pas en charge la syntaxe de glob étendue, par exemple `*.@(ts|tsx)` : pour un tel glob, le plugin surveille tous les fichiers du répertoire dont il part, préférez donc `*.{ts,tsx}`.

### Modules CSS

Vite exécute [postcss-modules](https://github.com/madyankin/postcss-modules) avant les plugins PostCSS du projet, si bien que le plugin reçoit des modules CSS avec des noms de classes à portée locale, comme `._button_1x2y3_1`, alors que le contenu fait référence à `styles.button`. Depuis la version 9.1.0, le plugin lit les noms exportés par postcss-modules et garde les classes et ID à portée locale dont le nom local se trouve dans le contenu, ainsi que les classes qu'ils composent. Les autres sont supprimés, comme les classes globales inutilisées. Les valeurs définies avec `@value` ne sont pas prises pour des classes. Ajoutez au `content` les fichiers qui importent les modules CSS (par exemple `./src/**/*.{js,jsx,ts,tsx}`). Consultez [Modules CSS](../css_modules.md) pour les autres configurations.

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
  dependencies?: boolean | { root?: string };
  contentCache?: boolean;
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

### `dependencies`

Type : `boolean | { root?: string }`
Valeur par défaut : `true`

Ajoutée dans la version 9.1.0. Ajoute les [messages de dépendance](#purger-a-nouveau-quand-le-contenu-change) du contenu, afin que les serveurs de développement exécutent à nouveau le plugin lorsque le contenu change. Définissez-la à `false` pour n'ajouter aucun message, par exemple lorsqu'un bundler rejette un chemin du contenu. Définissez `root`, absolu ou relatif au répertoire de travail, pour laisser de côté le contenu en dehors de la racine du bundler ; sous Turbopack, elle vaut par défaut la racine que Next.js déduit.

```js
purgeCSSPlugin({
  content: ['../../packages/ui/src/**/*.tsx', './app/**/*.tsx'],
  dependencies: { root: '../..' } // la valeur de turbopack.root ou outputFileTracingRoot
})
```

### `contentCache`

Type : `boolean`
Valeur par défaut : `true`

Ajoutée dans la version 9.1.0. Garde les sélecteurs extraits des fichiers de contenu entre les fichiers CSS et les exécutions du plugin dans le processus : un fichier de contenu n'est relu et extrait à nouveau que lorsqu'il a changé. Définissez-la à `false` pour lire et extraire les fichiers de contenu pour chaque fichier CSS, par exemple avec un extracteur dont le résultat dépend d'autre chose que du fichier de contenu.
