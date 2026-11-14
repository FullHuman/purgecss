# PostCSS Purgecss
![David (path)](https://img.shields.io/david/FullHuman/purgecss?path=packages%2Fpostcss-purgecss&style=for-the-badge)
![Dependabot](https://img.shields.io/badge/dependabot-enabled-%23024ea4?style=for-the-badge)
![npm](https://img.shields.io/npm/v/@fullhuman/postcss-purgecss?style=for-the-badge)
![npm](https://img.shields.io/npm/dw/@fullhuman/postcss-purgecss?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/FullHuman/purgecss?style=for-the-badge)

[PostCSS] plugin for PurgeCSS.

[PostCSS]: https://github.com/postcss/postcss

## Installation

```
npm i -D @fullhuman/postcss-purgecss postcss
```

## Usage

```js
const purgecss = require('@fullhuman/postcss-purgecss')
postcss([
  purgecss({
    content: ['./src/**/*.html']
  })
])
```

See [PostCSS] docs for examples for your environment.

## Configuration file

The plugin also reads the options of `purgecss.config.js` if this file is in the working directory. The options passed to the plugin take precedence, except `safelist`: the safelists of both are combined. When all the options are in `purgecss.config.js`, pass an empty object to the plugin: `purgecss({})`. A `purgecss.config.js` that fails to load fails the build. See the [documentation](https://www.purgecss.com/plugins/postcss.html#configuration-file).

## Bundlers and dev servers

Bundlers run PostCSS once per CSS file. The plugin keeps the selectors it extracts from each content file, so the content is not read again for every CSS file: a content file is only read and extracted again when it changed (modification time, size), or when the extractor used for it is another function. postcss-loader (webpack, Rspack) calls a `postcss.config.js` that exports a function once per CSS file: define the extractor functions (`defaultExtractor`, `extractors`) outside of that function, so that they are the same functions for every CSS file, or the content is extracted again for every CSS file. The globs of `content` are still resolved for every CSS file, so the files added and removed are picked up. The extracted selectors are shared by all the instances of the plugin in the process, as postcss-loader (webpack, Rspack) creates one for every CSS file.

For each CSS file, the plugin tells the bundler which content it depends on, with the [PostCSS dependency messages](https://github.com/postcss/postcss/blob/main/docs/guidelines/plugin.md#3-dependencies):

- a content file gives a `dependency` message with its absolute path;
- a glob that starts from a subdirectory gives a `dir-dependency` message with that directory and the rest of the pattern, e.g. `./src/**/*.{js,jsx}` gives the directory `<project>/src` and the glob `**/*.{js,jsx}`. webpack, Rspack, Parcel and Turbopack run PostCSS again when a file matching it is created. Vite does not watch the glob: it watches the files that match it when PostCSS runs, so it only picks up a new file once something else runs PostCSS again for the CSS file, e.g. an edit of a file that imports the new one;
- a glob that starts from the working directory or above it, e.g. `./*.html` or `**/*.js`, gives a `dependency` message for each file it matched: with any bundler, a file created later that matches it is only picked up once something else runs PostCSS again. Start the globs from a subdirectory, e.g. `./src/**/*.js`, so that webpack, Rspack, Parcel and Turbopack pick up the new files;
- a content file that does not exist yet gives a `missing-dependency` message. Vite and Parcel ignore it: they only pick up the file once something else runs PostCSS again.

Vite, webpack and Rspack (postcss-loader), Next.js (Turbopack and webpack) and Parcel use them to run PostCSS again when a content file changes or is removed, so the dev server serves CSS that matches the content without a restart. Keep the globs narrow, e.g. `./src/**/*.{js,jsx,ts,tsx}` rather than `./**/*`: webpack and Rspack watch the whole directory a glob starts from, and a directory that contains the output of the build would rebuild it again and again.

Turbopack (Next.js) stops with an error for a path outside its root, so the plugin leaves out the content outside that root. It finds the root as Next.js does when neither `turbopack.root` nor `outputFileTracingRoot` is set: the outermost directory with a workspace marker (`pnpm-workspace.yaml`, `lerna.json`, a `package.json` with `workspaces`) or else a lock file, within the git repository. In a monorepo, content such as `../../packages/ui/src/**/*.tsx` is inside that root and is watched. If `next.config` sets `turbopack.root` or `outputFileTracingRoot` (Next.js uses `outputFileTracingRoot` when both are set), pass the same directory as `dependencies: { root }`. Turbopack does not support the extended glob syntax, e.g. `*.@(ts|tsx)`: for such a glob, the plugin watches all the files of the directory it starts from; prefer `*.{ts,tsx}`.

### CSS modules

Vite runs [postcss-modules](https://github.com/madyankin/postcss-modules) before the PostCSS plugins of the project, so the plugin gets CSS modules with scoped class names, such as `._button_1x2y3_1`, while the content refers to `styles.button`. The plugin reads the names exported by postcss-modules (its `export` message) and keeps the scoped classes and IDs whose local name is found in the content, along with the classes they compose. The scoped classes and IDs whose local name is not found are removed. The values defined with `@value`, which postcss-modules exports along with the classes, are not taken as classes. Add the files that import the CSS modules (e.g. `./src/**/*.{js,jsx,ts,tsx}`) to `content`.

## Options

All of the options of purgecss are available to use with the plugins.
You will find below the main options available. For the complete list, go to the [purgecss documentation website](https://www.purgecss.com/configuration.html#options).

### `content` (**required** or use `contentFunction` instead)
Type: `Array<string>`

You can specify content that should be analyzed by Purgecss with an array of filenames or globs. The files can be HTML, Pug, Blade, etc.

### `contentFunction` (as alternative to `content`)
Type: `(sourceInputFile: string) => Array<string>`

The function receives the current source input file. With this you may provide a specific array of globs for each input. E.g. for 
an angular application only scan the components template counterpart for every component scss file:

```js
purgecss({
  contentFunction: (sourceInputFileName: string) => {
    if (/component\.scss$/.test(sourceInputFileName))
      return [sourceInputFileName.replace(/scss$/, 'html')]
    else
      return ['./src/**/*.html']
  },
})
```

### `extractors`
Type: `Array<Object>`

Purgecss can be adapted to suit your needs. If you notice a lot of unused CSS is not being removed, you might want to use a custom extractor.
More information about extractors [here](https://www.purgecss.com/extractors.html).

### `safelist`

You can indicate which selectors are safe to leave in the final CSS. This can be accomplished with the option `safelist`.

Two forms are available for this option.

```ts
safelist: ['random', 'yep', 'button', /^nav-/]
```

In this form, safelist is an array that can take a string or a regex.

The _complex_ form is:

```ts
safelist: {
    standard: ['random', 'yep', 'button', /^nav-/],
    deep: [],
    greedy: [],
    keyframes: [],
    variables: []
}
```

### `blocklist`

Blocklist will block the CSS selectors from appearing in the final output CSS. The selectors will be removed even when they are seen as used by PurgeCSS.

```ts
blocklist: ['usedClass', /^nav-/]
```
Even if nav-links and usedClass are found by an extractor, they will be removed.

### `skippedContentGlobs`

If you provide globs for the `content` parameter, you can use this option to exclude certain files or folders that would otherwise be scanned. Pass an array of globs matching items that should be excluded. (Note: this option has no effect if `content` is not globs.)

```ts
skippedContentGlobs: ['node_modules/**', 'components/**']
```
Here, PurgeCSS will not scan anything in the "node_modules" and "components" folders.


### `dependencies`
Type: `boolean | { root?: string }`
Default value: `true`

Add the dependency messages of the content, so that the dev servers run the plugin again when the content changes (see [Bundlers and dev servers](#bundlers-and-dev-servers)). Set it to `false` to add no message, e.g. when a bundler rejects a path of the content. Set `root`, absolute or relative to the working directory, to leave out the content outside the root of the bundler; under Turbopack, it defaults to the root Next.js infers.

```js
purgecss({
  content: ['../../packages/ui/src/**/*.tsx', './app/**/*.tsx'],
  dependencies: { root: '../..' } // the value of turbopack.root or outputFileTracingRoot
})
```

### `contentCache`
Type: `boolean`
Default value: `true`

Keep the selectors extracted from the content files between the CSS files and the runs of the plugin in the process: a content file is only read and extracted again when it changed. Set it to `false` to read and extract the content files for every CSS file, e.g. with an extractor whose result depends on something else than the content file.

### `rejected`
Type: `boolean`
Default value: `false`

If true, purged selectors will be captured and rendered as PostCSS messages.
Use with a PostCSS reporter plugin like [`postcss-reporter`](https://github.com/postcss/postcss-reporter)
to print the purged selectors to the console as they are processed.

### `keyframes`
Type: `boolean`
Default value: `false`

If you are using a CSS animation library such as animate.css, you can remove unused keyframes by setting the keyframes option to true.

#### `fontFace`
Type: `boolean`
Default value: `false`

If there are any unused @font-face rules in your css, you can remove them by setting the fontFace option to true.

## Contributing

Please read [CONTRIBUTING.md](./../../CONTRIBUTING.md) for details on our code of
conduct, and the process for submitting pull requests to us.

## Versioning

postcss-purgecss use [SemVer](http://semver.org/) for versioning.

## License

This project is licensed under the MIT License - see the [LICENSE](./../../LICENSE) file
for details.
