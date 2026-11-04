---
"purgecss-webpack-plugin": patch
---

Pass the `dynamicAttributes` option to PurgeCSS. The webpack plugin ignored it, so attribute selectors such as `.tab[aria-selected="true"]` were removed even when the attribute was listed in `dynamicAttributes`.
