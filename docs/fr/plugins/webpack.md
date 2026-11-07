---
title: Webpack
description: "Supprimez le CSS inutilisé de vos builds webpack et Rspack avec purgecss-webpack-plugin : installation, configuration, modules CSS, mode watch et options du plugin."
lang: fr-FR
---

# Webpack

:::tip
Vous pouvez utiliser soit le plugin Webpack directement dans votre configuration webpack, soit utiliser le [plugin PostCSS](postcss.md) lorsque vous utilisez le loader postCSS de Webpack.
:::

Le plugin fonctionne avec webpack 5 et, depuis la version 9.1.0, avec Rspack 1 et 2.

## Installation

```sh
npm i purgecss-webpack-plugin -D
```

## Utilisation

### Avec mini-css-extract-plugin

```js
const path = require("path");
const glob = require("glob");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");

const PATHS = {
  src: path.join(__dirname, "src"),
};

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "dist"),
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          test: /\.css$/,
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
    }),
  ],
};
```

### Chemins multiples

Si vous avez besoin de plusieurs chemins, utilisez le package npm `glob-all` au lieu de `glob`, puis vous pouvez utiliser cette syntaxe :

```js
new PurgeCSSPlugin({
  paths: glob.sync([
    // ...
  ])
}),
```

pour filtrer les répertoires, consultez la documentation de glob-all [ici](https://www.npmjs.com/package/glob-all#filtering-out-directories).

### Avec Rspack

Depuis la version 9.1.0, le plugin fonctionne avec Rspack sans que webpack soit installé : il utilise les classes du compilateur qui l'exécute (`compiler.webpack`), et ses déclarations TypeScript ne dépendent pas de webpack. `webpack` et `@rspack/core` sont des peer dependencies optionnelles. Utilisez-le avec `CssExtractRspackPlugin`, ou avec la prise en charge native du CSS de Rspack (`type: "css/auto"`).

```js
const path = require("path");
const glob = require("glob");
const { rspack } = require("@rspack/core");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [rspack.CssExtractRspackPlugin.loader, "css-loader"],
        type: "javascript/auto",
      },
    ],
  },
  plugins: [
    new rspack.CssExtractRspackPlugin(),
    new PurgeCSSPlugin({
      paths: glob.sync(`${path.join(__dirname, "src")}/**/*`, { nodir: true }),
    }),
  ],
};
```

### Avec Next.js

Next.js 16 compile avec Turbopack par défaut, qui n'exécute pas les plugins webpack. Compilez avec webpack pour utiliser le plugin : `next build --webpack` (et `next dev --webpack`), avec le plugin ajouté dans la fonction `webpack` de `next.config.js`. Pour purger le CSS sous Turbopack, utilisez plutôt le [plugin PostCSS](postcss.md#turbopack-next-js).

## Comment le CSS est purgé

Le plugin purge les ressources CSS des chunks dans le hook `processAssets`, à l'étape `PROCESS_ASSETS_STAGE_ADDITIONAL`. Les plugins qui dérivent des ressources du CSS à une étape ultérieure lisent le CSS purgé, et le CSS est purgé avant les minificateurs CSS (`PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE`), l'extraction des source maps et le calcul des hash de contenu.

Depuis la version 9.1.0, les fichiers de contenu de `paths` sont lus et leurs sélecteurs extraits une fois par compilation, pour toutes les ressources CSS, au lieu d'une fois par ressource.

Lorsque l'option `devtool` génère des source maps, les source maps du CSS purgé pointent vers les fichiers CSS d'origine.

### Mode watch

En mode watch (`--watch`, webpack-dev-server, `rspack dev`), les fichiers de contenu sont surveillés depuis la version 9.1.0 : une modification de l'un d'eux déclenche une nouvelle compilation, même s'il n'est pas importé par le code JavaScript, et seuls les fichiers modifiés depuis la compilation précédente sont relus et extraits à nouveau. Les répertoires ne sont pas surveillés : lorsque `paths` est une fonction, un nouveau fichier fait partie du contenu à partir de la compilation suivante, une fois que quelque chose d'autre l'a déclenchée. Un fichier de contenu qui n'existe pas est signalé comme une erreur de la compilation, et la compilation est relancée une fois le fichier créé.

Le watcher du bundler applique ses propres options aux fichiers de contenu. Lorsqu'un fichier de contenu est un lien symbolique, par exemple un fichier d'un package du workspace lié dans `node_modules`, le plugin surveille aussi sa cible. Rspack ignore par défaut les modifications des fichiers de `node_modules` (`watchOptions.ignored`), y compris les fichiers de contenu.

::: tip
Avec webpack-dev-server, lorsque seul un fichier de contenu en dehors du graphe de modules a changé (par exemple un template HTML), le CSS est purgé à nouveau mais le hash de la compilation reste le même, si bien que webpack-dev-server ne prévient pas le navigateur : rechargez la page pour voir le nouveau CSS. Avec Rspack, le hash change.
:::

## Modules CSS

Les noms de classes des [modules CSS](https://github.com/css-modules/css-modules) sont hashés (`.modUsed` devient `.card-module__modUsed--VlNeS`), alors que le contenu utilise le nom de l'export (`styles.modUsed`). Depuis la version 9.1.0, le plugin lit la table des exports de chaque module CSS des chunks purgés et garde les noms de classes hashés dont le nom d'export se trouve dans le contenu, ainsi que les classes qu'ils composent. Les autres classes des modules CSS sont supprimées, comme les classes globales inutilisées. Avant la version 9.1.0, toutes les classes hashées étaient supprimées.

Les tables des exports sont lues depuis :

- le module JavaScript que mini-css-extract-plugin ou `CssExtractRspackPlugin` (Rspack 1.1 ou ultérieur) génère pour un module CSS (`css-loader` avec `modules`) ;
- le code JavaScript généré par la prise en charge native du CSS de Rspack 1.3 ou ultérieur (`type: "css/auto"`). En production, avec `optimization.usedExports`, Rspack ne génère que les exports utilisés par le code JavaScript : ils sont tous gardés ;
- les exports de la prise en charge native du CSS de webpack 5.97 ou ultérieur (`experiments.css` avec `type: "css/auto"`). Avec les versions antérieures, des classes utilisées des modules CSS peuvent être supprimées.

Un nom d'export est trouvé dans le contenu lorsque l'extracteur le renvoie comme sélecteur, comme le fait l'extracteur par défaut pour `styles.modUsed`, ou lorsqu'il est un mot d'un sélecteur : un extracteur qui renvoie `styles.modUsed` comme un seul sélecteur, comme l'extracteur de Tailwind CSS, garde aussi les classes de `modUsed`. Les ressources JavaScript des chunks ne sont pas ajoutées au contenu, car elles listent tous les exports des modules CSS, utilisés ou non.

## Fichier de configuration

Le plugin lit aussi les options de `purgecss.config.js` si ce fichier se trouve dans le répertoire de travail, le dossier où vous lancez webpack. Les options passées au plugin ont la priorité sur celles du fichier de configuration, `safelist` comprise : une `safelist` dans les options du plugin remplace celle de `purgecss.config.js`. Comme pour les options du plugin, `content` et `css` ne sont pas utilisées, le contenu vient de `paths`.

```js
// purgecss.config.js
module.exports = {
  safelist: ['active', /^modal-/]
}
```

Si `purgecss.config.js` existe mais ne peut pas être chargé, par exemple à cause d'une erreur de syntaxe, le build échoue avec `Error loading the config file ...`.

::: warning
Jusqu'à la version 8.0.0, les options exportées avec `module.exports = { ... }` ou `export default { ... }` sont ignorées, tout comme un fichier de configuration qui ne peut pas être chargé.
:::

## Options

Le plugin webpack transmet à PurgeCSS les options suivantes de la [Configuration](https://www.purgecss.com/fr/configuration.html) de purgecss : `defaultExtractor`, `extractors`, `fontFace`, `keyframes`, `variables`, `safelist`, `blocklist`, `dynamicAttributes` et `rejected`. Le plugin purge les ressources CSS de la compilation et utilise `paths` comme contenu, il ne prend donc pas les options `css` et `content`. Les source maps sont générées lorsque l'option `devtool` de webpack est définie, et gardent les fichiers CSS d'origine comme sources. Les autres options, comme `rejectedCss` ou `skippedContentGlobs`, n'ont aucun effet.

- #### paths

Avec le plugin webpack, vous pouvez spécifier le contenu qui doit être analysé par purgecss en fournissant un tableau de noms de fichiers. Il peut s'agir de fichiers html, pug, blade, etc. Vous pouvez également utiliser un module comme `glob` ou `glob-all` pour obtenir facilement une liste de fichiers.

> Vous devrez probablement passer `{ nodir: true }` comme option à `glob.sync()` car `glob.sync` correspond à un répertoire sur lequel le plugin ne peut pas opérer.

```js
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const glob = require("glob");
const PATHS = {
  src: path.join(__dirname, "src"),
};

// Dans la configuration webpack
new PurgeCSSPlugin({
  paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
});
```

Si vous souhaitez régénérer la liste des chemins à chaque compilation (par exemple lors de l'utilisation de `--watch`), vous pouvez également passer une fonction à l'option `paths` comme dans l'exemple suivant. Les fichiers qui n'ont pas changé depuis la compilation précédente ne sont pas relus :

```js
new PurgeCSSPlugin({
  paths: () => glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
});
```

- #### only

Vous pouvez spécifier les noms des chunks au plugin purgecss-webpack-plugin avec l'option `only` :

```js
new PurgeCSSPlugin({
  paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
  only: ["bundle", "vendor"],
});
```

Les noms sont comparés aux noms des chunks (pour un point d'entrée, sa clé dans `entry`), et non aux noms des fichiers.

- #### safelist

Comme pour l'option `paths`, vous pouvez également définir une fonction pour cette option :

```js
function collectSafelist() {
  return {
    standard: ["safelisted", /^safelisted-/],
    deep: [/^safelisted-deep-/],
    greedy: [/^safelisted-greedy/],
  };
}

// Dans la configuration webpack
new PurgeCSSPlugin({
  safelist: collectSafelist,
});
```

- #### rejected

Si `true`, les sélecteurs supprimés de chaque ressource CSS sont stockés dans la propriété `purgedStats` de l'instance du plugin, un objet dont les clés sont les noms des ressources. Ils ne sont pas ajoutés aux [Stats Data](https://webpack.js.org/api/stats/) de webpack.

```js
const purgeCSSPlugin = new PurgeCSSPlugin({ paths, rejected: true });
// après la compilation
console.log(purgeCSSPlugin.purgedStats["main.css"]);
```
