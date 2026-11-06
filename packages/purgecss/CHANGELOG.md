# purgecss

## 9.0.0

### Major Changes

- 414eafc: Update commander to v15. The `purgecss` command line now requires Node.js 22.12 or later.
- 145e717: Require Node.js 22.12 or later. Every package now declares `"engines": { "node": ">=22.12.0" }`, the version the `purgecss` command line already requires since the update to commander 15.

### Minor Changes

- f81eae3: Accept regular expressions in the `dynamicAttributes` option, e.g. `dynamicAttributes: [/^data-/, /^aria-/]`, to keep attribute selectors on attributes that are set at runtime without listing each attribute
- cdb1e10: Accept regular expressions written as strings between slashes, e.g. `"/^modal-/"` or `"/^btn-/i"`, in `safelist`, `blocklist` and `dynamicAttributes`. Configuration files that cannot contain regular expressions, such as `postcss.config.json` (the only PostCSS configuration Angular supports), can now use patterns. Any other string still matches exactly.
- 9cbf249: Remove the `@property` rules of unused CSS variables when the `variables` option is enabled.
- 8426d2c: Keep root-level selectors made only of pseudo-classes when nothing they depend on is missing, such as `:where(.used):hover`, `:is(h2):hover`, `:where(.used) > :first-child`, `.root:where(:not(.unused))` or a bare `:hover`. They used to be removed even when the classes or tags they target were used. A rule is still removed when the classes or tags it depends on are unused (for example `:where(.unused):hover`).
- 3015636: Accept strings in `safelist.deep` and `safelist.greedy`, in the TypeScript types as well. A string matches a selector part exactly, and a string between slashes such as `"/^modal-/"` is a regular expression, like in the other `safelist` options.

### Patch Changes

- 3c14e5f: Report CLI errors with their message and exit code 1. Errors such as a missing config file or invalid CSS ended the CLI with a full stack trace (for invalid CSS, it also printed the whole stylesheet). When the output file couldn't be written, the CLI printed the error but still exited with code 0, so scripts carried on without the purged CSS.
- 75c7e49: Show the value thrown by a config file or an extractor when it is not an `Error`, for example `throw "oops"`. The CLI now prints `Error loading the config file oops` (or the thrown value, for an extractor) and exits with code 1, and the error from `setOptions` includes the value in its message instead of having an empty one.
- 86bfcb7: Keep CSS variables, keyframes and font faces that are defined in one CSS file and used in another one. Unused variables, keyframes and font faces are now removed once every CSS file has been processed, so the result no longer depends on the order of the `css` option.
- 04bd732: Make the `variables` option scale linearly with the number of custom property declarations. PurgeCSS no longer records dependencies between declarations: the variables used by a used variable are found by name, which gives the same output. With 20,000 rules redefining dependent variables, purging went from about 25 seconds and 2 GB of memory to about half a second.

  `VariablesStructure.addVariableUsage` and `VariableNode.nodes` are deprecated: the method does nothing and the list stays empty. `VariablesStructure.setAsUsed` now only marks the declarations of the given variable. They will be removed in the next major version.

- 51673cf: Speed up the `variables` option when a custom property is redefined in many rules and depends on another redefined custom property (for example `--tw-gradient-stops` in gradient utilities). Each redefinition used to link every earlier declaration again, so large stylesheets could take minutes or crash with `Maximum call stack size exceeded` or `JavaScript heap out of memory`. The CSS output is unchanged.
- ae265ec: Detect CSS variables used with spaces inside `var()`, such as `var( --foo )`, so they are no longer removed when `variables` is enabled. `var(` is now only matched as a whole word, so a function whose name ends in `var` (for example `--myvar(...)`) is no longer mistaken for `var()`.
- 59d91c3: Remove the at-rules left empty after purging, even when they still contain comments or when they only contained another at-rule that was removed, such as `@media (min-width: 600px) { /* comment */ .unused {} }` or `@media screen { @supports (display: grid) { .unused {} } }`. PurgeCSS ignore comments still prevent the at-rule from being removed so they can be processed.
- ca58bf0: Respect ignore comments when removing unused `@keyframes`, `@font-face` and `@property` rules and CSS variables. At-rules inside a `/* purgecss start ignore */` range or after a `/* purgecss ignore */` comment are no longer removed, and the keyframes, font faces and variables used by rules kept with an ignore comment are no longer removed either.
- bc4cf02: Keep `:where()` and `:is()` inside `:not()` intact when their selectors are unused, so the negated rule is no longer dropped, for example `.root :not(:where(.unused))`. As with selectors directly inside `:not()`, blocklisted selectors there no longer remove the rule.
- 32444a1: Keep CSS variables that are only referenced inside `@keyframes` when `variables` is enabled. Custom properties declared inside `@keyframes` are now tracked as well, so they are kept when a `var()` reads them and removed otherwise.
- b7c74dc: Regular expressions with the `g` or `y` flag in `safelist` (`standard`, `deep`, `greedy`, `keyframes` and `variables`) and `blocklist` now match every selector, keyframes or variable they should. Before, `test()` resumed from the previous match's `lastIndex`, so every other match was missed.
- 25c4bea: Keep all the ancestors of a rejected rule in `rejectedCss`. A rule nested in several at-rules or rules, such as `@supports { @media { .rejected {} } }`, `@layer base { @media print { .rejected {} } }` or `.parent { @media { .rejected {} } }`, used to keep only its direct parent, which changed what the rejected selector applies to. The rules nested in a rejected rule are also no longer added a second time, which produced a rule with an empty selector.
- 2b3fd7b: Return only the rules rejected from each CSS file in `rejectedCss`. With several CSS files, the `rejectedCss` of a file also contained the rejected rules nested in at-rules (e.g. `@media`) of every file processed before it.
- e224150: Trim the selectors returned by the `rejected` option: a selector following a comma used to keep the whitespace before it, e.g. `"\nstrong"` for `em,\nstrong {}`. The selectors in `rejectedCss` no longer keep that whitespace either.
- 4a5d71d: Load the config file from a file URL, so that `purgecss --config` and `new PurgeCSS().purge(configFile)` work on Windows and with paths that contain `#`.
