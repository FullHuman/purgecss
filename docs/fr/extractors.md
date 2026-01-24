---
title: Extractors
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS s'appuie sur des extractors pour obtenir la liste des sélecteurs utilisés dans un fichier. Il existe plusieurs types de fichiers pouvant contenir des sélecteurs, tels que les fichiers HTML, les fichiers de templates comme Pug, ou même les fichiers JavaScript.
  - itemprop: description
    content: PurgeCSS s'appuie sur des extractors pour obtenir la liste des sélecteurs utilisés dans un fichier. Il existe plusieurs types de fichiers pouvant contenir des sélecteurs, tels que les fichiers HTML, les fichiers de templates comme Pug, ou même les fichiers JavaScript.
  - property: og:url
    content: https://purgecss.com/fr/extractors
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: fr_FR
  - property: og:title
    content: Supprimer le CSS inutilisé - PurgeCSS
  - property: og:description
    content: PurgeCSS s'appuie sur des extractors pour obtenir la liste des sélecteurs utilisés dans un fichier. Il existe plusieurs types de fichiers pouvant contenir des sélecteurs, tels que les fichiers HTML, les fichiers de templates comme Pug, ou même les fichiers JavaScript.
---

# Extractors

PurgeCSS peut être adapté à vos besoins. Si vous remarquez qu'une grande quantité de CSS inutilisé n'est pas supprimée, vous pourriez vouloir utiliser un extractor spécifique.

PurgeCSS s'appuie sur des extractors pour obtenir la liste des sélecteurs utilisés dans un fichier. Il existe plusieurs types de fichiers pouvant contenir des sélecteurs, tels que les fichiers HTML, les fichiers de templates comme Pug, ou même les fichiers JavaScript.

## Extractor par défaut

PurgeCSS fournit un extractor par défaut qui fonctionne avec tous les types de fichiers, mais qui peut être limité et ne pas correspondre exactement au type de fichiers ou au framework CSS que vous utilisez.

L'extractor par défaut considère chaque mot d'un fichier comme un sélecteur. L'extractor par défaut a quelques limitations :

- Ne prend pas en compte les caractères spéciaux tels que `@`, `:`, `/`

## Utiliser un extractor

Utiliser un extractor peut être utile si vous remarquez que PurgeCSS ne supprime pas assez de CSS inutilisé ou supprime du CSS utilisé.

Utiliser un extractor spécifique pour une extension devrait vous offrir la meilleure précision. Si vous voulez purger exclusivement des fichiers HTML, vous pourriez envisager l'extractor `purgecss-from-html`.

Vous pouvez utiliser un extractor en configurant l'option extractors dans le fichier de configuration de PurgeCSS.

```js
import { purgeCSSFromPug } from "purgecss-from-pug";
import { purgeCSSFromHtml } from "purgecss-from-html";

const options = {
  content: [], // fichiers desquels extraire les sélecteurs
  css: [], // css
  extractors: [
    {
      extractor: purgeCSSFromPug,
      extensions: ["pug"],
    },
    {
      extractor: purgeCSSFromHtml,
      extensions: ["html"],
    },
  ],
};
export default options;
```

## Créer un extractor

Un extractor est une simple fonction qui prend le contenu d'un fichier sous forme de chaîne de caractères et retourne un tableau de sélecteurs. Par convention, le nom du package npm est `purgecss-from-[typefichier]` \(par exemple purgecss-from-pug\). Cette convention permet aux utilisateurs de consulter la liste des extractors sur npm en recherchant `purgecss-from`.

La fonction peut retourner soit un tableau de sélecteurs (balises, classes, ids), soit l'objet ci-dessous pour une meilleure précision :

```ts
interface ExtractorResultDetailed {
  attributes: {
    names: string[];
    values: string[];
  };
  classes: string[];
  ids: string[];
  tags: string[];
  undetermined: string[];
}
```

```js
const purgeFromJs = (content) => {
  // retourne un tableau de sélecteurs CSS
};
```

## Liste des extractors disponibles (en cours)

::: warning
Ces extractors sont encore en cours de développement.
Il n'est pas recommandé de les utiliser en production pour le moment.
:::

- [purgecss-from-html](https://github.com/FullHuman/purgecss/blob/main/packages/purgecss-from-html) : Fichiers HTML (.html)
- [purgecss-from-jsx](https://github.com/FullHuman/purgecss/blob/main/packages/purgecss-from-jsx) : Fichiers JSX
- [purgecss-from-pug](https://github.com/FullHuman/purgecss/blob/main/packages/purgecss-from-pug) : Fichiers Pug (.pug)
