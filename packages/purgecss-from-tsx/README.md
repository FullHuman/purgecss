# @fullhuman/purgecss-from-tsx

[![npm version](https://img.shields.io/npm/v/@fullhuman/purgecss-from-tsx.svg)](https://www.npmjs.com/package/@fullhuman/purgecss-from-tsx)

TSX extractor for [PurgeCSS](https://purgecss.com). This extractor parses TSX files (TypeScript + JSX) and extracts used selectors from component names, `className`, and `id` attributes.

## Installation

```bash
npm install @fullhuman/purgecss-from-tsx --save-dev
```

## Usage

### With PurgeCSS

```js
import PurgeCSS from "purgecss";
import purgeFromTsx from "@fullhuman/purgecss-from-tsx";

const result = await new PurgeCSS().purge({
  content: ["**/*.tsx"],
  css: ["**/*.css"],
  extractors: [
    {
      extractor: purgeFromTsx(),
      extensions: ["tsx"],
    },
  ],
});
```

### With Custom Options

You can pass custom options for both the TypeScript compiler and the acorn parser:

```js
import purgeFromTsx from "@fullhuman/purgecss-from-tsx";

const extractor = purgeFromTsx({
  // Acorn parser options
  acornOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  // TypeScript compiler options
  tsOptions: {
    target: ts.ScriptTarget.ES2020,
  },
});
```

### Standalone

You can use the extractor standalone to extract selectors from TSX content:

```js
import purgeFromTsx from "@fullhuman/purgecss-from-tsx";

const tsx = `
  interface Props {
    title: string;
  }
  
  function Card({ title }: Props): JSX.Element {
    return (
      <div className="card">
        <h2 id="card-title" className="card-title">{title}</h2>
        <Button className="btn btn-primary" />
      </div>
    );
  }
`;

const selectors = purgeFromTsx()(tsx);

console.log(selectors);
// ["div", "card", "h2", "card-title", "card-title", "Button", "btn", "btn-primary"]
```

## API

### `purgeFromTsx(options?: Options): (content: string) => string[]`

Creates an extractor function for TSX content.

#### Parameters

- `options` (optional) - Configuration object with:
  - `acornOptions` - [Acorn parser options](https://github.com/acornjs/acorn#interface). Defaults to `{ ecmaVersion: "latest" }`
  - `tsOptions` - [TypeScript compiler options](https://www.typescriptlang.org/tsconfig). JSX is always preserved for parsing.

#### Returns

A function that takes TSX content as a string and returns an array of selectors.

## How It Works

This extractor works in two steps:

1. **TypeScript Transpilation** - Uses the TypeScript compiler to transpile TSX to JSX, stripping type annotations while preserving JSX syntax
2. **JSX Extraction** - Uses [@fullhuman/purgecss-from-jsx](https://www.npmjs.com/package/@fullhuman/purgecss-from-jsx) to extract selectors from the resulting JSX

## What It Extracts

The extractor parses TSX and extracts:

1. **Component names** - JSX element names (e.g., `div`, `Header`, `MyComponent`)
2. **className values** - String values from `className` attributes, split by spaces
3. **id values** - String values from `id` attributes

### Example

```tsx
interface CardProps {
  variant: "primary" | "secondary";
}

const Card: React.FC<CardProps> = ({ variant }) => (
  <article className="card card-hover" id="featured">
    <CardHeader className="p-4" />
    <CardBody />
  </article>
);
```

Extracted selectors: `["article", "card", "card-hover", "featured", "CardHeader", "p-4", "CardBody"]`

## Limitations

- Only extracts static string values from `className` and `id`
- Dynamic expressions like `className={styles.container}` or template literals are not fully supported
- For dynamic class names, consider using PurgeCSS's [safelist](https://purgecss.com/safelisting.html) option

## License

MIT License
