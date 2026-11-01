---
"purgecss": patch
---

Return only the rules rejected from each CSS file in `rejectedCss`. With several CSS files, the `rejectedCss` of a file also contained the rejected rules nested in at-rules (e.g. `@media`) of every file processed before it.
