"use strict";
function _interopDefault(e) {
  return e && "object" == typeof e && "default" in e ? e.default : e;
}
var postcss = _interopDefault(require("postcss")),
  purgecss = require("purgecss");
const purgeCSSPlugin = postcss.plugin("postcss-plugin-purgecss", function(e) {
  return async function(s, t) {
    const r = new purgecss.PurgeCSS(),
      o = { ...purgecss.defaultOptions, ...e };
    r.options = o;
    const { content: c, extractors: n } = o,
      u = c.filter(e => "string" == typeof e),
      p = c.filter(e => "object" == typeof e),
      i = await r.extractSelectorsFromFiles(u, n),
      a = r.extractSelectorsFromString(p, n),
      l = purgecss.mergeExtractorSelectors(i, a);
    r.walkThroughCSS(s, l),
      r.options.fontFace && r.removeUnusedFontFaces(),
      r.options.keyframes && r.removeUnusedKeyframes(),
      r.options.variables && r.removeUnusedCSSVariables(),
      r.options.rejected &&
        r.selectorsRemoved.size > 0 &&
        (t.messages.push({
          type: "purgecss",
          plugin: "postcss-purgecss",
          text: `purging ${
            r.selectorsRemoved.size
          } selectors:\n        ${Array.from(r.selectorsRemoved)
            .map(e => e.trim())
            .join("\n  ")}`
        }),
        r.selectorsRemoved.clear());
  };
});
module.exports = purgeCSSPlugin;
