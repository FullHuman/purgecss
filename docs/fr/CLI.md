---
title: CLI
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez utiliser son interface en ligne de commande dans votre flux de travail de développement.
  - itemprop: description
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez utiliser son interface en ligne de commande dans votre flux de travail de développement.
  - property: og:url
    content:  https://purgecss.com/fr/CLI
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: fr_FR
  - property: og:title
    content: Supprimer le CSS inutilisé - PurgeCSS
  - property: og:description
    content: PurgeCSS est un outil pour supprimer le CSS que vous n'utilisez pas réellement dans votre projet. Vous pouvez utiliser son interface en ligne de commande dans votre flux de travail de développement.
---

# CLI

PurgeCSS est disponible via une interface en ligne de commande (CLI). Vous pouvez utiliser le CLI seul ou avec un fichier de configuration.

## Installation

Vous pouvez soit installer PurgeCSS comme dépendance de développement et utiliser le CLI avec `npx`, soit installer PurgeCSS globalement :

```sh
npm i -g purgecss
```

## Utilisation

Pour voir les options disponibles pour le CLI : `purgecss --help`

```text
Usage: purgecss --css <css...> --content <content...> [options]

Remove unused css selectors

Options:
  -V, --version                        output the version number
  -con, --content <files...>           glob of content files
  -css, --css <files...>               glob of css files
  -c, --config <path>                  path to the configuration file
  -o, --output <path>                  file path directory to write purged css files to
  -font, --font-face                   option to remove unused font-faces
  -keyframes, --keyframes              option to remove unused keyframes
  -v, --variables                      option to remove unused variables
  -rejected, --rejected                option to output rejected selectors
  -rejected-css, --rejected-css        option to output rejected css
  -s, --safelist <list...>             list of classes that should not be removed
  -b, --blocklist <list...>            list of selectors that should be removed
  -k, --skippedContentGlobs <list...>  list of glob patterns for folders/files that should not be scanned
  -p, --preserve-paths                 preserve folder hierarchy in the output
  -h, --help                           display help for command
```

Les options disponibles via le CLI sont similaires à celles disponibles avec un fichier de configuration. Vous pouvez également utiliser le CLI avec un fichier de configuration.

### --css

```sh
purgecss --css css/app.css css/palette.css --content src/index.html
```

### --content

Vous pouvez spécifier le contenu qui doit être analysé par PurgeCSS avec un tableau de noms de fichiers ou de [globs](https://github.com/isaacs/node-glob/blob/master/README.md#glob-primer). Ces fichiers peuvent être HTML, Pug, Blade, etc.

```sh
purgecss --css css/app.css --content src/index.html src/**/*.js
```

### --config

Vous pouvez utiliser le CLI avec un [fichier de configuration](configuration.md). Utilisez `--config` ou `-c` avec le chemin vers le fichier de configuration.

```sh
purgecss --config ./purgecss.config.js
```

### --output

Par défaut, le CLI affiche le résultat dans la console. Si vous souhaitez retourner le CSS sous forme de fichiers, spécifiez le répertoire dans lequel écrire les fichiers CSS purifiés.

```sh
purgecss --css css/app.css --content src/index.html "src/**/*.js" --output build/css/
```

### --preserve-paths

Par défaut, le CLI aplatit la hiérarchie des dossiers et génère tous les fichiers CSS dans le même répertoire. Si vous souhaitez préserver la structure de dossiers originale dans la sortie, utilisez le flag `--preserve-paths`.

```sh
purgecss --css src/**/*.css --content src/index.html --output build/ --preserve-paths
```

Par exemple, si vos fichiers CSS sont situés à :
- `src/styles/main.css`
- `src/components/button.css`

Sans `--preserve-paths`, les deux fichiers seraient écrits dans `build/main.css` et `build/button.css`.

Avec `--preserve-paths`, les fichiers seraient écrits dans :
- `build/src/styles/main.css`
- `build/src/components/button.css`

### --safelist

Si vous souhaitez empêcher PurgeCSS de supprimer un sélecteur CSS spécifique, vous pouvez l'ajouter à la safelist.

```sh
purgecss --css css/app.css --content src/index.html --safelist classnameToSafelist
```
