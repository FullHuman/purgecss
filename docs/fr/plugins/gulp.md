---
title: Gulp
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS est un outil pour supprimer le CSS inutilisé de votre projet. Vous pouvez l'utiliser avec le plugin gulp.
  - itemprop: description
    content: PurgeCSS est un outil pour supprimer le CSS inutilisé de votre projet. Vous pouvez l'utiliser avec le plugin gulp.
  - property: og:url
    content:  https://purgecss.com/fr/plugins/gulp
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
    content: PurgeCSS est un outil pour supprimer le CSS inutilisé de votre projet. Vous pouvez l'utiliser avec le plugin gulp.
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
