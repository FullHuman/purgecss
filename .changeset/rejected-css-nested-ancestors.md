---
"purgecss": patch
---

Keep all the ancestors of a rejected rule in `rejectedCss`. A rule nested in several at-rules or rules, such as `@supports { @media { .rejected {} } }`, `@layer base { @media print { .rejected {} } }` or `.parent { @media { .rejected {} } }`, used to keep only its direct parent, which changed what the rejected selector applies to. The rules nested in a rejected rule are also no longer added a second time, which produced a rule with an empty selector.
