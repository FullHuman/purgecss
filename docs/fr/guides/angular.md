---
title: Angular
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS peut être utilisé avec Angular grâce à son plugin PostCSS et un fichier postcss.config.json.
  - itemprop: description
    content: PurgeCSS peut être utilisé avec Angular grâce à son plugin PostCSS et un fichier postcss.config.json.
  - property: og:url
    content:  https://purgecss.com/fr/guides/angular
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
    content: PurgeCSS peut être utilisé avec Angular grâce à son plugin PostCSS et un fichier postcss.config.json.
---

# Angular

Le builder `application` d'Angular, utilisé par défaut pour les nouveaux projets, applique PostCSS à vos styles globaux et aux styles de vos composants. Depuis Angular CLI 17.2, il charge un fichier de configuration PostCSS personnalisé : vous pouvez donc ajouter PurgeCSS avec son plugin PostCSS. Vous n'avez besoin ni d'un builder personnalisé ni d'une configuration webpack.

## Installation

::::: code-tabs
@tab npm
```sh
npm i -D @fullhuman/postcss-purgecss
```
@tab yarn
```sh
yarn add @fullhuman/postcss-purgecss --dev
```
:::::

## Configuration

Créez `postcss.config.json` à la racine de votre workspace (à côté de `angular.json`) ou de votre projet :

```json
{
  "plugins": {
    "@fullhuman/postcss-purgecss": {
      "content": ["./src/**/*.html", "./src/**/*.ts"],
      "safelist": [":host"]
    }
  }
}
```

Les entrées de `content` incluent les templates de vos composants : les fichiers `.html` et les templates intégrés aux fichiers `.ts`. Quand vous lancez `ng build`, les sélecteurs inutilisés sont supprimés de vos styles globaux et des styles de vos composants.

Les règles sur `:host` et `:host(...)` ne correspondent à aucun élément de vos templates. Jusqu'à la version 8.0.0, PurgeCSS les supprime si `:host` n'est pas dans la `safelist`. Les versions suivantes les conservent sans cela.

À savoir :

- Angular lit uniquement `postcss.config.json` ou `.postcssrc.json`. Un fichier `postcss.config.js` est ignoré.
- Si votre projet a déjà l'un de ces fichiers, par exemple pour Tailwind CSS, ajoutez-y PurgeCSS au lieu d'en créer un second : Angular lit uniquement le premier fichier qu'il trouve.
- La configuration s'applique à tous les builds, `ng serve` compris.
- PurgeCSS s'exécute une fois par feuille de style (vos styles globaux et les styles de chaque composant), et chaque exécution lit tous les fichiers de `content`. Sur un projet de grande taille, gardez des globs `content` aussi précis que possible.

## Safelist avec des expressions régulières

JSON ne peut pas contenir d'expressions régulières. Pour mettre dans la safelist, avec un motif, des [noms de classes construits à l'exécution](../safelisting.md#noms-de-classes-construits-a-l-execution) ou ajoutés par une bibliothèque de composants, écrivez la safelist dans un fichier `purgecss.config.js`, dans le dossier où vous lancez `ng build`. Retirez `safelist` de `postcss.config.json` :

```js
// purgecss.config.js
exports.safelist = [":host", /^btn-/];
```

Si votre `package.json` contient `"type": "module"`, écrivez plutôt `export const safelist = [":host", /^btn-/];`.

::: warning
Jusqu'à la version 8.0.0, les options exportées avec `module.exports = { ... }` sont ignorées, et une `safelist` dans `postcss.config.json` remplace celle de `purgecss.config.js` au lieu de s'y ajouter. Exportez chaque option par son nom, comme ci-dessus, et gardez toute la safelist dans `purgecss.config.js`.
:::
