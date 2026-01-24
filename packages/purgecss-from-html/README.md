# purgecss-from-html

[![npm version](https://img.shields.io/npm/v/purgecss-from-html.svg)](https://www.npmjs.com/package/purgecss-from-html)

HTML extractor for [PurgeCSS](https://purgecss.com). This extractor parses HTML files and extracts used selectors with detailed information about tags, classes, IDs, and attributes.

## Installation

```bash
npm install purgecss-from-html --save-dev
```

## Usage

### With PurgeCSS

```js
import PurgeCSS from "purgecss";
import purgeFromHtml from "purgecss-from-html";

const result = await new PurgeCSS().purge({
  content: ["**/*.html"],
  css: ["**/*.css"],
  extractors: [
    {
      extractor: purgeFromHtml,
      extensions: ["html"],
    },
  ],
});
```

### Standalone

You can also use the extractor standalone to extract selectors from HTML content:

```js
import purgeFromHtml from "purgecss-from-html";

const html = `
  <div class="container">
    <h1 id="title" data-section="hero">Hello World</h1>
    <button class="btn btn-primary">Click me</button>
  </div>
`;

const result = purgeFromHtml(html);

console.log(result);
// {
//   attributes: {
//     names: ["class", "id", "data-section", "class"],
//     values: ["container", "title", "hero", "btn", "btn-primary"]
//   },
//   classes: ["container", "btn", "btn-primary"],
//   ids: ["title"],
//   tags: ["html", "head", "body", "div", "h1", "button"],
//   undetermined: []
// }
```

## API

### `purgeFromHtml(content: string): ExtractorResultDetailed`

Parses HTML content and returns detailed selector information.

#### Parameters

- `content` - HTML code as a string

#### Returns

An `ExtractorResultDetailed` object containing:

- `attributes.names` - Array of attribute names found in the HTML
- `attributes.values` - Array of attribute values (split by spaces)
- `classes` - Array of class names extracted from `class` attributes
- `ids` - Array of IDs extracted from `id` attributes
- `tags` - Array of HTML tag names used
- `undetermined` - Array of selectors that couldn't be categorized

## How It Works

This extractor uses [parse5](https://github.com/inikulin/parse5) to parse the HTML into an AST and then walks through the tree to extract:

1. **Tag names** - All HTML elements (e.g., `div`, `span`, `button`)
2. **Classes** - Values from `class` attributes, split by spaces
3. **IDs** - Values from `id` attributes
4. **Attributes** - Both attribute names and values, useful for attribute selectors like `[data-theme]` or `[class*=foo]`

## License

MIT License
