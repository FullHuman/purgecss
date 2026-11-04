---
"purgecss": patch
---

Speed up the `variables` option when a custom property is redefined in many rules and depends on another redefined custom property (for example `--tw-gradient-stops` in gradient utilities). Each redefinition used to link every earlier declaration again, so large stylesheets could take minutes or crash with `Maximum call stack size exceeded` or `JavaScript heap out of memory`. The CSS output is unchanged.
