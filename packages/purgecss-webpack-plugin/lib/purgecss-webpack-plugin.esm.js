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
const r = [".css", ".scss", ".styl", ".sass", ".less"],
  a = "PurgeCSS";
export default class {
  constructor(t) {
    this.options = t;
  }
  apply(t) {
    t.hooks.compilation.tap(a, t => {
      this.initializePlugin(t);
    }),
      t.hooks.done.tap(a, this.onHooksDone.bind(this));
  }
  async onHooksCompilation(t) {
    this.initializePlugin(t);
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
      s.hooks.additionalAssets.tapPromise(a, () => this.runPluginHook(s, e));
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
          h = { ...this.options, content: l, css: [{ raw: c.source() }] };
        "function" == typeof h.whitelist && (h.whitelist = h.whitelist()),
          "function" == typeof h.whitelistPatterns &&
            (h.whitelistPatterns = h.whitelistPatterns()),
          "function" == typeof h.whitelistPatternsChildren &&
            (h.whitelistPatternsChildren = h.whitelistPatternsChildren());
        const u = (
          await new s().purge({
            content: h.content,
            css: h.css,
            defaultExtractor: h.defaultExtractor,
            extractors: h.extractors,
            fontFace: h.fontFace,
            keyframes: h.keyframes,
            output: h.output,
            rejected: h.rejected,
            variables: h.variables,
            whitelist: h.whitelist,
            whitelistPatterns: h.whitelistPatterns,
            whitelistPatternsChildren: h.whitelistPatternsChildren
          })
        )[0];
        u.rejected && (this.purgedStats[a] = u.rejected),
          (t.assets[a] = new e(u.css));
      }
    }
  }
}
