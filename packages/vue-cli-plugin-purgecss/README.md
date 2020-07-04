# vue-cli-plugin-purgecss

> A [Vue CLI 3 Plugin](https://github.com/vuejs/vue-cli) for installing PurgeCSS

## Install

If you haven't yet installed vue-cli 3, first follow the install instructions here: https://github.com/vuejs/vue-cli

Generate a project using vue-cli 3.0:

```bash
vue create my-app
```

Before installing the PurgeCSS plugin, make sure to commit or stash your changes in case you need to revert the changes.

To install the PurgeCSS plugin simply navigate to your application folder and add PurgeCSS.

```bash
cd my-app

vue add purgecss
```

### Usage

Below are the PurgeCSS options set by this plugin:

```js
{
  content: [ `./public/**/*.html`, `./src/**/*.vue` ],
  defaultExtractor (content) {
    const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '')
    return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || []
  },
  safelist: [ /-(leave|enter|appear)(|-(to|from|active))$/, /^(?!(|.*?:)cursor-move).+-move$/, /^router-link(|-exact)-active$/, /data-v-.*/ ],
}
```

## Contributing

Please read [CONTRIBUTING.md](./../../CONTRIBUTING.md) for details on our code of
conduct, and the process for submitting pull requests to us.

## Versioning

PurgeCSS use [SemVer](http://semver.org/) for versioning.

## License

This project is licensed under the MIT License - see the [LICENSE](./../../LICENSE) file
for details.
