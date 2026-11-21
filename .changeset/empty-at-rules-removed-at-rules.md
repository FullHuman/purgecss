---
"purgecss": patch
---

Remove the at-rules left empty by the removal of unused `@keyframes`, `@font-face` and `@property` rules, such as `@media (prefers-reduced-motion: no-preference) { @keyframes unused {} }` with the `keyframes` option. They used to stay in the output as empty blocks, e.g. `@media (prefers-reduced-motion: no-preference) { }`.
