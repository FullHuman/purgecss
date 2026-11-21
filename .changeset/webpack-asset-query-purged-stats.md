---
"purgecss-webpack-plugin": patch
---

Purge the CSS assets whose name has more than one `?`, and only keep the assets of the last compilation in `purgedStats`.

- The extension of an asset was read from what is before the last `?` of its name instead of the first: an asset named `main.css?v=1?x`, which webpack writes to `main.css`, was silently not purged.
- With the `rejected` option, `purgedStats` was only ever added to. In watch mode with a hash in the name of the assets, e.g. `filename: "[name].css?[contenthash]"` with mini-css-extract-plugin, every rebuild added a key and the keys of the assets that no longer exist were kept. The assets of a compiler are now removed from `purgedStats` when its next compilation starts. With a plugin instance shared by several compilers, the assets of the other compilers are kept.
