---
"purgecss": patch
---

Respect ignore comments when removing unused `@keyframes`, `@font-face` and `@property` rules and CSS variables. At-rules inside a `/* purgecss start ignore */` range or after a `/* purgecss ignore */` comment are no longer removed, and the keyframes, font faces and variables used by rules kept with an ignore comment are no longer removed either.
