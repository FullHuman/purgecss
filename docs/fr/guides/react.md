---
title: React
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS peut être utilisé avec React.js en utilisant craco, un script postbuild ou en éjectant create-react-app.
  - itemprop: description
    content: PurgeCSS peut être utilisé avec React.js en utilisant craco, un script postbuild ou en éjectant create-react-app.
  - property: og:url
    content: https://purgecss.com/fr/guides/react
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
    content: PurgeCSS peut être utilisé avec React.js en utilisant craco, un script postbuild ou en éjectant create-react-app.
---

# React

> React est une bibliothèque JavaScript pour créer des interfaces utilisateur. Create React App est un environnement confortable pour apprendre React, et c'est la meilleure façon de commencer à construire une nouvelle application monopage en React.

Ce guide suppose que vous utilisez create-react-app pour construire votre application React monopage.

## Méthode 1 : Utiliser `craco`

Des plugins PostCSS personnalisés (y compris PurgeCSS) peuvent être ajoutés aux applications Create React App en utilisant [craco](https://github.com/gsoft-inc/craco/). Suivez les [instructions d'installation de craco](https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#installation), puis installez le plugin PostCSS `PurgeCSS` et ajoutez-le à la configuration craco :

```sh
npm i --save-dev @fullhuman/postcss-purgecss
```

```js
// craco.config.js
const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
  style: {
    postcss: {
      plugins: [
        purgecss({
          content: ["./src/**/*.html", "./src/**/*.tsx", "./src/**/*.ts"],
        }),
      ],
    },
  },
};
```

## Méthode 2 : Exécuter PurgeCSS CLI dans `postbuild`

Ajoutez le code suivant dans **package.json**

```json
"scripts": {
  "postbuild": "purgecss --css build/static/css/*.css --content build/index.html build/static/js/*.js --output build/static/css"
},
```

## Méthode 3 : `eject` de create-react-app

Vous devez [éjecter](https://facebook.github.io/create-react-app/docs/available-scripts#npm-run-eject) afin d'exposer la configuration webpack offerte par create-react-app original.

Installez le plugin webpack pour PurgeCSS :

```sh
npm i --save-dev glob-all purgecss-webpack-plugin
```

Maintenant, modifiez le fichier `config/webpack.prod.conf.js` en ajoutant le code suivant avec le reste des imports :

```js
// importer le plugin webpack PurgeCSS et glob-all
const { PurgecssPlugin } = require("purgecss-webpack-plugin");
const glob = require("glob-all");
```

...et directement avant `new ManifestPlugin(...)` dans la liste des plugins, ajoutez ceci :

```js
    // Supprimer le CSS inutilisé avec PurgeCSS. Voir https://github.com/FullHuman/purgecss
    // pour plus d'informations sur PurgeCSS.
    // Spécifiez le chemin des fichiers html et des fichiers sources
    new PurgecssPlugin({
      paths: [paths.appHtml, ...glob.sync(`${paths.appSrc}/**/*`, { nodir: true })]
    }),
```
