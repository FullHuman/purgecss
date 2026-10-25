---
"purgecss": minor
---

Allow blocklisting full attribute selectors, such as `[type="button"]`, while retaining other values of the same attribute. String entries are compared by their parsed attribute names and values, normalizing quotes, whitespace, and equivalent CSS escapes, including Unicode values, while preserving operators, namespaces, and case-sensitivity modifiers. Blocklisting an attribute by name continues to remove all selectors using that name.

Regular expressions in `blocklist` now also match full attribute selectors and their quote variants. Existing unanchored patterns can therefore remove additional selectors: `/nav-/` now removes `[data-section="nav-top"]` as well as matching class or attribute names.

Match escaped case-sensitivity modifiers in attribute-selector strings and distinguish wildcard namespace prefixes from escaped literal names. Evaluate global and sticky blocklist regexes independently for each candidate without changing their `lastIndex`, so an attribute match cannot cause a subsequent class, ID, or tag to be missed.
