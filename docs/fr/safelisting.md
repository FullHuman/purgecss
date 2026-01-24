---
title: Safelisting
lang: fr-FR
meta:
  - name: description
    content: Pour éviter que PurgeCSS supprime du CSS inutilisé que vous souhaitez conserver, vous pouvez ajouter des sélecteurs à la safelist.
  - itemprop: description
    content: Pour éviter que PurgeCSS supprime du CSS inutilisé que vous souhaitez conserver, vous pouvez ajouter des sélecteurs à la safelist.
  - property: og:url
    content:  https://purgecss.com/fr/safelisting
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: fr_FR
  - property: og:title
    content: Supprimer le CSS inutilisé - PurgeCSS
  - property: og:description
    content: Pour éviter que PurgeCSS supprime du CSS inutilisé que vous souhaitez conserver, vous pouvez ajouter des sélecteurs à la safelist.
---

::: tip
Cette documentation concerne PurgeCSS 3.0 et versions ultérieures. Pour consulter la documentation de PurgeCSS 2.x, cliquez [ici](https://github.com/FullHuman/purgecss/tree/5314e41edf328e2ad2639549e1587b82a964a42e/docs)
:::

# Safelisting

Vous pouvez indiquer quels sélecteurs peuvent être conservés en toute sécurité dans le CSS final. Cela peut être accompli avec l'option PurgeCSS `safelist`, ou directement dans votre CSS avec un commentaire spécial.

## Sélecteurs spécifiques

Vous pouvez ajouter des sélecteurs à la safelist avec `safelist`.

```js
const purgecss = new Purgecss({
    content: [], // contenu
    css: [], // css
    safelist: ['random', 'yep', 'button']
})
```

Dans cet exemple, les sélecteurs `.random`, `#yep`, `button` seront conservés dans le CSS final.

## Motifs

Vous pouvez ajouter des sélecteurs à la safelist en fonction d'une expression régulière avec `safelist.standard`, `safelist.deep` et `safelist.greedy`.

```js
const purgecss = new Purgecss({
    content: [], // contenu
    css: [], // css
    safelist: {
      standard: [/red$/],
      deep: [/blue$/],
      greedy: [/yellow$/]
    }
})
```

Dans cet exemple, les sélecteurs se terminant par `red` comme `.bg-red`, les sélecteurs se terminant par `blue` ainsi que leurs enfants comme `blue p` ou `.bg-blue .child-of-bg`, et les sélecteurs dont une partie se termine par `yellow` comme `button.bg-yellow.other-class`, seront conservés dans le CSS final.

Les motifs sont des expressions régulières. Vous pouvez utiliser [regexr](https://regexr.com) pour vérifier que les expressions régulières correspondent à ce que vous recherchez.

## Directement dans le CSS

Vous pouvez ajouter des éléments à la safelist directement dans votre CSS avec un commentaire spécial.
Utilisez `/* purgecss ignore */` pour ajouter la règle suivante à la safelist.

```css
/* purgecss ignore */
h1 {
    color: blue;
}
```

Utilisez `/* purgecss ignore current */` pour ajouter la règle actuelle à la safelist.

```css
h1 {
    /* purgecss ignore current */
    color: blue;
}
```

Vous pouvez utiliser `/* purgecss start ignore */` et `/* purgecss end ignore */` pour ajouter une plage de règles à la safelist.

```css
/* purgecss start ignore */
h1 {
  color: blue;
}

h3 {
  color: green;
}
/* purgecss end ignore */

h4 {
  color: purple;
}

/* purgecss start ignore */
h5 {
  color: pink;
}

h6 {
  color: lightcoral;
}

/* purgecss end ignore */
```

### Points d'attention

Certains outils d'optimisation CSS tels que PostCSS ou cssnano suppriment les commentaires avant que PurgeCSS ne s'exécute dans votre processus de build. Cela peut passer inaperçu car ces étapes sont souvent désactivées en développement. Pour éviter que ces commentaires soient supprimés, vous pouvez les marquer comme importants avec un point d'exclamation.

```css
/*! purgecss start ignore */
h5 {
  color: pink;
}

h6 {
  color: lightcoral;
}

/*! purgecss end ignore */
```
