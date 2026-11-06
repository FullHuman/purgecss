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
