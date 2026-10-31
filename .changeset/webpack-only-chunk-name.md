---
"purgecss-webpack-plugin": patch
---

Compare the `only` option with the chunk names, as documented. It was compared with the asset paths, so `only: ["style"]` also purged `style_print.css` or any asset in a `style/` folder.
