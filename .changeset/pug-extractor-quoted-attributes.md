---
"purgecss-from-pug": patch
---

Remove the quotes around attribute values written with single quotes, backticks or `!=`. `div(class='card' id='main')` gave the class `'card'` and the id `'main'`, quotes included, so PurgeCSS removed `.card` and `#main`. Only double-quoted `=` attributes were handled.
