---
"purgecss": patch
---

Only look for the `/* purgecss ignore */` and `/* purgecss ignore current */` comments around and inside each rule when the stylesheet has one of them, and only look for the `:where()` and `:is()` left empty in the rules that have one. Walking through a large stylesheet such as Tailwind CSS 2 is about 10% faster.
