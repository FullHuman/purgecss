---
"purgecss": patch
---

Remove the rules left empty by the removal of unused CSS variables when `variables` is enabled, along with the at-rules left empty around them. A rule whose variables were all unused, such as `:root { --unused: red; }`, used to stay in the output as an empty block, `:root { }`, also inside `@media`, `@supports` and nested rules. The keyframes left empty, e.g. `from { }`, and the named cascade layers left empty are kept.
