---
title: Grunt
description: "Supprimez le CSS inutilisé dans vos builds Grunt avec grunt-purgecss : installation, configuration de la tâche purgecss et options."
lang: fr-FR
---

# Grunt

## Installation

```shell
npm install grunt-purgecss --save-dev
```

Une fois le plugin installé, il peut être activé dans votre Gruntfile avec cette ligne de JavaScript :

```js
grunt.loadNpmTasks('grunt-purgecss');
```

## La tâche "purgecss"

### Aperçu

Dans le Gruntfile de votre projet, ajoutez une section nommée `purgecss` à l'objet de données passé à `grunt.initConfig()`.

```js
grunt.initConfig({
    // Configuration à exécuter (puis à tester).
    purgecss: {
      my_target: {
        options: {
          content: ['./src/**/*.html']
        },
        files: {
          'dist/app.css': ['src/css/app.css']
        }
      }
    }
  });
```

Chaque destination de `files` est purgée avec ses fichiers sources, et le CSS purgé de ses fichiers sources est écrit dans la destination. Un fichier source qui n'existe pas est ignoré avec un avertissement lorsque `nonull` est défini (sinon Grunt l'écarte), et la tâche échoue lorsqu'il ne reste aucun fichier source pour une destination.

### Options

La tâche accepte les [options de PurgeCSS](../configuration.md), sauf `css`, remplacée par les fichiers sources de chaque destination. Certaines fonctionnent différemment :

- #### content

Un tableau de chemins et de globs des fichiers de contenu, par exemple `['src/**/*.html', 'src/**/*.js']`. Ils sont relatifs au répertoire de travail courant, que Grunt définit sur le répertoire du Gruntfile. Les fichiers correspondant à `skippedContentGlobs` ne sont pas utilisés. Lorsqu'aucun fichier ne correspond, PurgeCSS affiche un avertissement et tous les sélecteurs sont supprimés.

- #### sourceMap

La source map est ajoutée en ligne à la fin du fichier de destination. Définissez `to` sur le fichier de destination, afin que les sources de la map soient relatives à celui-ci :

```js
options: {
  content: ['src/**/*.html'],
  sourceMap: { to: 'dist/app.css' }
}
```

La tâche n'écrit pas de fichiers de source map : avec `inline: false`, la source map est perdue et le fichier de destination fait référence à un fichier qui n'existe pas. Chaque fichier source ajoute sa propre source map, donc seule une destination avec un seul fichier source a une source map utilisable.

- #### stdin

Ne la définissez pas : les chemins des fichiers sources seraient lus comme du CSS et la tâche échoue.

Les options `rejected`, `rejectedCss`, `output` et `stdout` n'ont pas d'effet : la tâche écrit uniquement le CSS purgé.

::: tip
Les fichiers sources d'une destination sont purgés ensemble, et chaque destination séparément. Avec `fontFace`, `keyframes` ou `variables`, une règle `@font-face`, des `@keyframes` ou une variable CSS utilisés uniquement par les fichiers sources d'une autre destination sont supprimés. Pour les conserver, listez ces fichiers sources dans la même destination.
:::

### Exemple

```js
grunt.initConfig({
    purgecss: {
      my_target: {
        options: {
          content: ['./src/**/*.html', 'src/**/*.js', 'src/**/*.blade', 'src/**/*.vue'],
          extractors: [
            {
              extractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
              extensions: ['html', 'blade']
            }
          ],
          safelist: ['random', 'yep', 'button', /red$/],
          keyframes: true,
          fontFace: true
        },
        files: {
          'dist/app.css': ['src/css/app.css']
        }
      }
    }
  });
```
