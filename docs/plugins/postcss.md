---
title: PostCSS
description: "Remove unused CSS in a PostCSS pipeline with @fullhuman/postcss-purgecss: installation, configuration of content and safelists, and plugin options."
lang: en-US
---

# PostCSS

::: warning
If you are using PostCSS 7, install @fullhuman/postcss-purgecss 3.0.0: `npm i -D @fullhuman/postcss-purgecss@3.0.0`.
From version 4.0, it is compatible with PostCSS >=8 only.
:::

## Installation

```sh
npm i -D @fullhuman/postcss-purgecss postcss
```

## Usage

In `postcss.config.js`:

```js
import purgeCSSPlugin from '@fullhuman/postcss-purgecss';

export default {
  plugins: [
    purgeCSSPlugin({
      content: ['./**/*.html']
    })
  ]
}
```

If your PostCSS configuration is a CommonJS module, use `require` instead:

```js
const purgeCSSPlugin = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    purgeCSSPlugin({
      content: ['./**/*.html']
    })
  ]
}
```

Using PostCSS API:

```js
import purgeCSSPlugin from '@fullhuman/postcss-purgecss';

postcss([
  purgeCSSPlugin({
    content: ['./src/**/*.html']
  })
])
```

See [PostCSS](https://github.com/postcss/postcss) documentation for examples for your environment.

## Configuration file

The plugin also reads the options of `purgecss.config.js` if this file is in the working directory, the folder where you run the build. The options passed to the plugin take precedence over the ones in the config file, except `safelist`: the safelists of both are combined.

```js
// purgecss.config.js
module.exports = {
  content: ['./src/**/*.html'],
  safelist: ['active', /^modal-/]
}
```

```js
// postcss.config.js
import purgeCSSPlugin from '@fullhuman/postcss-purgecss';

export default {
  plugins: [
    purgeCSSPlugin({})
  ]
}
```

The plugin needs an options object, even an empty one, when all the options are in `purgecss.config.js`. If `purgecss.config.js` exists but fails to load, for example because of a syntax error, the build fails with `Error loading the config file ...`.

::: warning
Up to version 8.0.0, options exported with `module.exports = { ... }` or `export default { ... }` are ignored, a config file that fails to load is ignored too, and a `safelist` in the plugin options replaces the one in `purgecss.config.js` instead of adding to it.
:::

## Bundlers and dev servers

Bundlers run PostCSS once per CSS file. Since 9.1.0, the plugin keeps the selectors it extracts from each content file, so the content is not read again for every CSS file: a content file is only read and extracted again when it changed, or when the extractor used for it is another function. The extracted selectors are shared by all the instances of the plugin in the process, as postcss-loader (webpack, Rspack) creates one for every CSS file. The globs of `content` are still resolved for every CSS file, so the files added and removed are picked up. Set [`contentCache: false`](#contentcache) to turn this off.

::: tip
postcss-loader calls a `postcss.config.js` that exports a function once per CSS file. Define the extractor functions (`defaultExtractor`, `extractors`) outside of that function, so that they are the same functions for every CSS file, or the content is extracted again for every CSS file.
:::

### Re-purging when the content changes

Since 9.1.0, the plugin tells the bundler which content each CSS file depends on, with the [PostCSS dependency messages](https://github.com/postcss/postcss/blob/main/docs/guidelines/plugin.md#3-dependencies). Vite, webpack and Rspack (postcss-loader), Next.js (Turbopack and webpack) and Parcel use them to run PostCSS again when a content file changes or is removed, so the dev server serves CSS that matches the content without a restart.

- A content file gives a `dependency` message with its absolute path.
- A glob that starts from a subdirectory, e.g. `./src/**/*.{js,jsx}`, gives a `dir-dependency` message with that directory (`<project>/src`) and the rest of the pattern. webpack, Rspack, Parcel and Turbopack run PostCSS again when a file matching it is created. Vite only watches the files that matched when PostCSS ran: it picks up a new file once something else runs PostCSS again for the CSS file, e.g. an edit of a file that imports the new one.
- A glob that starts from the working directory or above it, e.g. `./*.html` or `**/*.js`, gives a `dependency` message for each file it matched: with any bundler, a file created later is only picked up once something else runs PostCSS again. Start the globs from a subdirectory, e.g. `./src/**/*.js`, so that webpack, Rspack, Parcel and Turbopack pick up the new files.
- A content file that does not exist yet gives a `missing-dependency` message. Vite and Parcel ignore it.

::: warning
Keep the globs narrow, e.g. `./src/**/*.{js,jsx,ts,tsx}` rather than `./**/*`: webpack and Rspack watch the whole directory a glob starts from, and a directory that contains the output of the build would rebuild it again and again.
:::

### Turbopack (Next.js)

Turbopack stops with an error for a path outside its root, so the plugin leaves out the content outside that root. It finds the root as Next.js does when neither `turbopack.root` nor `outputFileTracingRoot` is set: the outermost directory with a workspace marker (`pnpm-workspace.yaml`, `lerna.json`, a `package.json` with `workspaces`) or else a lock file, within the git repository. In a monorepo, content such as `../../packages/ui/src/**/*.tsx` is inside that root and is watched.

If `next.config` sets `turbopack.root` or `outputFileTracingRoot` (Next.js uses `outputFileTracingRoot` when both are set), pass the same directory as [`dependencies: { root }`](#dependencies). Turbopack does not support the extended glob syntax, e.g. `*.@(ts|tsx)`: for such a glob, the plugin watches all the files of the directory it starts from, so prefer `*.{ts,tsx}`.

### CSS modules

Vite runs [postcss-modules](https://github.com/madyankin/postcss-modules) before the PostCSS plugins of the project, so the plugin gets CSS modules with scoped class names, such as `._button_1x2y3_1`, while the content refers to `styles.button`. Since 9.1.0, the plugin reads the names exported by postcss-modules and keeps the scoped classes and IDs whose local name is found in the content, along with the classes they compose. The others are removed, like unused global classes. The values defined with `@value` are not taken as classes. Add the files that import the CSS modules (e.g. `./src/**/*.{js,jsx,ts,tsx}`) to `content`. See [CSS modules](../css_modules.md) for the other setups.

## Options

All of the options of PurgeCSS are available to use with the plugins.
You will find below the type definition of the main options available. For the complete list, go to the [PurgeCSS documentation website](https://www.purgecss.com/configuration.html#options).

```ts
export interface UserDefinedOptions {
  content?: Array<string | RawContent>;
  contentFunction?: (sourceFile: string) => Array<string | RawContent>;
  defaultExtractor?: ExtractorFunction;
  extractors?: Array<Extractors>;
  fontFace?: boolean;
  keyframes?: boolean;
  output?: string;
  rejected?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  safelist?: UserDefinedSafelist;
  blocklist?: StringRegExpArray;
  dependencies?: boolean | { root?: string };
  contentCache?: boolean;
}

interface RawContent {
  extension: string
  raw: string
}

interface RawCSS {
  raw: string
}

type StringRegExpArray = Array<RegExp | string>;
```

### `dependencies`

Type: `boolean | { root?: string }`
Default value: `true`

Added in 9.1.0. Add the [dependency messages](#re-purging-when-the-content-changes) of the content, so that the dev servers run the plugin again when the content changes. Set it to `false` to add no message, e.g. when a bundler rejects a path of the content. Set `root`, absolute or relative to the working directory, to leave out the content outside the root of the bundler; under Turbopack, it defaults to the root Next.js infers.

```js
purgeCSSPlugin({
  content: ['../../packages/ui/src/**/*.tsx', './app/**/*.tsx'],
  dependencies: { root: '../..' } // the value of turbopack.root or outputFileTracingRoot
})
```

### `contentCache`

Type: `boolean`
Default value: `true`

Added in 9.1.0. Keep the selectors extracted from the content files between the CSS files and the runs of the plugin in the process: a content file is only read and extracted again when it changed. Set it to `false` to read and extract the content files for every CSS file, e.g. with an extractor whose result depends on something else than the content file.
