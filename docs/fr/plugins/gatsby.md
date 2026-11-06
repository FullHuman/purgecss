---
title: Gatsby
description: "PurgeCSS peut être utilisé avec Gatsby grâce au plugin gatsby-plugin-purgecss."
lang: fr-FR
---

# Gatsby

::: tip
Ce plugin a été créé par [@anantoghosh](https://github.com/anantoghosh) et cette page est un extrait du ReadMe.
Vous pouvez trouver plus d'informations sur [le dépôt du plugin](https://github.com/anantoghosh/gatsby-plugin-purgecss)
:::

Vous pouvez supprimer le CSS inutilisé des fichiers et modules css/sass/less/stylus dans votre projet Gatsby en utilisant PurgeCSS. Compatible avec tailwind, bootstrap, bulma, etc.

::: warning
Ce n'est PAS un plugin de type « installer et oublier ». Par défaut, il peut également supprimer des styles nécessaires.
:::

📘 [Lire la dernière documentation ici.](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md) • [Journal des modifications](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/CHANGELOG.md) •

### Démonstration
Lors de l'utilisation dans [gatsby-starter-bootstrap](https://github.com/jaxx2104/gatsby-starter-bootstrap)

![demo](https://anantoghosh.github.io/files/gatsby-starter-bootstrap.png)

Lors de l'utilisation dans [gatsby-starter-bootstrap-cv](https://github.com/mhjadav/gatsby-starter-bootstrap-cv) (installé par défaut)

![demo](https://anantoghosh.github.io/files/gatsby-starter-bootstrap-cv.png)
## Fichiers supportés

- `.css` , `.module.css`
- `.scss`, `.sass`, `.module.scss`, `.module.sass` (via [gatsby-plugin-sass](https://next.gatsbyjs.org/packages/gatsby-plugin-sass/))
- `.less`, `.module.less` (via [gatsby-plugin-less](https://next.gatsbyjs.org/packages/gatsby-plugin-less/))
- `.styl`, `.module.styl` (via [gatsby-plugin-stylus](https://next.gatsbyjs.org/packages/gatsby-plugin-sass/))

## Installation

```sh
npm i gatsby-plugin-purgecss
```

### Utilisation

> **Ajoutez le plugin APRÈS les autres plugins css/postcss**

```js
// gatsy-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-stylus`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-less`,
    `gatsby-plugin-postcss`,
    // Ajouter après ces plugins s'ils sont utilisés
    { 
      resolve: `gatsby-plugin-purgecss`,
      options: {
        printRejected: true, // Affiche les sélecteurs supprimés et les noms des fichiers traités
        // develop: true, // Activer lors de l'utilisation de `gatsby develop`
        // tailwind: true, // Activer le support de tailwindcss
        // whitelist: ['whitelist'], // Ne pas supprimer ce sélecteur
        // ignore: ['/ignored.css', 'prismjs/', 'docsearch.js/'], // Ignorer les fichiers/dossiers
        // purgeOnly : ['components/', '/main.css', 'bootstrap/'], // Purger uniquement ces fichiers/dossiers
      }
    }
  ]
};
```

## En résumé
* Définissez les options dans `gatsby-config.js`, pas dans `purgecss.config.js`.
* Si vous utilisez tailwindcss, utilisez l'[option `tailwind: true`](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md#tailwind).
* Utilisez l'option [`printRejected: true`](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md#printrejected) pour afficher les sélecteurs supprimés.
* Seuls les fichiers traités par Webpack seront purgés.
* `my-selector` ne correspondra pas à `mySelector`.
* Ajoutez à la liste blanche les sélecteurs requis ou ignorez les fichiers/dossiers en utilisant le guide [Solutions de liste blanche](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md#whitelist-solutions).
* Ignorez des packages complets avec [`ignore: ['packagename/']`](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md#ignore).
* Pour purger uniquement des fichiers/packages spécifiques, utilisez [`purgeOnly: ['fileOrPackage/']`](https://github.com/anantoghosh/gatsby-plugin-purgecss/blob/master/README.md#purgeOnly).
* Seuls les fichiers `js, jsx, ts, tsx` sont analysés pour les sélecteurs par défaut. Si vous souhaitez ajouter `md` ou `mdx`, utilisez `content: [path.join(process.cwd(), 'src/**/!(*.d).{ts,js,jsx,tsx,md,mdx}')]` ou mieux encore, ajoutez simplement les sélecteurs requis à la liste blanche.
