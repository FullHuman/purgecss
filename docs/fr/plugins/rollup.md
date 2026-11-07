---
title: Rollup
description: "Supprimez le CSS inutilisé de vos builds Rollup, Rolldown et Vite avec rollup-plugin-purgecss : installation, utilisation, configuration de Vite, mode watch et options du plugin."
lang: fr-FR
---

# Rollup

Le plugin fonctionne avec [Rollup](https://rollupjs.org) et, depuis la version 9.1.0, avec [Rolldown](https://rolldown.rs) et [Vite](https://vite.dev) (testé avec Vite 8).

## Installation

```sh
npm i rollup-plugin-purgecss -D
```

`rollup` est une peer dependency optionnelle : il n'est pas nécessaire avec Rolldown ou Vite.

## Utilisation

```js
// rollup.config.js
import purgecss from "rollup-plugin-purgecss";

export default {
  input: "main.js",
  output: { dir: "dist" },
  plugins: [
    purgecss({
      content: ["index.html", "src/**/*.js"],
    }),
  ],
};
```

Chaque fichier CSS importé (`**/*.css` en dehors des répertoires `node_modules` par défaut) est purgé et devient un module JS dont l'export par défaut est le CSS purgé :

```js
import css from "./style.css"; // le CSS purgé, sous forme de chaîne
```

Les fichiers CSS importés avec une query, par exemple `./style.css?raw`, ne sont pas purgés.

Le plugin fonctionne de la même façon avec Rolldown, qui ne regroupe plus le CSS lui-même : les fichiers CSS purgés lui sont signalés comme des modules JS.

### Mode watch

En mode watch (`rollup -w`), les fichiers de contenu sont surveillés : en modifier un purge à nouveau le CSS, y compris après un build qui a échoué à cause de lui. Un nouveau fichier correspondant à un glob de `content` n'est utilisé qu'une fois le CSS purgé à nouveau, par exemple après la modification d'un fichier surveillé ou un redémarrage. Les fichiers CSS sont aussi purgés à nouveau lorsque le build réutilise un `cache` Rollup, car le contenu a pu changer. Les fichiers de contenu ne sont relus que lorsqu'ils ont changé.

## Vite

Avec Vite, le plugin rend le CSS purgé à Vite, qui le regroupe et le minifie comme d'habitude. Ajoutez-le au tableau `plugins` de premier niveau de la configuration de Vite :

```js
// vite.config.js
import purgecss from "rollup-plugin-purgecss";

export default {
  plugins: [
    purgecss({
      content: ["index.html", "src/**/*.{js,ts,jsx,tsx}"],
    }),
  ],
};
```

- Le plugin doit être dans le tableau `plugins`, sans `enforce: "post"`. Dans `build.rolldownOptions.plugins` ou `build.rollupOptions.plugins`, ou avec `enforce: "post"`, il s'exécute après que Vite a transformé les fichiers CSS en modules JS et ne peut pas les purger : avec Vite 7 et ultérieur, le build échoue avec une erreur qui indique de le déplacer. Il peut être limité à certains environnements avec `perEnvironmentPlugin`.
- Les chemins et globs relatifs de `content` et `skippedContentGlobs`, ainsi que le chemin `output`, sont résolus depuis la `root` de Vite.
- Le CSS n'est purgé que par `vite build`. Le serveur de développement le sert tel quel.
- Les modules CSS (`*.module.css`) ne sont pas modifiés, avec un avertissement : Vite renomme leurs classes avant l'exécution du plugin, elles ne peuvent donc pas être trouvées dans le contenu. Excluez-les avec `exclude` pour supprimer l'avertissement, ou utilisez le [plugin PostCSS](postcss.md#modules-css) dans la configuration PostCSS de Vite, qui garde leurs classes utilisées.
- Les fichiers CSS importés avec `?inline` sont purgés. Ceux importés avec une autre query, par exemple `?raw` ou `?url`, ne le sont pas. Les fichiers traités par un préprocesseur (par exemple `.scss`) ne sont purgés que s'ils correspondent à `include`.
- `insert` n'a aucun effet, et les fichiers CSS importés ne sont pas transformés en modules JS.
- `output` reçoit une copie du CSS purgé que Vite regroupe dans ses fichiers CSS : Vite émet toujours son propre fichier CSS, ne liez donc pas les deux dans la page. Il ne reçoit pas le CSS importé avec `?inline`, ni le CSS des éléments `<style>` et des attributs `style` de `index.html`. Lorsque Vite compile plusieurs environnements (par exemple `vite build --app` ou un framework SSR), il ne reçoit que le CSS des environnements client.
- Les blocs de style des composants Vue et Svelte correspondent aussi à `include`. Leurs styles scoped utilisent des sélecteurs absents du contenu (`[data-v-…]`, `.svelte-…`) : ajoutez-les à la liste blanche, par exemple `safelist: [/data-v-/]` ou `safelist: [/svelte-/]`, ou excluez les composants, par exemple `exclude: ["**/node_modules/**", "**/*.vue?*"]`. Avec Vue, suivez aussi le [guide Vue](../guides/vue.md).

## Options

Le plugin accepte les [options de PurgeCSS](../configuration.md) (sauf `css`, remplacée par les fichiers CSS importés) ainsi que :

- #### content

Les chemins et globs relatifs sont résolus depuis le répertoire de travail courant (depuis la `root` de Vite avec Vite, comme les globs relatifs de `skippedContentGlobs`). Sans `content` ni `contentFunction`, tout le CSS est supprimé, avec un avertissement.

- #### contentFunction

`(sourceFile) => Array<string | RawContent>` : renvoie le contenu à utiliser pour le fichier CSS au chemin `sourceFile`. Lorsqu'elle est définie, `content` n'est pas utilisée (ni nécessaire).

- #### include / exclude

Motifs picomatch ou expressions régulières des fichiers à purger, `["**/*.css"]` et `"**/node_modules/**"` par défaut : le CSS importé depuis une dépendance (par exemple `import "bootstrap/dist/css/bootstrap.css"`) n'est pas purgé sauf si `exclude` est modifiée, où que se trouve son répertoire `node_modules` (par exemple à la racine d'un workspace). Les motifs relatifs sont résolus depuis le répertoire de travail courant.

- #### output

Ce qu'il faut faire du CSS purgé de tous les fichiers CSS une fois le bundle généré, dans l'ordre d'import des fichiers :

- un chemin : le CSS est écrit dans ce fichier, relatif au répertoire de travail courant (à la `root` de Vite avec Vite). Son répertoire est créé s'il n'existe pas.
- une fonction : elle est appelée avec le CSS et un tableau du CSS de chaque fichier, `(css, styles) => {}`.

Avec Rollup et Rolldown, lorsque `output` est définie, les fichiers CSS importés exportent une chaîne vide. Lorsqu'un build n'a plus de fichiers CSS, par exemple en mode watch, le fichier est vidé et la fonction est appelée avec une chaîne vide.

- #### insert

Si `true`, les fichiers CSS importés insèrent leur CSS purgé dans le `<head>` du document, dans un élément `<style>`, lorsque le bundle s'exécute dans un navigateur. Ils exportent toujours leur CSS.

- #### sourceMap

Avec Rollup et Rolldown, la source map est intégrée au CSS purgé exporté par chaque fichier CSS. Le CSS transmis à `output` n'a pas de source map. Avec Vite, elle est transmise à Vite avec le CSS.

::: warning
Avant la version 9.1.0, `insert` faisait échouer le build, `contentFunction` était ignorée, `output` échouait avec `ENOENT` lorsque son répertoire n'existait pas, et l'`exclude` par défaut (`"node_modules/**"`) ne correspondait qu'au répertoire `node_modules` du répertoire de travail courant. L'option `dest` n'a aucun effet et est dépréciée : utilisez `output`.
:::

::: tip
Les types du plugin importent les types de `rollup` et `postcss` : si TypeScript ne les trouve pas, par exemple avec Vite ou Rolldown, ou avec pnpm, installez-les comme dépendances de développement ou activez `skipLibCheck`.
:::
