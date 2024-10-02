# `purgecss-from-pug`

A PurgeCSS extractor for PUG files that automatically generates a list of used CSS selectors from your PUG files. This extractor can be used with PurgeCSS to eliminate unused CSS and reduce the size of your production builds.

## Usage

```
import { PurgeCSS } from 'purgecss'
import { purgeCSSFromPug } from 'purgecss-from-pug'
const options = {
  content: [], // files to extract the selectors from
  css: [], // css
  extractors: [
    {
      extractor: purgeCSSFromPug,
      extensions: ['pug']
    },
  ]
}

const purgecss = await new PurgeCSS().purge();
```
