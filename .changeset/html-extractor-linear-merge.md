---
"purgecss-from-html": patch
---

Add the selectors of every element to a single result instead of copying the results found so far for each element. The extraction time grew with the square of the number of sibling elements: a list of 16,000 items took about 12 seconds, it now takes about 0.1 second. The selectors found, and their order, are the same.
