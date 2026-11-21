---
"purgecss": patch
---

Keep the named `@layer` blocks left empty, as empty blocks. The order of the cascade layers is the order in which their names first appear, and an empty block still declares its layer: removing `@layer reset { }` from `@layer reset { .unused {} } @layer base { ... } @layer reset { ... }` moved `reset` after `base`, and changed which of the remaining rules win. The other at-rules left empty, anonymous layers included, are still removed.
