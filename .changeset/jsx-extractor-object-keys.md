---
"@fullhuman/purgecss-from-jsx": patch
---

Extract the keys of the object literals in a `className` or `id` expression, so that the CSS of class names toggled with the object syntax of `clsx` or `classnames`, such as `active` in `className={clsx({ active: isActive })}`, is no longer removed.
