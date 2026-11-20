---
"purgecss": patch
---

Match type selectors and attribute names in any case, as browsers do in HTML: `TD` and `[DATA-STATE]` are kept for `<td data-state>`, and `td` for `<TD>`. Match the value of an attribute selector with the `i` flag in any case: `[href$=".pdf" i]` is kept for `href="Report.PDF"`. These rules were removed. Class names, ids, and attribute values without the `i` flag are still matched case-sensitively.
