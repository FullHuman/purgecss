---
"rollup-plugin-purgecss": patch
---

Pass the PurgeCSS options (`safelist`, `blocklist`, `extractors`, `variables`, …) to PurgeCSS. Only `content` was used, so every other option was silently ignored.
