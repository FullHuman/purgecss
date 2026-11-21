---
"purgecss-from-pug": patch
---

Find the tags, classes, ids and attributes of the HTML written in a Pug template.

- A line of HTML such as `<div class="raw">text</div>` gave no selector, so PurgeCSS removed `.raw` and `div`. The same went for the HTML in the text of a tag (`p This is <em class="inline">text</em>`), in piped text and in a block of text (`p.`): Pug doesn't escape text.
- The HTML written in the strings of JavaScript is read too: `p!= '<b class="bold">' + text + '</b>'` and `p !{'<b class="bold">'}` now give the tag `b` and the class `bold`. The strings are still extracted as undetermined selectors, as before.
- The HTML is read tag by tag, without building a tree, since it is often a fragment cut by an interpolation or a concatenation: `<td class="cell #{state}">` gives the tag `td` and the class `cell`, `'<a href=' + url + ' class="link">'` the tag `a`, the attribute `href` and the class `link`. The names are extracted as they are written and in lower case (`<DIV>`, `<linearGradient>`).
- Not read: HTML comments, the lines of a Pug comment, character references (`&amp;` in a value is kept as it is) and variables (`p!= html` gives nothing, the string assigned to `html` does).
