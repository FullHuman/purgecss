---
"purgecss": patch
---

Keep the `@font-face` and `@keyframes` rules used in more ways with the `fontFace` and `keyframes` options. A font face used by the `font` shorthand (e.g. `font: 700 2rem Brand, sans-serif`), named in a custom property, or written with another case (e.g. `"Body Text"` used as `body text`) was removed, and so were the `@-webkit-keyframes` rules used by `-webkit-animation` or `-webkit-animation-name`.
