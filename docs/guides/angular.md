---
title: Angular
description: "PurgeCSS can be used with Angular through its PostCSS plugin and a postcss.config.json file."
lang: en-US
---

# Angular

Angular's `application` builder, the default for new projects, runs PostCSS on your global styles and on the styles of your components. Since Angular CLI 17.2, it loads a custom PostCSS configuration file, so you can add PurgeCSS with its PostCSS plugin. You don't need a custom builder or a webpack configuration.

## Installation

::::: code-tabs
@tab npm
```sh
npm i -D @fullhuman/postcss-purgecss
```
@tab yarn
```sh
yarn add @fullhuman/postcss-purgecss --dev
```
:::::

## Configuration

Create `postcss.config.json` in the root of your workspace (next to `angular.json`) or of your project:

```json
{
  "plugins": {
    "@fullhuman/postcss-purgecss": {
      "content": ["./src/**/*.html", "./src/**/*.ts"],
      "safelist": [":host"]
    }
  }
}
```

The `content` entries include your component templates, both the `.html` files and the inline templates in `.ts` files. When you run `ng build`, the unused selectors are removed from your global styles and from the styles of your components.

Rules on `:host` and `:host(...)` don't match any element in your templates. Up to version 8.0.0, PurgeCSS removes them unless `:host` is in the `safelist`. Later versions keep them without it.

Things to know:

- Angular only reads `postcss.config.json` or `.postcssrc.json`. A `postcss.config.js` file is ignored.
- If your project already has one of these files, for example for Tailwind CSS, add PurgeCSS to it instead of creating a second one: Angular only reads the first file it finds.
- The configuration applies to every build, including `ng serve`.
- PurgeCSS runs once per stylesheet (your global styles and the styles of each component), and each run reads all the `content` files. On a large project, keep the `content` globs as narrow as you can.

## Safelisting with regular expressions

PurgeCSS parses a string written between slashes as a regular expression, so you can safelist [class names built at runtime](../safelisting.md#class-names-built-at-runtime), or added by a component library, from `postcss.config.json`:

```json
{
  "plugins": {
    "@fullhuman/postcss-purgecss": {
      "content": ["./src/**/*.html", "./src/**/*.ts"],
      "safelist": [":host", "/^btn-/"]
    }
  }
}
```

Flags go after the last slash, as in `"/^btn-/i"`. Any other string still matches a selector exactly. See [Patterns](../safelisting.md#patterns).

### Up to version 8.0.0

Version 8.0.0 and earlier compare every string exactly, so `"/^btn-/"` safelists nothing. With these versions, write the safelist in a `purgecss.config.js` file, in the folder where you run `ng build`, and remove `safelist` from `postcss.config.json`:

```js
// purgecss.config.js
exports.safelist = [":host", /^btn-/];
```

If your `package.json` has `"type": "module"`, write `export const safelist = [":host", /^btn-/];` instead.

::: warning
Up to version 8.0.0, options exported with `module.exports = { ... }` are ignored, and a `safelist` in `postcss.config.json` replaces the one in `purgecss.config.js` instead of adding to it. Export each option by name, as above, and keep the whole safelist in `purgecss.config.js`.
:::
