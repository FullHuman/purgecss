---
"purgecss": patch
---

Trim the selectors returned by the `rejected` option: a selector following a comma used to keep the whitespace before it, e.g. `"\nstrong"` for `em,\nstrong {}`. The selectors in `rejectedCss` no longer keep that whitespace either.
