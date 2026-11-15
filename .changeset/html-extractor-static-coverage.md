---
"purgecss-from-html": major
---

Rework static HTML extraction to retain selectors from documents, fragments, parser-discarded source tags, script/style elements, nested templates, SVG, MathML, and both noscript interpretations. Extract embedded HTML from HTML-namespace iframe srcdoc attributes and scripts with a text/html or text/x-template MIME essence.

The default export and result shape are unchanged. Returned arrays now contain unique values in deterministic first-discovery order: each parsing pass collects source tokens before additional parsed-tree values, and embedded documents follow in discovery order. IDs and attribute values are complete decoded strings; only classes are split on HTML ASCII whitespace. Standalone consumers relying on duplicate entries, word-split attribute values or IDs, or the previous order must update their handling. These corrections can also remove CSS rules that were previously retained by partial-value matches.

Use the native parse5 tree to preserve namespaced attributes, and pin parse5 to 8.0.1 for the isolated internal parser hook. Runtime-generated selectors and core selector-matching limitations still require the existing PurgeCSS configuration mechanisms.
