---
title: Commencer
description: "Installez PurgeCSS et supprimez le CSS inutilisé avec la ligne de commande, l'API JavaScript ou un plugin PostCSS, webpack, Gulp ou Grunt."
lang: fr-FR
---

# Commencer

La plupart des bundlers et frameworks pour construire des sites web utilisent PostCSS. La façon la plus simple de configurer PurgeCSS est avec son plugin PostCSS.

PurgeCSS nécessite Node.js 22.12 ou une version ultérieure.

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
import purgeCSSPlugin from '@fullhuman/postcss-purgecss';

export default {
  plugins: [
    purgeCSSPlugin({
      content: ['./**/*.html']
    })
  ]
}
```

PurgeCSS supprimera le CSS qui n'est pas présent dans les fichiers spécifiés dans l'option `content`.

Vous pouvez trouver plus d'informations sur le plugin PostCSS et les options de configuration sur les pages suivantes :
- [Plugin PostCSS](/fr/plugins/postcss)
- [Configuration](/fr/configuration)
