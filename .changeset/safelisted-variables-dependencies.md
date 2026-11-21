---
"purgecss": patch
---

Keep the CSS variables used by the variables of `safelist.variables` when `variables` is enabled. A safelisted variable such as `--accent: var(--brand)` was kept but `--brand` and its `@property` rule were removed, leaving `var(--brand)` without a value.
