---
"purgecss-from-pug": patch
---

Find the strings of the JavaScript of `each`, mixins, interpolations and conditions.

- `each size in ['sm', 'lg']` followed by `div(class=size)` gave no class, so PurgeCSS removed `.sm` and `.lg`. The same went for the argument of `+button('btn-primary')`, the default argument of `mixin button(cls = 'btn-default')`, an interpolation such as `<div class="#{isOn ? 'on' : 'off'}">` or `p #{isOn ? 'on' : 'off'}`, and the interpolated tag `#{isMain ? 'main' : 'section'}`.
- The strings and the static parts of the template literals of this JavaScript are now extracted as undetermined selectors, as the ones of a line of code (`- var classes = ['foo', 'bar']`) already are. Variables are still not followed.
- The strings of the conditions `if`, `else if`, `unless`, `while`, `case` and `when` are extracted too, as the ones of `- if (theme === 'dark') {` already are: a value a variable is compared to is a value it can have, e.g. `when 'warning'` before `p(class=kind)`.
