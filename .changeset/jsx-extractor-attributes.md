---
"@fullhuman/purgecss-from-jsx": patch
"@fullhuman/purgecss-from-tsx": patch
---

Keep the attribute selectors and the classes of the `class` attribute. Only the element names and the values of `className` and `id` were extracted, so PurgeCSS removed every attribute selector, e.g. `[data-state="open"]`, `input[type="checkbox"]`, `a[target="_blank"]` or `[class^="icon-"]`, and the classes of `<div class="card">` (Preact, Solid). The names of the attributes and their string values are now extracted, the name also as it is in the HTML: in lower case (`tabIndex`), `class` for `className` and `for` for `htmlFor`. The classes of `class` are extracted like the ones of `className`. Each selector is returned once.
