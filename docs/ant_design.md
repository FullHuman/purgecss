---
title: Ant Design | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Ant Design but requires to create a custom CSS extractor.
  - name: keywords
    content: PurgeCSS Ant Design and-design common question
---

# How to use with Ant Design

::: tip
The content of this page comes from [this issue](https://github.com/FullHuman/purgecss/issues/172#issuecomment-637045325).
:::

PurgeCSS works by comparing the selectors in your content files with the ones on your CSS files. When using component libraries with their own CSS, it happens the CSS is removed because the content is not found. You then need to specify where the content can be found.

In the case of ant-design, the list of selectors used in ant-design cannot be retrieve easily from its content.

Below is a way to use PurgeCSS with Ant Design and React.
The project was created with create-react-app. Then, it is using react-app-rewired to extend the configuration.


```js
const glob = require("glob-all");
const paths = require("react-scripts/config/paths");

const { override, addPostcssPlugins } = require("customize-cra");

const purgecss = require("@fullhuman/postcss-purgecss")({
  content: [
    paths.appHtml,
    ...glob.sync(`${paths.appSrc}/**/*.js`, { nodir: true }),
    ...glob.sync(`${paths.appNodeModules}/antd/es/button/**/*.css`, {
      nodir: true,
    }),
  ],
  extractors: [
    {
      extractor: (content) => content.match(/([a-zA-Z-]+)(?= {)/g) || [],
      extensions: ["css"],
    },
  ],
});

module.exports = override(
  addPostcssPlugins([
    ...(process.env.NODE_ENV === "production" ? [purgecss] : []),
  ])
);
```

I essentially added a path to the antd css file that I want to keep. in the example below, `button`.

```js
...glob.sync(`${paths.appNodeModules}/antd/es/button/**/*.css`,
```

To keep antd entirely, you could replace by
```js
...glob.sync(`${paths.appNodeModules}/antd/es/**/*.css`,
```

and wrote an extractor for css file that intend to get the selectors from the file:
```js
  extractors: [
    {
      extractor: (content) => content.match(/([a-zA-Z-]+)(?= {)/g) || [],
      extensions: ["css"],
    },
  ],
```
