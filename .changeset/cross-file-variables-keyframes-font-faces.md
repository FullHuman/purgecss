---
"purgecss": patch
---

Keep CSS variables, keyframes and font faces that are defined in one CSS file and used in another one. Unused variables, keyframes and font faces are now removed once every CSS file has been processed, so the result no longer depends on the order of the `css` option.
