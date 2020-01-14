import e from "postcss";
import {
  PurgeCSS as s,
  mergeExtractorSelectors as o,
  defaultOptions as t
} from "purgecss";
const r = e.plugin("postcss-plugin-purgecss", function(e) {
  return async function(r, n) {
    const c = new s(),
      i = { ...t, ...e };
    c.options = i;
    const { content: p, extractors: a } = i,
      m = p.filter(e => "string" == typeof e),
      l = p.filter(e => "object" == typeof e),
      u = await c.extractSelectorsFromFiles(m, a),
      f = c.extractSelectorsFromString(l, a),
      g = o(u, f);
    c.walkThroughCSS(r, g),
      c.options.fontFace && c.removeUnusedFontFaces(),
      c.options.keyframes && c.removeUnusedKeyframes(),
      c.options.variables && c.removeUnusedCSSVariables(),
      c.options.rejected &&
        c.selectorsRemoved.size > 0 &&
        (n.messages.push({
          type: "purgecss",
          plugin: "postcss-purgecss",
          text: `purging ${
            c.selectorsRemoved.size
          } selectors:\n        ${Array.from(c.selectorsRemoved)
            .map(e => e.trim())
            .join("\n  ")}`
        }),
        c.selectorsRemoved.clear());
  };
});
export default r;
