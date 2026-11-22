# @fullhuman/purgecss-from-jsx

[![npm version](https://img.shields.io/npm/v/@fullhuman/purgecss-from-jsx.svg)](https://www.npmjs.com/package/@fullhuman/purgecss-from-jsx)

JSX extractor for [PurgeCSS](https://purgecss.com). This extractor parses JSX files (React, Preact, etc.) and extracts used selectors from component names, `className`, `class` and `id` attributes, and the names and values of the other attributes.

## Installation

```bash
npm install @fullhuman/purgecss-from-jsx --save-dev
```

## Usage

### With PurgeCSS

```js
import { PurgeCSS } from "purgecss";
import purgeFromJsx from "@fullhuman/purgecss-from-jsx";

const result = await new PurgeCSS().purge({
  content: ["**/*.jsx"],
  css: ["**/*.css"],
  extractors: [
    {
      extractor: purgeFromJsx(),
      extensions: ["jsx"],
    },
  ],
});
```

### With Custom Acorn Options

You can pass custom [acorn](https://github.com/acornjs/acorn) parser options:

```js
import purgeFromJsx from "@fullhuman/purgecss-from-jsx";

const extractor = purgeFromJsx({
  ecmaVersion: 2020,
  sourceType: "module",
});
```

### Standalone

You can use the extractor standalone to extract selectors from JSX content:

```js
import purgeFromJsx from "@fullhuman/purgecss-from-jsx";

const jsx = `
  function App() {
    return (
      <div className="container">
        <Header id="main-header" />
        <button className="btn btn-primary">Click me</button>
      </div>
    );
  }
`;

const selectors = purgeFromJsx()(jsx);

console.log(selectors);
// ["div", "class", "container", "Header", "id", "main-header", "button", "btn", "btn-primary", "btn btn-primary"]
```

## API

### `purgeFromJsx(options?: acorn.Options): (content: string) => string[]`

Creates an extractor function for JSX content.

#### Parameters

- `options` (optional) - [Acorn parser options](https://github.com/acornjs/acorn#interface). Defaults to `{ ecmaVersion: "latest", sourceType: "script", allowImportExportEverywhere: true, allowAwaitOutsideFunction: true }`, which parses both ES modules (`import`, `export`, top-level `await`) and scripts. Options passed replace the defaults.

#### Returns

A function that takes JSX content as a string and returns an array of selectors, without duplicates.

## What It Extracts

The extractor parses JSX and extracts:

1. **Component names** - JSX element names (e.g., `div`, `Header`, `MyComponent`), including elements inside the value of another attribute (e.g., `icon={<Icon />}`)
2. **className values** - String values from `className` and `class` (Preact, Solid) attributes, split by whitespace
3. **id values** - String values from `id` attributes
4. **Attributes** - The name of every attribute and the string values of the attributes, for attribute selectors such as `[data-state="open"]`, `input[type="checkbox"]` or `[class^="icon-"]`. The name is also given as it is in the HTML: in lower case (`tabIndex` gives `tabIndex` and `tabindex`), `class` for `className` and `for` for `htmlFor`

When an attribute is an expression, every string in it is extracted, as well as the static parts of template literals. For `className`, `class` and `id`, the keys of object literals are extracted too. For example, `className={active ? "on" : "off"}` gives `on` and `off`, ``className={`card ${size}`}`` gives `card`, `className={clsx({ active: isActive })}` gives `active` and `data-state={open ? "open" : "closed"}` gives `open` and `closed`.

### Example

```jsx
<Card className="card card-primary" id="featured-card">
  <CardHeader />
  <CardBody className="p-4" />
</Card>
```

Extracted selectors: `["Card", "class", "card", "card-primary", "card card-primary", "id", "featured-card", "CardHeader", "CardBody", "p-4"]`

## Limitations

- Only extracts static string values from the attributes
- Values computed at runtime, like `className={styles.container}` or the `size` of ``className={`btn-${size}`}``, are not extracted
- For dynamic class names, consider using PurgeCSS's [safelist](https://purgecss.com/safelisting.html) option

## License

MIT
