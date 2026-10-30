---
"purgecss": minor
---

Accept regular expressions written as strings between slashes, e.g. `"/^modal-/"` or `"/^btn-/i"`, in `safelist`, `blocklist` and `dynamicAttributes`. Configuration files that cannot contain regular expressions, such as `postcss.config.json` (the only PostCSS configuration Angular supports), can now use patterns. Any other string still matches exactly.
