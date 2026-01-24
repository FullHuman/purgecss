---
title: CLI
lang: en-US
meta:
  - name: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use its command line interface to use it as part of your development workflow.
  - itemprop: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use its command line interface to use it as part of your development workflow.
  - property: og:url
    content:  https://purgecss.com/CLI
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: en_US
  - property: og:title
    content: Remove unused CSS - PurgeCSS
  - property: og:description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use its command line interface to use it as part of your development workflow.
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

The options available through the CLI are similar to the ones available with a configuration file. You can also use the CLI with a configuration file.

### --css

```sh
purgecss --css css/app.css css/palette.css --content src/index.html
```

### --content

You can specify content that should be analyzed by PurgeCSS with an array of filenames or [globs](https://github.com/isaacs/node-glob/blob/master/README.md#glob-primer). These files can be HTML, Pug, Blade, etc.

```sh
purgecss --css css/app.css --content src/index.html src/**/*.js
```

### --config

You can use the CLI with a [configuration file](configuration.md). Use `--config` or `-c` with the path to the config file.

```sh
purgecss --config ./purgecss.config.js
```

### --output

By default, the CLI outputs the result in the console. If you wish to return the CSS as files, specify the directory to write the purified CSS files to.

```sh
purgecss --css css/app.css --content src/index.html "src/**/*.js" --output build/css/
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
