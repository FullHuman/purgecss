---
title: CLI | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. You can use its command line interface to use it as part of your development workflow.
  - name: keywords
    content: PurgeCSS remove unused CSS optimization web command line interface cli
---

# CLI

PurgeCSS is available via a Command Line Interface. You can use the CLI by itself or with a configuration file.

## Installation

You can either install PurgeCSS as a dev dependency and use the CLI with `npx` or you can also install PurgeCSS globally:

```text
npm i -g purgecss
```

## Usage

To see the available options for the CLI: `purgecss --help`

```text
Usage: purgecss --css <css> --content <content> [options]

Options:
  -con, --content  glob of content files
  -css, --css      glob of css files
  -c, --config     path to the configuration file
  -o, --output     file path directory to write purged css files to
  -w, --whitelist  list of classes that should not be removed
  -h, --help       output usage information
```

The options available through the CLI are similar to the ones available with a configuration file. You can also use the CLI with a configuration file.

### --css

```text
purgecss --css css/app.css css/palette.css --content src/index.html
```

### --content

You can specify content that should be analyzed by PurgeCSS with an array of filenames or [globs](https://github.com/isaacs/node-glob/blob/master/README.md#glob-primer). These files can be HTML, Pug, Blade, etc.

```text
purgecss --css css/app.css --content src/index.html src/**/*.js
```

### --config

You can use the CLI with a [configuration file](configuration.md). Use `--config` or `-c` with the path to the config file.

```text
purgecss --config ./purgecss.config.js
```

### --out

By default, the CLI outputs the result in the console. If you wish to return the CSS as files, specify the directory to write the purified CSS files to.

```text
purgecss --css css/app.css --content src/index.html src/**/*.js --out build/css/
```

### --whitelist

If you wish to prevent PurgeCSS from removing a specific CSS selector, you can whitelist it.

```text
purgecss --css css/app.css --content src/index.html --whitelist classnameToWhitelist
```
