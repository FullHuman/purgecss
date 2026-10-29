---
"purgecss": patch
---

Make the `variables` option scale linearly with the number of custom property declarations. PurgeCSS no longer records dependencies between declarations: the variables used by a used variable are found by name, which gives the same output. With 20,000 rules redefining dependent variables, purging went from about 25 seconds and 2 GB of memory to about half a second.

`VariablesStructure.addVariableUsage` and `VariableNode.nodes` are deprecated: the method does nothing and the list stays empty. `VariablesStructure.setAsUsed` now only marks the declarations of the given variable. They will be removed in the next major version.
