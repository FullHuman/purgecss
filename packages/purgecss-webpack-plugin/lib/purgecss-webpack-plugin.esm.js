import { existsSync as t } from "fs";
import { PurgeCSS as s } from "purgecss";
import { ConcatSource as e } from "webpack-sources";
import o from "path";
function i(t, s) {
  const e = o.extname(
    (i = t).includes("?")
      ? i
          .split("?")
          .slice(0, -1)
          .join("")
      : i
  );
  var i;
  return s.includes(e);
}
function n(t, s, e = t => t.resource, i) {
  const n = [];
  for (const i of Array.from(t.modulesIterable || [])) {
    const t = e(i);
    t && s.includes(o.extname(t)) && n.push(t);
  }
  return n;
}
const r = [".css", ".scss", ".styl", ".sass", ".less"];
export default class {
  constructor(t) {
    (this.purgedStats = {}), (this.options = t);
  }
  apply(t) {
    t.hooks.compilation.tap("PurgeCSS", t => {
      this.initializePlugin(t);
    }),
      t.hooks.done.tap("PurgeCSS", this.onHooksDone.bind(this));
  }
  onHooksDone(t, s) {
    t.hasErrors()
      ? this.options.verbose &&
        console.warn("purge-webpack-plugin: pausing due to webpack errors")
      : this.options.rejected && (t.purged = this.purgedStats);
  }
  getAssetsToPurge(t, s) {
    return t.filter(t =>
      this.options.only
        ? this.options.only.some(s => t && t.name.includes(s))
        : t && s.includes(t.name)
    );
  }
  initializePlugin(s) {
    const e =
      "function" == typeof this.options.paths
        ? this.options.paths()
        : this.options.paths;
    e.forEach(s => {
      if (!t(s)) throw new Error(`Path ${s} does not exist.`);
    }),
      s.hooks.additionalAssets.tapPromise("PurgeCSS", () =>
        this.runPluginHook(s, e)
      );
  }
  async runPluginHook(t, o) {
    const a = (function(t = {}, s) {
      const e = [];
      for (const [o, n] of Object.entries(t))
        i(o, s) && e.push({ name: o, asset: n });
      return e;
    })(t.assets, [".css"]);
    for (const i of t.chunks) {
      const { files: c } = i,
        l = this.getAssetsToPurge(a, c);
      for (const { name: a, asset: c } of l) {
        const l = o
            .concat(n(i, this.options.moduleExtensions || [], t => t.resource))
            .filter(t => !r.some(s => t.endsWith(s))),
          u = { ...this.options, content: l, css: [{ raw: c.source() }] };
        "function" == typeof u.whitelist && (u.whitelist = u.whitelist()),
          "function" == typeof u.whitelistPatterns &&
            (u.whitelistPatterns = u.whitelistPatterns()),
          "function" == typeof u.whitelistPatternsChildren &&
            (u.whitelistPatternsChildren = u.whitelistPatternsChildren());
        const h = (
          await new s().purge({
            content: u.content,
            css: u.css,
            defaultExtractor: u.defaultExtractor,
            extractors: u.extractors,
            fontFace: u.fontFace,
            keyframes: u.keyframes,
            output: u.output,
            rejected: u.rejected,
            variables: u.variables,
            whitelist: u.whitelist,
            whitelistPatterns: u.whitelistPatterns,
            whitelistPatternsChildren: u.whitelistPatternsChildren
          })
        )[0];
        h.rejected && (this.purgedStats[a] = h.rejected),
          (t.assets[a] = new e(h.css));
      }
    }
  }
}
