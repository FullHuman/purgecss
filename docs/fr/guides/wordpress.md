---
title: WordPress
description: "PurgeCSS peut être utilisé pour le développement WordPress. Un module existe pour faciliter le processus et fournir des éléments de safelist courants."
lang: fr-FR
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

```js{2,7}
import { PurgeCSS } from 'purgecss'
import purgecssWordpress from 'purgecss-with-wordpress'

const purgeCSSResult = await new PurgeCSS().purge({
  content: ['**/*.html'],
  css: ['**/*.css'],
  safelist: purgecssWordpress.safelist
})
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
