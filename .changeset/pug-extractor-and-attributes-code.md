---
"purgecss-from-pug": patch
---

Find the attributes of `&attributes` and the strings of code.

- `div&attributes({class: 'foo bar', id: 'main', title: 'hello world'})` gave no class, id, attribute name or attribute value, so PurgeCSS removed `.foo`, `.bar`, `#main` and `[title]`. Each property written in the object is now an attribute, with the rules of an attribute in parentheses: class arrays and class objects, values split on whitespace, whole value kept. An object only known at runtime gives nothing, e.g. `&attributes(attributes)`, a spread object or a computed name.
- `- var classes = ['foo', 'bar']` followed by `div(class=classes)` gave no class, so PurgeCSS removed `.foo` and `.bar`. The strings and the static parts of the template literals of unbuffered code (`- code`, and a block of code under `-`) and of buffered code (`= code`, `!= code`) are now extracted as undetermined selectors, which keep the classes, ids, tags and attributes of the same name. Variables are not followed: every string of the code is kept, whether it ends in a class or not.
