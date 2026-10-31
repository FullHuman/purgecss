---
"rollup-plugin-purgecss": patch
---

Make the `output` option optional in the TypeScript types. It was declared as required, so the usage shown in the README (`purgecss({ content })`, which exports the purged CSS as a string) did not type-check.
