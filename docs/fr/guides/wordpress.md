---
title: WordPress
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS peut être utilisé pour le développement WordPress. Un module existe pour faciliter le processus et fournir des éléments de safelist courants.
  - itemprop: description
    content: PurgeCSS peut être utilisé pour le développement WordPress. Un module existe pour faciliter le processus et fournir des éléments de safelist courants.
  - property: og:url
    content:  https://purgecss.com/fr/guides/wordpress
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
    content: PurgeCSS peut être utilisé pour le développement WordPress. Un module existe pour faciliter le processus et fournir des éléments de safelist courants.
---

# WordPress

Si vous souhaitez utiliser PurgeCSS avec WordPress, vous pourriez avoir besoin de mettre en safelist les classes générées par WordPress pour éviter qu'elles soient supprimées par PurgeCSS. `purgecss-with-wordpress` contient les classes qui doivent être mises en safelist.

## Installation

Vous devez d'abord installer [purgecss](https://github.com/FullHuman/purgecss).

Installez `purgecss-with-wordpress` :
```sh
npm i --save-dev purgecss-with-wordpress
```

## Utilisation

```js{2,7,8}
import Purgecss from 'purgecss'
import purgecssWordpress from 'purgecss-with-wordpress'

const purgeCss = new Purgecss({
  content: ['**/*.html'],
  css: ['**/*.css'],
  safelist: purgecssWordpress.safelist
})
const result = purgecss.purge()
```

Si vous avez des classes supplémentaires que vous souhaitez inclure, vous pouvez les inclure en utilisant l'opérateur de décomposition :

```js
{
  safelist: [
    ...purgecssWordpress.safelist,
    'red',
    'blue',
    /^red/,
    /blue$/,
  ]
}
```
