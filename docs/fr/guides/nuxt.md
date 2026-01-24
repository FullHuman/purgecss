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
- Ajoutez `nuxt-purgecss` à la section `modules` de `nuxt.config.js` :

```js
{
  buildModules: [ // si vous utilisez nuxt < 2.9.0, utilisez la propriété modules à la place.
    'nuxt-purgecss',
  ],

  purgeCSS: {
   // vos paramètres ici
  }
}
```

### Options

#### Valeurs par défaut

Avant d'examiner les attributs individuels, voici les paramètres par défaut du module :

```js
{
  mode: MODES.webpack,
  enabled: ({ isDev, isClient }) => (!isDev && isClient), // ou `false` en mode dev/debug
  paths: [
    'components/**/*.vue',
    'layouts/**/*.vue',
    'pages/**/*.vue',
    'plugins/**/*.js'
  ],
  styleExtensions: ['.css'],
  whitelist: ['body', 'html', 'nuxt-progress'],
  extractors: [
    {
      extractor: content => content.match(/[A-z0-9-:\\/]+/g) || [],
      extensions: ['html', 'vue', 'js']
    }
  ]
}
```

Ces paramètres devraient constituer une bonne base pour une variété de projets.

#### Fusion des valeurs par défaut

Vous pouvez définir chaque option soit comme fonction, soit comme valeur statique (primitives, objets, tableaux, ...).
Si vous utilisez une fonction, la valeur par défaut sera fournie comme premier argument.

Si vous *n'utilisez pas* de fonction pour définir vos propriétés, le module essaiera de les fusionner avec les valeurs par défaut. Cela peut être pratique pour `paths`, `whitelist` et ainsi de suite car les valeurs par défaut sont assez sensées. Si vous ne voulez pas inclure les valeurs par défaut, utilisez simplement une fonction.

#### Propriétés en détail

##### mode

* Type : `String` (webpack ou postcss)
* Défaut : `webpack`

Définit le mode dans lequel PurgeCSS doit être utilisé.

* Le mode Webpack ne peut être utilisé qu'avec `build.extractCSS: true`
* Le mode PostCSS ne peut être utilisé qu'avec un **objet** `build.postcss` (pas un tableau) ou les paramètres par défaut

##### enabled

* Type : `Boolean` ou `Function` (uniquement pour le mode webpack, recevra le ctx de build.extend)
* Défaut : `({ isDev, isClient }) => (!isDev && isClient)` (s'active uniquement en mode production) ou `false` en mode debug/dev

Active/Désactive le module

* S'il est évalué à false, le module ne sera pas activé du tout
* Si une fonction est fournie, elle sera correctement évaluée en mode webpack (en mode postcss, elle sera traitée comme true)


##### Options PurgeCSS

Veuillez lire [la documentation PurgeCSS](https://www.purgecss.com/fr/configuration) pour obtenir des informations sur les paramètres liés à PurgeCSS.

Au lieu de `content`, nous utilisons `paths` pour spécifier les chemins que PurgeCSS doit examiner (expliqué [ici](https://www.purgecss.com/with-webpack#options)).
Cela s'applique aux **deux modes**, pas seulement au `mode webpack`.

## Plugin PostCSS

En utilisant l'option *extractCSS*, Nuxt créera des fichiers CSS qui seront chargés séparément par le navigateur.
Lors de la génération de votre application, cela peut représenter beaucoup de petits fichiers.

Pour inclure le CSS dans l'en-tête du fichier HTML, vous devrez exécuter les commandes suivantes.
Veuillez noter qu'avec cette configuration, PurgeCSS sera actif en mode production et développement.

:::: code-group
::: code-group-item NPM
```sh
npm i -D @fullhuman/postcss-purgecss
```
:::
::: code-group-item YARN
```sh
yarn add @fullhuman/postcss-purgecss --dev
```
:::
::::

```js
'@fullhuman/postcss-purgecss': {
  content: ['./pages/**/*.vue', './layouts/**/*.vue', './components/**/*.vue'],
  safelist: ['html', 'body']
}
```
