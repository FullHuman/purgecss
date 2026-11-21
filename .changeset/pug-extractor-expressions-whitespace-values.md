---
"purgecss-from-pug": patch
---

Find the classes of class arrays and class objects, split values on any whitespace, and keep attribute selectors that match a value of several words.

- `div(class=['foo', 'bar'])` gave the classes `[foo,` and `bar]`, and `div(class={active: isActive, 'is-open': open})` gave `{active:`, `isActive,`, `is-open:` and `open}`, so PurgeCSS removed `.foo`, `.bar`, `.active` and `.is-open`. The value of an attribute is now parsed as the JavaScript expression it is: its strings, its numbers and the keys of a class object are extracted, as `purgecss-from-jsx` does. The other parts of an expression, e.g. the names of variables and operators, are no longer extracted.
- A class next to a new line or a tab, e.g. in a template literal written over several lines, was extracted with that new line or tab, and several spaces in a row gave an empty class. Values are now split on space, tab, new line, form feed and carriage return, as `purgecss-from-html` does.
- Only the words of a value were extracted, never the value itself, so PurgeCSS removed `[title="hello world"]` although the template has `div(title="hello world")`. The whole value is now extracted too, as `purgecss-from-html` does.
