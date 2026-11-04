---
"purgecss": patch
---

Remove the at-rules left empty after purging, even when they still contain comments or when they only contained another at-rule that was removed, such as `@media (min-width: 600px) { /* comment */ .unused {} }` or `@media screen { @supports (display: grid) { .unused {} } }`. PurgeCSS ignore comments still prevent the at-rule from being removed so they can be processed.
