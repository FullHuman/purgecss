---
"purgecss": minor
---

Accept strings in `safelist.deep` and `safelist.greedy`, in the TypeScript types as well. A string matches a selector part exactly, and a string between slashes such as `"/^modal-/"` is a regular expression, like in the other `safelist` options.
