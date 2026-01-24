---
title: Ant Design
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS peut être utilisé avec Ant Design mais nécessite de créer un extracteur CSS personnalisé.
  - itemprop: description
    content: PurgeCSS peut être utilisé avec Ant Design mais nécessite de créer un extracteur CSS personnalisé.
  - property: og:url
    content:  https://purgecss.com/fr/ant_design
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: fr_FR
  - property: og:title
    content: Supprimer le CSS inutilisé - PurgeCSS
  - property: og:description
    content: PurgeCSS peut être utilisé avec Ant Design mais nécessite de créer un extracteur CSS personnalisé.
---

# Comment utiliser avec Ant Design

::: tip
Le contenu de cette page provient de [cette issue](https://github.com/FullHuman/purgecss/issues/172#issuecomment-637045325).
:::

PurgeCSS fonctionne en comparant les sélecteurs de vos fichiers de contenu avec ceux de vos fichiers CSS. Lors de l'utilisation de bibliothèques de composants avec leur propre CSS, il arrive que le CSS soit supprimé car le contenu n'est pas trouvé. Vous devez alors spécifier où le contenu peut être trouvé.

Dans le cas d'ant-design, la liste des sélecteurs utilisés dans ant-design ne peut pas être facilement récupérée à partir de son contenu.

Voici une façon d'utiliser PurgeCSS avec Ant Design et React.
Le projet a été créé avec create-react-app. Ensuite, il utilise react-app-rewired pour étendre la configuration.


```js
const glob = require("glob-all");
const paths = require("react-scripts/config/paths");

const { override, addPostcssPlugins } = require("customize-cra");

const purgecss = require("@fullhuman/postcss-purgecss")({
  content: [
    paths.appHtml,
    ...glob.sync(`${paths.appSrc}/**/*.js`, { nodir: true }),
    ...glob.sync(`${paths.appNodeModules}/antd/es/button/**/*.css`, {
      nodir: true,
    }),
  ],
  extractors: [
    {
      extractor: (content) => content.match(/([a-zA-Z-]+)(?= {)/g) || [],
      extensions: ["css"],
    },
  ],
});

module.exports = override(
  addPostcssPlugins([
    ...(process.env.NODE_ENV === "production" ? [purgecss] : []),
  ])
);
```

J'ai essentiellement ajouté un chemin vers le fichier CSS d'antd que je veux conserver. Dans l'exemple ci-dessous, `button`.

```js
...glob.sync(`${paths.appNodeModules}/antd/es/button/**/*.css`,
```

Pour conserver antd entièrement, vous pouvez remplacer par
```js
...glob.sync(`${paths.appNodeModules}/antd/es/**/*.css`,
```

et j'ai écrit un extracteur pour les fichiers CSS qui a pour but de récupérer les sélecteurs depuis le fichier :
```js
  extractors: [
    {
      extractor: (content) => content.match(/([a-zA-Z-]+)(?= {)/g) || [],
      extensions: ["css"],
    },
  ],
```
