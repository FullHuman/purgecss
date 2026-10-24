---
"purgecss": patch
---

Detect CSS variables used with spaces inside `var()`, such as `var( --foo )`, so they are no longer removed when `variables` is enabled. `var(` is now only matched as a whole word, so a function whose name ends in `var` (for example `--myvar(...)`) is no longer mistaken for `var()`.
