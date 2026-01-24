---
title: Vue
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS peut être utilisé avec Vue grâce au plugin webpack.
  - itemprop: description
    content: PurgeCSS peut être utilisé avec Vue grâce au plugin webpack.
  - property: og:url
    content: https://purgecss.com/fr/guides/vue
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
    content: PurgeCSS peut être utilisé avec Vue grâce au plugin webpack.
---

# Vue

## Utiliser le plugin Vue CLI

![vue cli plugin purgecss](https://i.imgur.com/ZYnJSin.png)

### Installation

Si vous n'avez pas encore installé vue-cli 3, suivez d'abord les instructions d'installation ici : https://github.com/vuejs/vue-cli

Générez un projet en utilisant vue-cli 3.0 :

```sh
vue create my-app
```

Avant d'installer le plugin PurgeCSS, assurez-vous de valider ou de mettre de côté vos modifications au cas où vous auriez besoin de revenir en arrière.

Pour installer le plugin PurgeCSS, naviguez simplement vers le dossier de votre application et ajoutez PurgeCSS.

```sh
cd my-app

vue add @fullhuman/purgecss
```

Le plugin PurgeCSS générera un fichier `postcss.config.js` avec PurgeCSS configuré. Vous pouvez ensuite modifier les options de PurgeCSS.

### Utilisation

Voici les options PurgeCSS définies par ce plugin :

```js
{
  content: [ `./public/**/*.html`, `./src/**/*.vue` ],
  defaultExtractor (content) {
    const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '')
    return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || []
  },
  safelist: [ /-(leave|enter|appear)(|-(to|from|active))$/, /^(?!(|.*?:)cursor-move).+-move$/, /^router-link(|-exact)-active$/, /data-v-.*/ ],
}
```
