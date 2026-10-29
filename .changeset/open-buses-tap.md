---
"purgecss": patch
---

Keep CSS variables that are only referenced inside `@keyframes` when `variables` is enabled. Custom properties declared inside `@keyframes` are now tracked as well, so they are kept when a `var()` reads them and removed otherwise.
