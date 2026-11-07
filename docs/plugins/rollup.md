---
title: Rollup
description: "Remove unused CSS from Rollup, Rolldown and Vite builds with rollup-plugin-purgecss: installation, usage, Vite setup, watch mode and plugin options."
lang: en-US
---

# Rollup

The plugin works with [Rollup](https://rollupjs.org) and, since 9.1.0, with [Rolldown](https://rolldown.rs) and [Vite](https://vite.dev) (tested with Vite 8).

## Installation

```sh
npm i rollup-plugin-purgecss -D
```

`rollup` is an optional peer dependency: it is not needed with Rolldown or Vite.

## Usage

```js
// rollup.config.js
import purgecss from "rollup-plugin-purgecss";

export default {
  input: "main.js",
  output: { dir: "dist" },
  plugins: [
    purgecss({
      content: ["index.html", "src/**/*.js"],
    }),
  ],
};
```

Each imported CSS file (`**/*.css` outside of the `node_modules` directories by default) is purged and becomes a JS module whose default export is the purged CSS:

```js
import css from "./style.css"; // the purged CSS, as a string
```

CSS files imported with a query, e.g. `./style.css?raw`, are not purged.

The plugin works the same way with Rolldown, which no longer bundles CSS itself: the purged CSS files are marked as JS modules for it.

### Watch mode

In watch mode (`rollup -w`), the content files are watched: changing one of them purges the CSS again, also after a build that failed because of it. A new file matching a glob of `content` is only used once the CSS is purged again, e.g. after a change to a watched file or a restart. The CSS files are also purged again when the build reuses a Rollup `cache`, as the content may have changed. The content files are only read again when they changed.

## Vite

With Vite, the plugin hands the purged CSS back to Vite, which bundles and minifies it as usual. Add it to the top-level `plugins` array of the Vite config:

```js
// vite.config.js
import purgecss from "rollup-plugin-purgecss";

export default {
  plugins: [
    purgecss({
      content: ["index.html", "src/**/*.{js,ts,jsx,tsx}"],
    }),
  ],
};
```

- The plugin must be in the `plugins` array, without `enforce: "post"`. In `build.rolldownOptions.plugins` or `build.rollupOptions.plugins`, or with `enforce: "post"`, it runs after Vite has turned the CSS files into JS modules and cannot purge them: with Vite 7 and later, the build fails with an error telling to move it. It can be restricted to some environments with `perEnvironmentPlugin`.
- Relative paths and globs of `content` and `skippedContentGlobs`, and the `output` path, are resolved from Vite's `root`.
- The CSS is only purged by `vite build`. The dev server serves it as it is.
- CSS modules (`*.module.css`) are left untouched, with a warning: Vite renames their classes before the plugin runs, so they cannot be found in the content. Exclude them with `exclude` to silence the warning, or use the [PostCSS plugin](postcss.md#css-modules) in Vite's PostCSS config, which keeps their used classes.
- CSS files imported with `?inline` are purged. Those imported with another query, e.g. `?raw` or `?url`, are not. Files processed by a preprocessor (e.g. `.scss`) are only purged when they match `include`.
- `insert` has no effect, and the imported CSS files are not turned into JS modules.
- `output` gets a copy of the purged CSS that Vite bundles in its CSS files: Vite still emits its own CSS file, so do not link both in the page. It does not get the CSS imported with `?inline`, nor the CSS of the `<style>` elements and `style` attributes of `index.html`. When Vite builds several environments (e.g. `vite build --app` or an SSR framework), it only gets the CSS of the client environments.
- The style blocks of Vue and Svelte components match `include` too. Their scoped styles use selectors that are not in the content (`[data-v-…]`, `.svelte-…`): safelist them, e.g. `safelist: [/data-v-/]` or `safelist: [/svelte-/]`, or exclude the components, e.g. `exclude: ["**/node_modules/**", "**/*.vue?*"]`. With Vue, also follow the [Vue guide](../guides/vue.md).

## Options

The plugin accepts the [PurgeCSS options](../configuration.md) (except `css`, which is replaced by the imported CSS files) and:

- #### content

Relative paths and globs are resolved from the current working directory (from Vite's `root` with Vite, as are the relative globs of `skippedContentGlobs`). Without `content` and `contentFunction`, all the CSS is removed, with a warning.

- #### contentFunction

`(sourceFile) => Array<string | RawContent>`: returns the content to use for the CSS file at the path `sourceFile`. When it is set, `content` is not used (and not needed).

- #### include / exclude

Picomatch patterns or regular expressions of the files to purge, `["**/*.css"]` and `"**/node_modules/**"` by default: CSS imported from a dependency (e.g. `import "bootstrap/dist/css/bootstrap.css"`) is not purged unless `exclude` is changed, wherever its `node_modules` directory is (e.g. at the root of a workspace). Relative patterns are resolved from the current working directory.

- #### output

What to do with the purged CSS of all the CSS files once the bundle is generated, in the order the files are imported:

- a path: the CSS is written to this file, relative to the current working directory (to Vite's `root` with Vite). Its directory is created when it does not exist.
- a function: it is called with the CSS and an array of the CSS of each file, `(css, styles) => {}`.

With Rollup and Rolldown, when `output` is set, the imported CSS files export an empty string. When a build no longer has CSS files, e.g. in watch mode, the file is emptied and the function is called with an empty string.

- #### insert

When `true`, the imported CSS files insert their purged CSS in the `<head>` of the document, in a `<style>` element, when the bundle runs in a browser. They still export their CSS.

- #### sourceMap

With Rollup and Rolldown, the source map is inlined in the purged CSS exported by each CSS file. The CSS given to `output` has no source map. With Vite, it is handed to Vite along with the CSS.

::: warning
Before 9.1.0, `insert` broke the build, `contentFunction` was ignored, `output` failed with `ENOENT` when its directory did not exist, and the default `exclude` (`"node_modules/**"`) only matched the `node_modules` directory of the current working directory. The `dest` option has no effect and is deprecated: use `output`.
:::

::: tip
The types of the plugin import the types of `rollup` and `postcss`: if TypeScript cannot find them, e.g. with Vite or Rolldown, or with pnpm, install them as dev dependencies or enable `skipLibCheck`.
:::
