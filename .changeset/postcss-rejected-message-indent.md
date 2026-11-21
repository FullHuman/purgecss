---
"@fullhuman/postcss-purgecss": patch
---

Indent every selector of the `rejected` message the same, one per line: the first one was indented with 10 spaces and the others with 2. Document how to print the message with postcss-reporter, which only prints the warnings and errors by default, and the options without effect in the plugin (`output`, `stdin`, `stdout`, `rejectedCss` and `sourceMap`).
