# @fullhuman/purgecss-from-jsx

[![npm version](https://img.shields.io/npm/v/@fullhuman/purgecss-from-jsx.svg)](https://www.npmjs.com/package/@fullhuman/purgecss-from-jsx)

JSX extractor for [PurgeCSS](https://purgecss.com). This extractor parses JSX files (React, Preact, etc.) and extracts used selectors from component names, `className`, and `id` attributes.

## Installation

```bash
npm install @fullhuman/purgecss-from-jsx --save-dev
```

## Usage

### With PurgeCSS

```js
import PurgeCSS from "purgecss";
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
// ["div", "container", "Header", "main-header", "button", "btn", "btn-primary"]
```

## API

### `purgeFromJsx(options?: acorn.Options): (content: string) => string[]`

Creates an extractor function for JSX content.

#### Parameters

- `options` (optional) - [Acorn parser options](https://github.com/acornjs/acorn#interface). Defaults to `{ ecmaVersion: "latest" }`

#### Returns

A function that takes JSX content as a string and returns an array of selectors.

## What It Extracts

The extractor parses JSX and extracts:

1. **Component names** - JSX element names (e.g., `div`, `Header`, `MyComponent`)
2. **className values** - String values from `className` attributes, split by spaces
3. **id values** - String values from `id` attributes

### Example

```jsx
<Card className="card card-primary" id="featured-card">
  <CardHeader />
  <CardBody className="p-4" />
</Card>
```

Extracted selectors: `["Card", "card", "card-primary", "featured-card", "CardHeader", "CardBody", "p-4"]`

## Limitations

- Only extracts static string values from `className` and `id`
- Dynamic expressions like `className={styles.container}` or template literals are not fully supported
- For dynamic class names, consider using PurgeCSS's [safelist](https://purgecss.com/safelisting.html) option

## License

MIT
