---
title: Hugo
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS peut être utilisé avec Hugo via le traitement des assets Hugo Pipes
  - itemprop: description
    content: PurgeCSS peut être utilisé avec Hugo via le traitement des assets Hugo Pipes
  - property: og:url
    content: https://purgecss.com/fr/guides/hugo
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
    content: PurgeCSS peut être utilisé avec Hugo via le traitement des assets Hugo Pipes
---

# Hugo

> Hugo est l'un des générateurs de sites statiques open-source les plus populaires. Avec sa vitesse et sa flexibilité incroyables, Hugo rend la création de sites web à nouveau amusante.

PurgeCSS peut être utilisé avec [Hugo](https://gohugo.io/) via le traitement des assets Hugo Pipes.

## Outils

1. Installez [Hugo](https://gohugo.io/getting-started/installing/)
1. Installez [Node.js](https://nodejs.org/en/download/)

## Write Stats

Dans votre fichier `config.toml`, ajoutez ceci :

```toml
[build]
  [build.buildStats]
    enable = true
```

Ou, si vous utilisez un fichier `config.yaml`, ajoutez ceci :

```yaml
build:
  buildStats:
    enable: true
```

Cela indique à Hugo d'écrire un fichier `hugo_stats.json` à la racine du projet lors de la construction. Il inclut toutes les balises, classes et identifiants de vos templates `*.html`.

Vous devriez également ajouter `hugo_stats.json` au watcher du serveur Hugo :

```toml
[module]
  [module.hugoVersion]
    extended = false
    min      = "0.115.0"
  [[module.mounts]]
    source = "assets"
    target = "assets"
  [[module.mounts]]
    source = "hugo_stats.json"
    target = "assets/watching/hugo_stats.json"
```

## Packages Node

Si le fichier `package.json` à la racine du projet n'existe pas encore (celui qui suit toutes vos dépendances node), exécutez cette commande depuis le répertoire racine de votre projet pour le créer :

```
npm init
```

Vous pouvez entrer autant ou aussi peu d'informations que vous le souhaitez. Une fois le fichier créé, vous pouvez continuer à installer les packages.

Exécutez ceci depuis la racine de votre projet pour installer les packages nécessaires :

```
npm install postcss postcss-cli @fullhuman/postcss-purgecss --save
```

Les packages seront installés dans un dossier appelé `node_modules` et seront également ajoutés à votre fichier `package.json`.

S'il n'y est pas déjà, ajoutez `node_modules/` à votre fichier `.gitignore`.

## Fichier de configuration PostCSS

Créez un fichier `postcss.config.js` à la racine du projet avec ce contenu :

```js
import purgeCSSPlugin from '@fullhuman/postcss-purgecss';

const purgecss = purgeCSSPlugin({
  content: ["./hugo_stats.json"],
  defaultExtractor: (content) => {
    const els = JSON.parse(content).htmlElements;
    return [...(els.tags || []), ...(els.classes || []), ...(els.ids || [])];
  },
  safelist: [],
});

export default {
  plugins: [
    ...(process.env.HUGO_ENVIRONMENT === "production" ? [purgecss] : []),
  ],
};
```

Consultez la [documentation de configuration PurgeCSS](../configuration.md) pour plus de détails sur chaque option.

**Note :** `safelist` est un tableau vide (pour l'instant). Rappelez-vous, seuls les éléments de vos templates HTML sont extraits. Donc, si votre JS ajoute des éléments, vous devrez les mettre en safelist.

## Template HTML

Dans le template HTML de votre `<head>`, ajoutez ceci :

```html
{{ $css := resources.Get "css/style.css" | resources.PostCSS }} 
{{ if hugo.IsProduction }} 
    {{ $css = $css | minify | fingerprint | resources.PostProcess }} 
{{ end }}

<link
  rel="stylesheet"
  href="{{ $css.RelPermalink }}"
  {{ if hugo.IsProduction -}} 
    integrity="{{ $css.Data.Integrity }}"
  {{- end }}
/>
```

Cela suppose que :

- Votre fichier CSS est situé à `assets/css/style.css`
- Vous souhaitez minifier et créer une empreinte de la version de production de ce fichier

Si ces suppositions ne sont pas vraies pour vous, modifiez le code en conséquence.

## Utilisation

Parfait, maintenant nous pouvons l'utiliser.

Servez votre site en mode développement, qui est le mode par défaut :

```
hugo serve
```

Ouvrez les DevTools de votre navigateur, allez dans l'onglet Network, puis notez la taille du fichier CSS.

Maintenant, faites `Control` + `C` pour l'arrêter, puis servez votre site en mode production :

```
hugo serve --environment production
```

Remarquez que le fichier CSS a maintenant une taille *beaucoup plus petite*.

## Environnement

Si vous ne voulez pas passer l'option `--environment production`, vous pouvez définir cette variable d'environnement :

```
HUGO_ENVIRONMENT=production
```

## Références

- <https://gohugo.io/hugo-pipes/postprocess/>
