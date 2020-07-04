# PurgeCSS with Wordpress

Based on the [gist](https://gist.github.com/frnwtr/5647673bb15ca8893642469d3b400cba) made by @frnwtr, `purgecss-with-wordpress` is a set of templates for
Wordpress CMS.

## Getting Started

#### Installation

You need to install [PurgeCSS](https://github.com/FullHuman/purgecss) first.

Install `purgecss-with-wordpress`:
```sh
npm i --save-dev purgecss-with-wordpress
```

## Usage

```js

import PurgeCSS from 'purgecss'
import purgecssWordpress from 'purgecss-with-wordpress'

const purgeCSSResults = await new PurgeCSS().purge({
  content: ['**/*.html'],
  css: ['**/*.css'],
  safelist: purgecssWordpress.safelist,
  safelistPatterns: purgecssWordpress.safelistPatterns
})
```

If you have additional classes you want to include in either of the `safelist` or `safelistPatterns`, you can include them using the spread operator:

```js
safelist: [
  ...purgecssWordpress.safelist,
  'red',
  'blue',
],
safelistPatterns: [
  ...purgecssWordpress.safelistPatterns,
  /^red/,
  /blue$/,
]
```

## Versioning

Purgecss-with-wordpress use [SemVer](http://semver.org/) for versioning.

## Acknowledgment

Purgecss-with-wordpress is based on the [gist](https://gist.github.com/frnwtr/5647673bb15ca8893642469d3b400cba) made by @frnwtr

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
