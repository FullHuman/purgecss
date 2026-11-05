---
"purgecss-webpack-plugin": minor
---

Compare the `only` option with the chunk names, as documented. It was compared with the asset paths, so `only: ["style"]` also purged `style_print.css` or any asset in a `style/` folder. A configuration that relied on this, such as `only: ["css/main"]` or `only: ["main.css"]`, no longer purges anything: list the chunk names instead, for an entrypoint its key in `entry`.
