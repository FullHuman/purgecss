---
title: Nuxt.js
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS peut être utilisé avec Nuxt.js grâce au plugin nuxt-purgecss ou au plugin PostCSS.
  - name: keywords
    content: PurgeCSS Nuxt.js Nuxt plugin postCSS nuxt-purgecss

  - name: description
    content: PurgeCSS peut être utilisé avec Nuxt.js grâce au plugin nuxt-purgecss ou au plugin PostCSS.
  - itemprop: description
    content: PurgeCSS peut être utilisé avec Nuxt.js grâce au plugin nuxt-purgecss ou au plugin PostCSS.
  - property: og:url
    content:  https://purgecss.com/fr/guides/nuxt
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
    content: PurgeCSS peut être utilisé avec Nuxt.js grâce au plugin nuxt-purgecss ou au plugin PostCSS.
---

# Nuxt.js

> Nuxt.js prédéfinit toute la configuration nécessaire pour rendre le développement d'une application Vue.js agréable. Nuxt.js peut produire des applications universelles, monopages et générées statiquement.

Vous pouvez utiliser PurgeCSS avec Nuxt.js en utilisant le [plugin Nuxt.js](https://github.com/Developmint/nuxt-purgecss) ou le plugin PostCSS.

## Plugin Nuxt.js

Vous pouvez utiliser un module communautaire appelé [nuxt-purgecss](https://github.com/Developmint/nuxt-purgecss) pour faciliter au maximum l'utilisation de PurgeCSS avec Nuxt. Avec ses paramètres par défaut adaptés, vous n'avez besoin d'apporter que quelques modifications (ou aucune) à la configuration.

### Installation

- Ajoutez la dépendance `nuxt-purgecss` à votre projet en utilisant yarn ou npm
- Ajoutez `nuxt-purgecss` à la section `modules` de `nuxt.config.js` ou `nuxt.config.ts` :

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-purgecss',
  ],

  purgecss: {
    // vos paramètres ici
  }
})
```

Si vous utilisez Nuxt 2, utilisez `nuxt-purgecss` v1.x et l'ancienne configuration `buildModules`. `nuxt-purgecss` v2.x cible Nuxt 3 et utilise la clé de configuration `purgecss`.

### Options

#### Valeurs par défaut

Avant d'examiner les attributs individuels, voici les paramètres par défaut du module (voir [`src/config.ts`](https://github.com/Developmint/nuxt-purgecss/blob/main/src/config.ts) pour la version actuelle) :

```js
{
  enabled: !nuxt.options.dev,
  content: [
    'components/**/*.{vue,jsx?,tsx?}',
    'layouts/**/*.{vue,jsx?,tsx?}',
    'pages/**/*.{vue,jsx?,tsx?}',
    'composables/**/*.{vue,jsx?,tsx?}',
    'App.{vue,jsx?,tsx?}',
    'app.{vue,jsx?,tsx?}',
    'plugins/**/*.{js,ts}',
    'nuxt.config.{js,ts}'
  ],
  defaultExtractor: (content) => {
    const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '') // Remove inline vue styles
    return contentWithoutStyleBlocks.match(/[\w-.:/]+(?<!:)/g) || [] // Default extractor
  },
  safelist: [
    'body',
    'html',
    'nuxt-progress',
    '__nuxt',
    /-(leave|enter|appear)(|-(to|from|active))$/, // Normal transitions
    /^nuxt-link(|-exact)-active$/, // Nuxt link classes
    /^(?!cursor-move).+-move$/, // Move transitions
    /.*data-v-.*/, // Keep scoped styles
    // New Vue3 selectors
    /:slotted/,
    /:deep/,
    /:global/,
    /nuxt-devtools-.*/
  ]
}
```

Ces paramètres devraient constituer une bonne base pour une variété de projets.

#### Fusion des valeurs par défaut

Vos options sont fusionnées avec les valeurs par défaut à l'aide de [`defu`](https://github.com/unjs/defu). Écrivez vos valeurs normalement : les tableaux comme `content` et `safelist` s'ajoutent à ceux par défaut, et les autres options remplacent leur valeur par défaut.

#### Propriétés en détail

##### enabled

* Type : `Boolean`
* Défaut : `!nuxt.options.dev` (désactivé pendant `nuxt dev`, activé pour les builds)

Active/Désactive le module

* S'il est évalué à false, le module ne sera pas activé du tout

##### Options PurgeCSS

Veuillez lire [la documentation PurgeCSS](https://www.purgecss.com/fr/configuration) pour obtenir des informations sur les paramètres liés à PurgeCSS.

Toutes les options de PurgeCSS peuvent être écrites directement dans l'objet `purgecss`. Si vous ajoutez des composants ou des pages en dehors des dossiers Nuxt par défaut, incluez-les dans `content`.

## Plugin PostCSS

En utilisant l'option *extractCSS*, Nuxt créera des fichiers CSS qui seront chargés séparément par le navigateur.
Lors de la génération de votre application, cela peut représenter beaucoup de petits fichiers.

Pour inclure le CSS dans l'en-tête du fichier HTML, vous devrez exécuter les commandes suivantes.
Veuillez noter qu'avec cette configuration, PurgeCSS sera actif en mode production et développement.

::::: code-tabs
@tab npm
```sh
npm i -D @fullhuman/postcss-purgecss
```
@tab yarn
```sh
yarn add @fullhuman/postcss-purgecss --dev
```
:::::

```js
'@fullhuman/postcss-purgecss': {
  content: ['./pages/**/*.vue', './layouts/**/*.vue', './components/**/*.vue'],
  safelist: ['html', 'body']
}
```
