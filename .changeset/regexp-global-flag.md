---
"purgecss": patch
---

Regular expressions with the `g` or `y` flag in `safelist` (`standard`, `deep`, `greedy`, `keyframes` and `variables`) and `blocklist` now match every selector, keyframes or variable they should. Before, `test()` resumed from the previous match's `lastIndex`, so every other match was missed.
