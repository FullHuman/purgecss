# purgecss-from-html

[![npm version](https://img.shields.io/npm/v/purgecss-from-html.svg)](https://www.npmjs.com/package/purgecss-from-html)

HTML extractor for [PurgeCSS](https://purgecss.com). Extract potential tag, class, ID, and attribute selectors from static HTML documents and fragments.

## Installation

```bash
npm install purgecss-from-html --save-dev
```

## Usage

### With PurgeCSS

```js
import { PurgeCSS } from "purgecss";
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
//     names: ["class", "id", "data-section"],
//     values: ["container", "title", "hero", "btn btn-primary"]
//   },
//   classes: ["container", "btn", "btn-primary"],
//   ids: ["title"],
//   tags: ["div", "h1", "button", "html", "head", "body"],
//   undetermined: []
// }
```

## API

### `purgeFromHtml(content: string): ExtractorResultDetailed`

Parses HTML content synchronously and returns detailed selector information.

#### Parameters

- `content` - HTML code as a string

#### Returns

An `ExtractorResultDetailed` object containing:

- `attributes.names` - Attribute names, including local and qualified names for namespaced attributes, such as `href` and `xlink:href`.
- `attributes.values` - Complete decoded attribute values, including empty values. Values are not split into words.
- `classes` - Nonempty class names, split only on HTML ASCII whitespace: space, tab, line feed, form feed, and carriage return. A nonbreaking space remains part of a class name.
- `ids` - Complete nonempty decoded ID values. IDs are not split on whitespace.
- `tags` - Tag names from source elements and the parsed document, including inferred elements such as `html`, `head`, `body`, and `tbody`.
- `undetermined` - Always an empty array; text and unrelated attribute values are not treated as possible classes or IDs.

Every array contains unique values in deterministic first-discovery order. Each parsing pass collects source start tags and their attributes first, followed by additional values from the parsed tree. A scripting-disabled pass runs first; when `noscript` is encountered, a scripting-enabled pass follows. Embedded HTML is then processed in discovery order using a first-in, first-out queue. Names and values follow HTML parsing rules, including character-reference decoding, newline normalization, and SVG/MathML name adjustment.

## How It Works

This extractor uses [parse5](https://github.com/inikulin/parse5) to collect parsed start tags and walk the native document tree. It covers ordinary elements, `script` and `style` element attributes, nested `template` contents, SVG, and MathML. It also retains selectors from source start tags that HTML error recovery discards. This conservative behavior can preserve extra CSS for malformed or context-dependent fragments.

For HTML-namespace elements, it recursively extracts HTML embedded in `iframe` `srcdoc` attributes and in scripts with type `text/html` or `text/x-template`. Script types are matched by their trimmed, ASCII-case-insensitive MIME essence before any `;` parameters. For example, `type="TEXT/HTML; charset=utf-8"` is recognized. `noscript` content is considered with scripting both enabled and disabled so selectors from either interpretation are retained.

Ordinary JavaScript, JSON, CSS, comments, and text are not scanned for selector-like words. External documents and scripts are not fetched, and JavaScript or template expressions are not evaluated. Include the other content files used by your application and configure PurgeCSS safelists or `dynamicAttributes` for selectors created at runtime.

The parser integration is pinned to parse5 `8.1.1` because collecting discarded source tags uses an isolated internal parser hook. Parser upgrades require checking that hook against the package's regression tests.

## Accuracy and compatibility

The extractor provides potential selector names and values to PurgeCSS; PurgeCSS decides which CSS rules to retain. Its current matching uses global collections rather than a DOM query. Attribute names and values are not correlated, element relationships are not preserved, and namespace matching is approximate. Attribute `~=` and `|=` matching is also approximate. Some unused rules can therefore remain.

Core matching also has limitations with case-insensitive HTML tag and attribute names, attribute value case rules, and explicit attribute selector `i` flags. This package does not add case aliases to work around those limitations. Use consistent selector spelling and safelist affected selectors when needed.

Compared with earlier versions, the arrays no longer contain duplicates, IDs retain their complete values, and `attributes.values` contains complete values instead of individual words. For example, `title="hello world"` contributes `"hello world"`, not `"hello"` and `"world"`. This improves exact, prefix, and suffix attribute matching while retaining class selectors and attribute word selectors. Standalone consumers that relied on word tokens or the previous array order need to update their handling.

## License

MIT License
