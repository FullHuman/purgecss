---
"purgecss": patch
---

Only turn a removed selector back into a string when it is reported, with the `rejected` or `rejectedCss` option. Without them, purging a large stylesheet where most selectors are unused, such as Tailwind CSS 2, is about 8% faster.
