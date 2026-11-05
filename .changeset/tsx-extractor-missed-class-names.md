---
"@fullhuman/purgecss-from-tsx": patch
---

Find more of the class names used in TSX, through the updated JSX extractor, so that their CSS is no longer removed. Class names on several lines (`className="flex\n  items-center"`) or separated by tabs are now split correctly, every string of a `className` or `id` expression is extracted (both `"on"` and `"off"` in `className={active ? "on" : "off"}`, not only the last one), along with the static parts of template literals. JSX elements inside the value of another attribute, such as `icon={<Icon className="icon-star" />}` or a render prop, are no longer skipped.
