---
"purgecss": minor
---

Keep root-level selectors made only of pseudo-classes when nothing they depend on is missing, such as `:where(.used):hover`, `:is(h2):hover`, `:where(.used) > :first-child`, `.root:where(:not(.unused))` or a bare `:hover`. They used to be removed even when the classes or tags they target were used. A rule is still removed when the classes or tags it depends on are unused (for example `:where(.unused):hover`).
