# CLI

Purgecss is available via a CLI. You can use the CLI by itself or with a configuration file.

## Installation

```
npm i -g purgecss
```

## Usage

To see the available options for the CLI: `purgecss --help`

```
purgecss --css <css> --content <content> [option]

Options:
  --con, --content  glob of content files                                [array]
  -c, --config      configuration file                                  [string]
  -o, --out         Filepath directory to write purified css files to   [string]
  -w, --whitelist   List of classes that should not be removed
                                                           [array] [default: []]
  -h, --help        Show help                                          [boolean]
  -v, --version     Show version number                                [boolean]
```

The options available through the CLI are similar to the ones available with a configuration file. You can also use the CLI with a configuration file.

### --css

```
purgecss --css css/app.css css/palette.css --content src/index.html
```

### --content

You can specified the content with an array of filename or [globs](https://github.com/isaacs/node-glob/blob/master/README.md#glob-primer) that should be analyized by purgecss. The files can be html, pug, blade, ... files.

```
purgecss --css css/app.css --content src/index.html src/**/*.js
```

### --config

You can use the CLI with a [configuration file](/configuration.md). Use the `--config` or `-c` with the path to the config file.

```
purgecss --config ./purgecss.config.js
```

### --out

By default, the CLI output the result in the console. If you wish to return the css as files, you need to specify the filepath directory to write the purified css files to.

```
purgecss --css css/app.css --content src/index.html src/**/*.js --out build/css/
```

### --whitelist

If you wish to include a css selector that purgecss removes, you can whitelist it. It will tell purgecss not to remove it.

```
purgecss --css css/app.css --content src/index.html --whitelist classnameToWhitelist
```

## Example

You can see an example in the examples folder of the purgecss repository [here](https://github.com/FullHuman/purgecss/tree/master/examples/cli/config-file).

