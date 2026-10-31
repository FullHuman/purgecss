---
"purgecss": patch
---

Keep `:where()` and `:is()` inside `:not()` intact when their selectors are unused, so the negated rule is no longer dropped, for example `.root :not(:where(.unused))`. As with selectors directly inside `:not()`, blocklisted selectors there no longer remove the rule.
