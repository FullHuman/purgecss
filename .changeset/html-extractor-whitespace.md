---
"purgecss-from-html": patch
---

Split class, id and attribute values on any whitespace, not only spaces. A class next to a new line or a tab, e.g. in a class list written over several lines, was extracted with that new line or tab, so PurgeCSS removed its rules.
