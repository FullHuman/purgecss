---
"purgecss-from-html": patch
---

Keep attribute selectors that match a value of several words, e.g. `[title="hello world"]`, `[title^="hello wo"]` or `[class="card active"]`. Only the words of a value were extracted, never the value itself, so PurgeCSS removed these rules although the HTML has `title="hello world"`.
