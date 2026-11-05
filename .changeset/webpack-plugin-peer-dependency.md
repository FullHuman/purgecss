---
"purgecss-webpack-plugin": major
---

Make `webpack` a peer dependency (`^5.0.0`) instead of a dependency. The plugin now uses the webpack installed in your project instead of installing its own copy, so `webpack` must be installed alongside `purgecss-webpack-plugin`.
