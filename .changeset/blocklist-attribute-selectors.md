---
"purgecss": minor
---

Allow blocklisting full attribute selectors, such as `[type="button"]`, while retaining other values of the same attribute. String entries are compared by their parsed attribute names and values, normalizing quotes, whitespace, and equivalent CSS escapes, including Unicode values, while preserving operators, namespaces, and case-sensitivity modifiers. Blocklisting an attribute by name continues to remove all selectors using that name.

Regular expressions in `blocklist` now also match full attribute selectors and their quote variants. Existing unanchored patterns can therefore remove additional selectors: `/nav-/` now removes `[data-section="nav-top"]` as well as matching class or attribute names.
