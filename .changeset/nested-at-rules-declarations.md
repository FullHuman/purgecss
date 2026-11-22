---
"purgecss": patch
---

Keep the keyframes, font faces and CSS variables used by the declarations directly inside an at-rule, with the `keyframes`, `fontFace` and `variables` options. With CSS nesting, `.box { @media (...) { animation: spin 1s; } }` removed `@keyframes spin` unless `variables` was enabled too, and a variable only used in a nested `@container`, `@layer`, `@scope` or `@starting-style`, or in `@page`, was removed, leaving `var()` without a value.
