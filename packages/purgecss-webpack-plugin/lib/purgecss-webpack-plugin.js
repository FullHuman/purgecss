"use strict";
function _interopDefault(t) {
  return t && "object" == typeof t && "default" in t ? t.default : t;
}
var fs = require("fs"),
  purgecss = require("purgecss"),
  webpackSources = require("webpack-sources"),
  path = _interopDefault(require("path"));
function getFormattedFilename(t) {
  return t.includes("?")
    ? t
        .split("?")
        .slice(0, -1)
        .join("")
    : t;
}
function isFileOfTypes(t, e) {
  const s = path.extname(getFormattedFilename(t));
  return e.includes(s);
}
function getAssets(t = {}, e) {
  const s = [];
  for (const [i, n] of Object.entries(t))
    isFileOfTypes(i, e) && s.push({ name: i, asset: n });
  return s;
}
function files(t, e, s = t => t.resource, i) {
  const n = [];
  for (const i of Array.from(t.modulesIterable || [])) {
    const t = s(i);
    t && e.includes(path.extname(t)) && n.push(t);
  }
  return n;
}
const styleExtensions = [".css", ".scss", ".styl", ".sass", ".less"],
  pluginName = "PurgeCSS";
class PurgeCSSPlugin {
  constructor(t) {
    (this.purgedStats = {}), (this.options = t);
  }
  apply(t) {
    t.hooks.compilation.tap(pluginName, t => {
      this.initializePlugin(t);
    }),
      t.hooks.done.tap(pluginName, this.onHooksDone.bind(this));
  }
  onHooksDone(t, e) {
    t.hasErrors()
      ? this.options.verbose &&
        console.warn("purge-webpack-plugin: pausing due to webpack errors")
      : this.options.rejected && (t.purged = this.purgedStats);
  }
  getAssetsToPurge(t, e) {
    return t.filter(t =>
      this.options.only
        ? this.options.only.some(e => t && t.name.includes(e))
        : t && e.includes(t.name)
    );
  }
  initializePlugin(t) {
    const e =
      "function" == typeof this.options.paths
        ? this.options.paths()
        : this.options.paths;
    e.forEach(t => {
      if (!fs.existsSync(t)) throw new Error(`Path ${t} does not exist.`);
    }),
      t.hooks.additionalAssets.tapPromise(pluginName, () =>
        this.runPluginHook(t, e)
      );
  }
  async runPluginHook(t, e) {
    const s = getAssets(t.assets, [".css"]);
    for (const i of t.chunks) {
      const { files: n } = i,
        o = this.getAssetsToPurge(s, n);
      for (const { name: s, asset: n } of o) {
        const o = e
            .concat(
              files(i, this.options.moduleExtensions || [], t => t.resource)
            )
            .filter(t => !styleExtensions.some(e => t.endsWith(e))),
          r = { ...this.options, content: o, css: [{ raw: n.source() }] };
        "function" == typeof r.whitelist && (r.whitelist = r.whitelist()),
          "function" == typeof r.whitelistPatterns &&
            (r.whitelistPatterns = r.whitelistPatterns()),
          "function" == typeof r.whitelistPatternsChildren &&
            (r.whitelistPatternsChildren = r.whitelistPatternsChildren());
        const a = (
          await new purgecss.PurgeCSS().purge({
            content: r.content,
            css: r.css,
            defaultExtractor: r.defaultExtractor,
            extractors: r.extractors,
            fontFace: r.fontFace,
            keyframes: r.keyframes,
            output: r.output,
            rejected: r.rejected,
            variables: r.variables,
            whitelist: r.whitelist,
            whitelistPatterns: r.whitelistPatterns,
            whitelistPatternsChildren: r.whitelistPatternsChildren
          })
        )[0];
        a.rejected && (this.purgedStats[s] = a.rejected),
          (t.assets[s] = new webpackSources.ConcatSource(a.css));
      }
    }
  }
}
module.exports = PurgeCSSPlugin;
