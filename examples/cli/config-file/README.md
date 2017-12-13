## CLI example - with config file

This folder is an example on how to use the purgecss cli to remove the unused
css from your project. You can create a purgecss.config.js file.\
The options used in the config file are the same as purgecss.

### Install CLI

```
npm i -g purgecss
```

### Usage

Create a purgecss.config.js file.

```js
module.exports = {
  content: ['index.html'],
  css: ['css/tailwind.css', 'css/app.css'],
  extractors: [
    {
      extractor: class {
        static extract(content) {
          return content.match(/[A-z0-9-:\/]+/g) || []
        }
      },
      extensions: ['html', 'js']
    }
  ]
}
```

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

### print the result in the console

```
purgecss -c purgecss.config.js
```

### write the result css files in the specified folder

```
purgecss -c purgecss.config.js -o dist/css
```

The two files are created in dist/css: app.css and tailwind.css
