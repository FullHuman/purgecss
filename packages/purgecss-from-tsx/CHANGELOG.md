# @fullhuman/purgecss-from-tsx

## 9.0.0

### Major Changes

- 145e717: Require Node.js 22.12 or later. Every package now declares `"engines": { "node": ">=22.12.0" }`, the version the `purgecss` command line already requires since the update to commander 15.

### Patch Changes

- 2a2a13b: Find more of the class names used in TSX, through the updated JSX extractor, so that their CSS is no longer removed. Class names on several lines (`className="flex\n  items-center"`) or separated by tabs are now split correctly, every string of a `className` or `id` expression is extracted (both `"on"` and `"off"` in `className={active ? "on" : "off"}`, not only the last one), along with the static parts of template literals. JSX elements inside the value of another attribute, such as `icon={<Icon className="icon-star" />}` or a render prop, are no longer skipped.
- 5aa284a: Extract the keys of the object literals in a `className` or `id` expression, through the updated JSX extractor, so that the CSS of class names toggled with the object syntax of `clsx` or `classnames`, such as `active` in `className={clsx({ active: isActive })}`, is no longer removed.
- Updated dependencies [e8d1ffc]
- Updated dependencies [5aa284a]
- Updated dependencies [145e717]
  - @fullhuman/purgecss-from-jsx@9.0.0
