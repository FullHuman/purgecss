---
title: Webpack
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez l'utiliser avec webpack grâce à un plugin.
  - itemprop: description
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez l'utiliser avec webpack grâce à un plugin.
  - property: og:url
    content: https://purgecss.com/fr/plugins/webpack
  - property: og:site_name
    content: purgecss.com
  - property: og:type
    content: website
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: fr_FR
  - property: og:title
    content: Supprimer le CSS inutilisé - PurgeCSS
  - property: og:description
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez l'utiliser avec webpack grâce à un plugin.
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

Les options disponibles dans la [Configuration](https://www.purgecss.com/fr/configuration.html) de purgecss sont également disponibles dans le plugin webpack, à l'exception des options `css` et `content`.

- #### paths

Avec le plugin webpack, vous pouvez spécifier le contenu qui doit être analysé par purgecss en fournissant un tableau de noms de fichiers. Il peut s'agir de fichiers html, pug, blade, etc. Vous pouvez également utiliser un module comme `glob` ou `glob-all` pour obtenir facilement une liste de fichiers.

> Vous devrez probablement passer `{ noDir: true }` comme option à `glob.sync()` car `glob.sync` correspond à un répertoire sur lequel le plugin ne peut pas opérer.

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
