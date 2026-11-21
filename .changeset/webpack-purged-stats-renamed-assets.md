---
"purgecss-webpack-plugin": patch
---

Key `purgedStats` by the final names of the assets.

With the `rejected` option, the keys of `purgedStats` were the names the assets had when they were purged. With `optimization.realContentHash`, enabled in production mode, webpack and Rspack then replace the content hash in the name of an asset with the hash of its final content: with `filename: "[name].[contenthash].css"`, the key matched no emitted asset. The keys now follow the assets that are renamed after they are purged. To follow them, the name an asset is purged under is stored in its asset info, as `purgecssName`, when `rejected` is set.
