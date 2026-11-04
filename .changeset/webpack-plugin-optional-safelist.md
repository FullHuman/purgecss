---
"purgecss-webpack-plugin": patch
---

Make the `safelist` and `blocklist` options optional in the TypeScript types. `new PurgeCSSPlugin({ paths })` failed to type-check because both options were required.
