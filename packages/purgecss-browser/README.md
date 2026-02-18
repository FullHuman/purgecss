# purgecss-browser

> Browser-compatible build of [PurgeCSS](https://purgecss.com) — no Node.js APIs required.

`purgecss-browser` exposes the same CSS-purging logic as the main [`purgecss`](../purgecss) package, but without any dependency on Node.js built-ins (`fs`, `path`, `glob`, …).

Because there is no file-system access, **all content and CSS must be passed as raw strings**.

## Installation

```sh
npm install purgecss-browser
```

## Usage

```ts
import { PurgeCSS } from "purgecss-browser";

const results = await new PurgeCSS().purge({
  content: [
    {
      raw: '<div class="used"><span id="hero">Hello</span></div>',
      extension: "html",
    },
  ],
  css: [
    {
      raw: `
        .used   { color: red }
        .unused { color: blue }
        #hero   { font-size: 2rem }
        #gone   { display: none }
      `,
      name: "app.css",
    },
  ],
});

console.log(results[0].css);
// → '.used { color: red }\n#hero { font-size: 2rem }'
```

## Differences from `purgecss`

| Feature | `purgecss` | `purgecss-browser` |
|---|---|---|
| File paths in `content` | ✅ | ❌ |
| Glob patterns in `content` | ✅ | ❌ |
| File paths in `css` | ✅ | ❌ |
| Raw strings in `content` | ✅ | ✅ |
| Raw strings in `css` | ✅ | ✅ |
| CLI | ✅ | ❌ |
| Config file (`purgecss.config.js`) | ✅ | ❌ |
| Works in browsers / edge runtimes | ❌ | ✅ |

## Options

All [PurgeCSS options](https://purgecss.com/configuration.html) that don't involve the file system are supported:

- `content` — `RawContent[]` (`{ raw: string; extension: string }`)
- `css` — `RawCSS[]` (`{ raw: string; name?: string }`)
- `defaultExtractor`
- `extractors`
- `fontFace`
- `keyframes`
- `variables`
- `safelist`
- `blocklist`
- `rejected`
- `rejectedCss`
- `dynamicAttributes`

## Bundler usage

`purgecss-browser` ships an ES module (`purgecss-browser.esm.js`) and a CommonJS build (`purgecss-browser.js`). Its two peer dependencies — `postcss` and `postcss-selector-parser` — are marked as external so your bundler can deduplicate them.

For a fully self-contained `<script type="module">` snippet, bundle the package (and its peer deps) with your own tool (Rollup, esbuild, Vite, …).

## License

MIT
