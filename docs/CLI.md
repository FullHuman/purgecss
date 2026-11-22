---
title: Command Line Interface
description: "Run PurgeCSS from the command line: install the purgecss CLI and use its options for content, CSS, output, safelists, font faces, keyframes and variables."
lang: en-US
---

# CLI

PurgeCSS is available via a Command Line Interface. You can use the CLI by itself or with a configuration file.

## Installation

You can either install PurgeCSS as a dev dependency and use the CLI with `npx` or you can also install PurgeCSS globally:

```sh
npm i -g purgecss
```

## Usage

To see the available options for the CLI: `purgecss --help`

```text
Usage: purgecss --css <css...> --content <content...> [options]

Remove unused css selectors

Options:
  -V, --version                        output the version number
  --content <files...>                 glob of content files
  --css <files...>                     glob of css files
  -c, --config <path>                  path to the configuration file
  -o, --output <path>                  file path directory to write purged css files to
  -f, --font-face                      option to remove unused font-faces
  -K, --keyframes                      option to remove unused keyframes
  -v, --variables                      option to remove unused variables
  -r, --rejected                       option to output rejected selectors
  -R, --rejected-css                   option to output rejected css
  -s, --safelist <list...>             list of classes that should not be removed
  -b, --blocklist <list...>            list of selectors that should be removed
  -k, --skippedContentGlobs <list...>  list of glob patterns for folders/files that should not be scanned
  -p, --preserve-paths                 preserve folder hierarchy in the output
  -h, --help                           display help for command
```

The options available through the CLI are similar to the ones available with a configuration file. You can also use the CLI with a configuration file.

### --css

```sh
purgecss --css css/app.css css/palette.css --content src/index.html
```

Use `-` to read the CSS from the standard input. This CSS has no file name, so it is written to the console, or to the file given to `--output` if the path ends with `.css`.

```sh
cat css/app.css | purgecss --css - --content src/index.html --output build/app.css
```

### --content

You can specify content that should be analyzed by PurgeCSS with an array of filenames or [globs](https://github.com/isaacs/node-glob/blob/main/README.md#glob-primer). These files can be HTML, Pug, Blade, etc.

```sh
purgecss --css css/app.css --content src/index.html src/**/*.js
```

Use `-` to read the content from the standard input.

```sh
cat src/index.html | purgecss --css css/app.css --content -
```

### --config

You can use the CLI with a [configuration file](configuration.md). Use `--config` or `-c` with the path to the config file.

```sh
purgecss --config ./purgecss.config.js
```

The other options given in the command line replace the ones of the configuration file. `--safelist` replaces the whole `safelist` of the configuration file, including its `deep` and `greedy` patterns:

```sh
# only classnameToSafelist is safelisted, not the selectors of the configuration file
purgecss --config ./purgecss.config.js --safelist classnameToSafelist
```

### --output

By default, the CLI outputs the result in the console. If you wish to return the CSS as files, specify the directory to write the purified CSS files to.

```sh
purgecss --css css/app.css --content src/index.html "src/**/*.js" --output build/css/
```

If there is a single CSS file and the path ends with `.css`, the purified CSS is written to that file instead. Missing folders in the path are created.

```sh
purgecss --css css/app.css --content src/index.html --output build/css/app.purged.css
```

### --preserve-paths

By default, the CLI flattens the folder hierarchy and outputs all CSS files to the same directory. If you want to preserve the original folder structure in the output, use the `--preserve-paths` flag.

```sh
purgecss --css src/**/*.css --content src/index.html --output build/ --preserve-paths
```

For example, if your CSS files are located at:
- `src/styles/main.css`
- `src/components/button.css`

Without `--preserve-paths`, both files would be written to `build/main.css` and `build/button.css`.

With `--preserve-paths`, the files would be written to:
- `build/src/styles/main.css`
- `build/src/components/button.css`

### --safelist

If you wish to prevent PurgeCSS from removing a specific CSS selector, you can add it to the safelist.

```sh
purgecss --css css/app.css --content src/index.html --safelist classnameToSafelist
```

A string written between slashes is parsed as a regular expression:

```sh
purgecss --css css/app.css --content src/index.html --safelist "/^btn-/" classnameToSafelist
```

The CLI only sets `safelist.standard`. Use a configuration file for `safelist.deep`, `safelist.greedy`, `safelist.keyframes` and `safelist.variables` (see [Safelisting](safelisting.md)).

### --blocklist

The selectors given to `--blocklist` are removed even if they are found in the content. Like in the [`blocklist` option](configuration.md), write the names without `.` or `#`, and regular expressions between slashes:

```sh
purgecss --css css/app.css --content src/index.html --blocklist usedClass "/^nav-/"
```

### --skippedContentGlobs

The content files matching the globs given to `--skippedContentGlobs` are not scanned:

```sh
purgecss --css css/app.css --content "src/**/*.html" --skippedContentGlobs "src/vendor/**"
```

### --font-face, --keyframes and --variables

`--font-face`, `--keyframes` and `--variables` remove the unused `@font-face` rules, keyframes and CSS variables, like the `fontFace`, `keyframes` and `variables` options of the [configuration file](configuration.md):

```sh
purgecss --css css/app.css --content src/index.html --font-face --keyframes --variables
```

### --rejected and --rejected-css

`--rejected` adds the list of the removed selectors to the result, and `--rejected-css` the removed CSS:

```sh
purgecss --css css/app.css --content src/index.html --rejected
```

```json
[{"css":".used { color: red; }\n","file":"css/app.css","rejected":[".unused"]}]
```

They are only part of the result printed in the console: with `--output`, only the purged CSS is written.
