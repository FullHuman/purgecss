---
title: Next.js
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS peut être utilisé avec Next.js grâce au plugin next-purgecss ou au plugin PostCSS.
  - itemprop: description
    content: PurgeCSS peut être utilisé avec Next.js grâce au plugin next-purgecss ou au plugin PostCSS.
  - property: og:url
    content:  https://purgecss.com/fr/guides/next
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
    content: PurgeCSS peut être utilisé avec Next.js grâce au plugin next-purgecss ou au plugin PostCSS.
---

# Next.js

> Next.js est un framework React pour des applications de qualité professionnelle qui passent à l'échelle. Les entreprises leaders mondiales utilisent Next.js pour construire des applications rendues côté serveur, des sites web statiques, et plus encore.

Vous pouvez utiliser PurgeCSS avec Next.js en utilisant le plugin PostCSS dans la configuration Next.js.

## Personnaliser la configuration PostCSS (Next.js >= 9.3)

Pour personnaliser la configuration PostCSS, créez un fichier postcss.config.js à la racine de votre projet.

> Attention : Lorsque vous définissez un fichier de configuration PostCSS personnalisé, Next.js désactive complètement le comportement par défaut. Assurez-vous de configurer manuellement toutes les fonctionnalités dont vous avez besoin, y compris [Autoprefixer](https://github.com/postcss/autoprefixer). Vous devez également installer manuellement tous les plugins inclus dans votre configuration personnalisée, c'est-à-dire `npm install postcss-flexbugs-fixes postcss-preset-env`.

> Par défaut, le document externe contenant `html` et `body` se trouve dans le module node de Next.js. Ajoutez `safelist:["html", "body"]` pour vous assurer que PurgeCSS ne supprime pas ces styles.

Ajoutez PurgeCSS à la configuration par défaut :

```js
module.exports = {
  "plugins": [
    "postcss-flexbugs-fixes",
    [
      "postcss-preset-env",
      {
        "autoprefixer": {
          "flexbox": "no-2009"
        },
        "stage": 3,
        "features": {
          "custom-properties": false
        }
      }
    ],
    [
      '@fullhuman/postcss-purgecss',
      {
        content: [
            './pages/**/*.{js,jsx,ts,tsx}',
            './components/**/*.{js,jsx,ts,tsx}'
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: ["html", "body"]
      }
    ],
  ]
}
```

## Plugin Next.js (Next.js < 9.3)

### Installation

`next-purgecss` nécessite l'un des **plugins css next** suivants :

- [next-css](https://github.com/zeit/next-plugins/tree/master/packages/next-css)
- [next-less](https://github.com/zeit/next-plugins/tree/master/packages/next-less)
- [next-sass](https://github.com/zeit/next-plugins/tree/master/packages/next-sass)

Choisissez simplement celui qui correspond à vos besoins. Dans les étapes suivantes, j'utiliserai `next-css` mais cela fonctionne de la même manière pour les autres **plugins css next**.

Par exemple, installez `next-css` et `next-purgecss` :

:::: code-group
::: code-group-item NPM
```sh
npm install @zeit/next-css next-purgecss --save-dev
```
:::
::: code-group-item YARN
```sh
yarn add @zeit/next-css next-purgecss --dev
```
:::
::::

Une fois les packages installés, vous devez modifier `next.config.js`.

```js
// next.config.js
const withCss = require("@zeit/next-css");
const withPurgeCss = require("next-purgecss");

module.exports = withCss(withPurgeCss());
```

### Options

#### `purgeCssEnabled`

Par défaut, `next-purgecss` supprimera toujours le CSS inutilisé, quel que soit l'environnement de build. Vous pouvez changer cela en définissant une fonction pour l'option `purgeCssEnabled`. La fonction `purgeCssEnabled` reçoit deux arguments :

| Argument   | Type      | Description                                                                                      |
| ---------- | --------- | ------------------------------------------------------------------------------------------------ |
| `dev`      | `Boolean` | `true` en mode développement (exécution de `next`) ou `false` en mode production (exécution de `next start`) |
| `isServer` | `Boolean` | `true` pendant la compilation côté serveur ou `false` pendant la compilation côté client                  |

```js
// next.config.js
module.exports = withCss(
  withPurgeCss({
    purgeCssEnabled: ({ dev, isServer }) => !dev && !isServer, // Activer PurgeCSS uniquement pour les builds de production côté client
  })
);
```

#### `purgeCssPaths`

Par défaut, ce plugin analysera les répertoires `components` et `pages` pour les noms de classes. Vous pouvez changer cela en définissant `purgeCssPaths`.

```js
// next.config.js
module.exports = withCss(
  withPurgeCss({
    purgeCssPaths: [
      "pages/**/*",
      "components/**/*",
      "other-components/**/*", // analyser également le dossier other-components
    ],
  })
);
```

#### `purgeCss`

Vous pouvez passer des options personnalisées à [PurgeCSS](https://github.com/FullHuman/purgecss-webpack-plugin) en définissant l'objet `purgeCss` dans votre `next.config.js`.

```js
// next.config.js
module.exports = withCss(
  withPurgeCss({
    purgeCss: {
      whitelist: () => ["my-custom-class"],
    },
  })
);
```

La liste des options disponibles est documentée dans la [documentation de `purgecss-webpack-plugin`](https://github.com/FullHuman/purgecss-webpack-plugin#options).

::: warning
`purgeCss.paths` écrasera `purgeCssPaths`
:::
