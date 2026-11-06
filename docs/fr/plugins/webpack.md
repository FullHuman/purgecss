---
title: Webpack
description: "Supprimez le CSS inutilisé de vos builds webpack avec purgecss-webpack-plugin : installation, configuration webpack et options du plugin."
lang: fr-FR
---

# Webpack

:::tip
Vous pouvez utiliser soit le plugin Webpack directement dans votre configuration webpack, soit utiliser le [plugin PostCSS](postcss.md) lorsque vous utilisez le loader postCSS de Webpack.
:::

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

## Options

Le plugin webpack transmet à PurgeCSS les options suivantes de la [Configuration](https://www.purgecss.com/fr/configuration.html) de purgecss : `defaultExtractor`, `extractors`, `fontFace`, `keyframes`, `variables`, `safelist`, `blocklist`, `dynamicAttributes` et `rejected`. Le plugin purge les ressources CSS de la compilation et utilise `paths` comme contenu, il ne prend donc pas les options `css` et `content`. Les source maps sont générées lorsque l'option `devtool` de webpack est définie. Les autres options, comme `rejectedCss` ou `skippedContentGlobs`, n'ont aucun effet.

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

Si vous souhaitez régénérer la liste des chemins à chaque compilation (par exemple lors de l'utilisation de `--watch`), vous pouvez également passer une fonction à l'option `paths` comme dans l'exemple suivant :

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

Lorsque cette option est définie sur `true`, tous les sélecteurs supprimés sont ajoutés aux [Stats Data](https://webpack.js.org/api/stats/) sous le nom `purged`.
