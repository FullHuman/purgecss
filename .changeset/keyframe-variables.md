---
"purgecss": patch
---

Preserve CSS variables referenced inside retained keyframes, including prefixed keyframes and variable dependencies. Variables used only by removed animations are still removed.

Respect ignore comments in keyframe rules while retaining their dependencies. Handle CSS whitespace in variable references without altering non-ASCII names, and preserve dependencies of safelisted variables, including those matched by stateful regular expressions. Preserve shared variable and animation usages across files in one purge call while isolating separate calls.
