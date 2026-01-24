---
title: Grunt
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez l'utiliser avec grunt grâce à un plugin.
  - itemprop: description
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez l'utiliser avec grunt grâce à un plugin.
  - property: og:url
    content:  https://purgecss.com/fr/plugins/grunt
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
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez l'utiliser avec grunt grâce à un plugin.
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

### Options

Toutes les options de purgecss sont disponibles avec les plugins.
Vous trouverez ci-dessous les principales options disponibles. Pour la liste complète, consultez le [site de documentation de Purgecss](https://www.purgecss.com/fr/configuration.html#options).

#### options.content

Type : `string | Object`

Vous pouvez spécifier le contenu qui doit être analysé par Purgecss avec un tableau de noms de fichiers ou de globs. Les fichiers peuvent être HTML, Pug, Blade, etc.

#### options.extractors

Type : `Array<Object>`

Purgecss peut être adapté à vos besoins. Si vous remarquez que beaucoup de CSS inutilisé n'est pas supprimé, vous voudrez peut-être utiliser un extracteur personnalisé.
Plus d'informations sur les extracteurs [ici](https://www.purgecss.com/fr/extractors.html).

#### options.safelist

Vous pouvez indiquer quels sélecteurs sont sûrs à conserver dans le CSS final. Cela peut être accompli avec l'option `safelist`.

Deux formes sont disponibles pour cette option.

```ts
safelist: ['random', 'yep', 'button', /^nav-/]
```

Sous cette forme, safelist est un tableau qui peut contenir une chaîne de caractères ou une expression régulière.

La forme _complexe_ est :

```ts
safelist: {
    standard: ['random', 'yep', 'button', /^nav-/],
    deep: [],
    greedy: [],
    keyframes: [],
    variables: []
}
```

#### options.keyframes

Type : `boolean`
Valeur par défaut : `false`

Si vous utilisez une bibliothèque d'animations CSS comme animate.css, vous pouvez supprimer les keyframes inutilisées en définissant l'option `keyframes` sur true.

#### options.fontFace

Type : `boolean`
Valeur par défaut : `false`

S'il y a des règles `@font-face` inutilisées dans votre CSS, vous pouvez les supprimer en définissant l'option `fontFace` sur true.

### Exemple

L'exemple ci-dessous utilise toutes les principales options disponibles.

```js
grunt.initConfig({
    // Configuration à exécuter (puis à tester).
    purgecss: {
      my_target: {
        options: {
          content: ['./src/**/*.html', `src/**/*.js`, 'src/**/*.blade', 'src/**/*.vue'],
          extractors: {
            extractor: class {
                static extract(content) {
                    content.match(/a-Z/) || []
                }
            },
            extension: ['html', 'blade']
          },
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
