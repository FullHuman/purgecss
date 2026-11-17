---
title: Gulp
description: "Supprimez le CSS inutilisé dans vos tâches gulp avec gulp-purgecss : installation, utilisation dans un pipe et options du plugin."
lang: fr-FR
---

# Gulp

## Installation

```sh
npm i -D gulp-purgecss
npm install --save-dev gulp-purgecss
```

## Utilisation

Par défaut, `purgecss` génère le CSS source _avec les sélecteurs inutilisés supprimés_ :

```js
const gulp = require('gulp')
const purgecss = require('gulp-purgecss')

gulp.task('purgecss', () => {
    return gulp.src('src/**/*.css')
        .pipe(purgecss({
            content: ['src/**/*.html']
        }))
        .pipe(gulp.dest('build/css'))
})
```

En définissant l'option `rejected`, vous pouvez « inverser » la sortie pour lister _uniquement les sélecteurs supprimés_ :

```js
const gulp = require('gulp')
const rename = require('gulp-rename')
const purgecss = require('gulp-purgecss')

gulp.task('purgecss-rejected', () => {
    return gulp.src('src/**/*.css')
        .pipe(rename({
            suffix: '.rejected'
        }))
        .pipe(purgecss({
            content: ['src/**/*.html'],
            rejected: true
        }))
        .pipe(gulp.dest('build/css'))
})
```

## Source maps

Le plugin met à jour la source map des fichiers qui en ont une, afin qu'elle pointe toujours vers le CSS d'origine. Créez les source maps avec l'option `sourcemaps` de gulp :

```js
const gulp = require('gulp')
const purgecss = require('gulp-purgecss')

gulp.task('purgecss', () => {
    return gulp.src('src/**/*.css', { sourcemaps: true })
        .pipe(purgecss({
            content: ['src/**/*.html']
        }))
        .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
})
```

ou avec [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps) :

```js
const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const purgecss = require('gulp-purgecss')

gulp.task('purgecss', () => {
    return gulp.src('src/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(purgecss({
            content: ['src/**/*.html']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/css'))
})
```

## Options

Le plugin accepte les [options de PurgeCSS](../configuration.md), sauf `css`, remplacée par les fichiers du flux. Certaines fonctionnent différemment :

- #### content

Un tableau de chemins et de globs des fichiers de contenu, par exemple `['src/**/*.html', 'src/**/*.js']`. Ils sont relatifs au répertoire de travail courant, que la CLI de gulp définit sur le répertoire du gulpfile. Les fichiers correspondant à `skippedContentGlobs` ne sont pas utilisés. Le contenu brut (`{ raw, extension }`) n'est pas pris en charge. Lorsqu'aucun fichier ne correspond, tous les sélecteurs sont supprimés.

- #### rejected

Si `true`, le contenu de chaque fichier est remplacé par la liste de ses sélecteurs supprimés, un `sélecteur {}` par ligne.

- #### sourceMap

L'option n'a aucun effet : les source maps sont créées avec gulp, voir [Source maps](#source-maps).

Les options `rejectedCss`, `output`, `stdin` et `stdout` n'ont pas d'effet non plus.

::: tip
Chaque fichier du flux est purgé séparément. Avec `fontFace`, `keyframes` ou `variables`, une règle `@font-face`, des `@keyframes` ou une variable CSS utilisés uniquement par un autre fichier sont supprimés. Pour les conserver, concaténez les fichiers avant de les purger, par exemple avec [gulp-concat](https://www.npmjs.com/package/gulp-concat).
:::
