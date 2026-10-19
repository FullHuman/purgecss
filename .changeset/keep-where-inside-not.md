---
"purgecss": patch
---

Keep `:where()` and `:is()` inside `:not()` intact when their selectors are unused, so the negated rule is no longer dropped
