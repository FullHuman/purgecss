---
title: Commencer
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS est un outil pour supprimer le CSS inutilisé de votre projet. Il peut être utilisé dans votre flux de développement. PurgeCSS est disponible avec une API JavaScript, un CLI, et des plugins pour les outils de build populaires.
  - itemprop: description
    content: PurgeCSS est un outil pour supprimer le CSS inutilisé de votre projet. Il peut être utilisé dans votre flux de développement. PurgeCSS est disponible avec une API JavaScript, un CLI, et des plugins pour les outils de build populaires.
  - property: og:url
    content: https://purgecss.com
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
    content: PurgeCSS est un outil pour supprimer le CSS inutilisé de votre projet. Il peut être utilisé dans votre flux de développement. PurgeCSS est disponible avec une API JavaScript, un CLI, et des plugins pour les outils de build populaires.
---

# Commencer

La plupart des bundlers et frameworks pour construire des sites web utilisent PostCSS. La façon la plus simple de configurer PurgeCSS est avec son plugin PostCSS.

Installez le plugin PostCSS :

:::: code-tabs
@tab npm
```sh
npm i -D @fullhuman/postcss-purgecss
```
@tab yarn
```sh
yarn add @fullhuman/postcss-purgecss --dev
```
::::

et ajoutez le plugin PurgeCSS à la configuration PostCSS :

```js{1,5-7}
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';

module.exports = {
  plugins: [
    purgecss({
      content: ['./**/*.html']
    })
  ]
}
```

PurgeCSS supprimera le CSS qui n'est pas présent dans les fichiers spécifiés dans l'option `content`.

Vous pouvez trouver plus d'informations sur le plugin PostCSS et les options de configuration sur les pages suivantes :
- [Plugin PostCSS](/fr/plugins/postcss)
- [Configuration](/fr/configuration)
