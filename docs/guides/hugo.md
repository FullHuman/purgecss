---
title: Hugo
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Hugo via Hugo Pipes asset processing
  - itemprop: description
    content: PurgeCSS can be used with Hugo via Hugo Pipes asset processing
  - property: og:url
    content:  https://purgecss.com/guides/hugo
  - property: og:site_name
    content: purgecss.com
  - property: og:type
    content: website
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: en_US
  - property: og:title
    content: Remove unused CSS - PurgeCSS
  - property: og:description
    content: PurgeCSS can be used with Hugo via Hugo Pipes asset processing
---

# Hugo

> Hugo is one of the most popular open-source static site generators. With its amazing speed and flexibility, Hugo makes building websites fun again.

PurgeCSS can be used with [Hugo](https://gohugo.io/) via Hugo Pipes asset processing.

## Tooling

1. Install [Hugo](https://gohugo.io/getting-started/installing/)
1. Install [Node.js](https://nodejs.org/en/download/)

## Write Stats

In your `config.toml` file, add this:

```toml
[build]
  writeStats = true
```

Or, If using a `config.yaml` file, add this:

```yaml
build:
  writeStats: true
```

This tells Hugo to write a `hugo_stats.json` file to the project root as part of the build. It includes all tags, classes, and ids from your `*.html` templates.

## Node Packages

Run this to install the necessary packages:

```
npm install postcss postcss-cli @fullhuman/postcss-purgecss
```

If the `package.json` file at the project root doesn't exist yet, this will create it.

If it's not already there, add `node_modules/` to your `.gitignore` file.

## PostCSS Config File

Create a `postcss.config.js` file at the project root with these contents:

```js
const postCssPurgeCss = require('@fullhuman/postcss-purgecss');
const fs = require('fs');

const hugoStats = fs.readFileSync('./hugo_stats.json').toString();
const htmlElements = JSON.parse(hugoStats).htmlElements;

const purgeCss = postCssPurgeCss({
  content: [],
  defaultExtractor: content => {
    return {
      tags: htmlElements.tags || [],
      classes: htmlElements.classes || [],
      ids: htmlElements.ids || [],
      undetermined: content.match(/[A-Za-z0-9_-]+/g) || [],
      attributes: {}
    };
  },
  safelist: []
});

module.exports = {
  plugins: [
    ...(process.env.HUGO_ENVIRONMENT === 'production' ? [purgeCss] : [])
  ]
};
```

See the [PurgeCSS configuration docs](https://purgecss.com/configuration.html) for details on each option.

**Notes:**

- `content` is an empty array (for now). You can _optionally_ give it paths to your JS files
- `safelist` is an empty array (for now). Try the `content` property first. If PurgeCSS is still too eager, you can safelist elements here

## HTML Template

In the HTML Template for your `<head>`, add this:

```html
{{ $css := resources.Get "css/style.css" | resources.PostCSS }}

{{ if hugo.IsProduction }}
  {{ $css = $css | minify | fingerprint | resources.PostProcess }}
{{ end }}

<link
  rel="stylesheet"
  href="{{ $css.RelPermalink }}"
  integrity="{{ $css.Data.Integrity }}"
>
```

This assumes:

- Your CSS file is at `assets/css/style.css`
- You want to minify and fingerprint the production version of this file

If these assumptions aren't true for you, modify the code accordingly.

## Use it

Cool, now we can use it.

Serve your site in development mode, which is the default:

```
hugo serve
```

Open your browser DevTools, go to the Network tab, then note the size of the CSS file.

Now, `Control` + `C` to stop it, then serve your site in production mode:

```
hugo serve --environment production
```

Notice the CSS file now has a _much smaller_ size.

## Environment

If you don't want to pass the `--environment production` option, you can set this env var:

```
HUGO_ENVIRONMENT=production
```

## References

- <https://gohugo.io/hugo-pipes/postprocess/>
