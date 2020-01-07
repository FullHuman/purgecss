import { parse as e } from "postcss";
import t from "postcss-selector-parser";
import { access as s, readFile as r, constants as i } from "fs";
import { promisify as n } from "util";
import o from "glob";
import a from "path";
const u = {
    css: [],
    content: [],
    defaultExtractor: e => e.match(/[A-Za-z0-9_-]+/g) || [],
    extractors: [],
    fontFace: !0,
    keyframes: !0,
    rejected: !1,
    stdin: !1,
    stdout: !1,
    variables: !0,
    whitelist: [],
    whitelistPatterns: [],
    whitelistPatternsChildren: []
  },
  c = [
    "*",
    "::-webkit-scrollbar",
    "::selection",
    ":root",
    "::before",
    "::after"
  ];
class l {
  constructor(e) {
    (this.nodes = []), (this.isUsed = !1), (this.value = e);
  }
}
class d {
  constructor() {
    (this.nodes = new Map()), (this.usedVariables = new Set());
  }
  addVariable(e) {
    const { prop: t } = e;
    if (!this.nodes.has(t)) {
      const s = new l(e);
      this.nodes.set(t, s);
    }
  }
  addVariableUsage(e, t) {
    const { prop: s } = e,
      r = this.nodes.get(s);
    for (const e of t) {
      const t = e[1];
      if (this.nodes.has(t)) {
        const e = this.nodes.get(t);
        r.nodes.push(e);
      }
    }
  }
  addVariableUsageInProperties(e) {
    for (const t of e) {
      const e = t[1];
      this.usedVariables.add(e);
    }
  }
  setAsUsed(e) {
    const t = [this.nodes.get(e)];
    for (; 0 !== t.length; ) {
      const e = t.pop();
      e.isUsed || ((e.isUsed = !0), t.push(...e.nodes));
    }
  }
  removeUnused() {
    for (const e of this.usedVariables) this.setAsUsed(e);
    for (const [, e] of this.nodes) e.isUsed || e.value.remove();
  }
}
const h = { access: n(s), readFile: n(r) };
async function f(e = "purgecss.config.js") {
  let t;
  try {
    const s = a.join(process.cwd(), e);
    t = await import(s);
  } catch (e) {
    throw new Error(`Error loading the config file ${e.message}`);
  }
  return { ...u, ...t };
}
function m(e, t) {
  const s = t(e);
  return Array.isArray(s)
    ? {
        attributes: { names: [], values: [] },
        classes: [],
        ids: [],
        tags: [],
        undetermined: s
      }
    : s;
}
function p(e, t) {
  switch (t) {
    case "next":
      return e.text.includes("purgecss ignore");
    case "start":
      return e.text.includes("purgecss start ignore");
    case "end":
      return e.text.includes("purgecss end ignore");
  }
}
function v(e, t) {
  return {
    attributes: {
      names: [...e.attributes.names, ...t.attributes.names],
      values: [...e.attributes.values, ...t.attributes.values]
    },
    classes: [...e.classes, ...t.classes],
    ids: [...e.ids, ...t.ids],
    tags: [...e.tags, ...t.tags],
    undetermined: [...e.undetermined, ...t.undetermined]
  };
}
function g(e) {
  return e.replace(/(^["'])|(["']$)/g, "");
}
function y(e, t) {
  if (
    !t.attributes.names.includes(e.attribute) &&
    !t.undetermined.includes(e.attribute)
  )
    return !1;
  switch (e.operator) {
    case "$=":
      return (
        t.attributes.values.some(t => t.endsWith(e.value)) ||
        t.undetermined.some(t => t.endsWith(e.value))
      );
    case "~=":
    case "*=":
      return (
        t.attributes.values.some(t => t.includes(e.value)) ||
        t.undetermined.some(t => t.includes(e.value))
      );
    case "=":
      return (
        t.attributes.values.some(t => t === e.value) ||
        t.undetermined.some(t => t === e.value)
      );
    case "|=":
    case "^=":
      return (
        t.attributes.values.some(t => t.startsWith(e.value)) ||
        t.undetermined.some(t => t.startsWith(e.value))
      );
    default:
      return !0;
  }
}
function b(e, t) {
  return t.ids.includes(e.value) || t.undetermined.includes(e.value);
}
function w(e, t) {
  return t.tags.includes(e.value) || t.undetermined.includes(e.value);
}
class S {
  constructor() {
    (this.ignore = !1),
      (this.atRules = { fontFace: [], keyframes: [] }),
      (this.usedAnimations = new Set()),
      (this.usedFontFaces = new Set()),
      (this.selectorsRemoved = new Set()),
      (this.variablesStructure = new d()),
      (this.options = u);
  }
  collectDeclarationsData(e) {
    const { prop: t, value: s } = e;
    this.options.variables;
    {
      const r = (function(e, t) {
        const s = [];
        return (
          e.replace(t, function() {
            const t = Array.prototype.slice.call(arguments, 0, -2);
            return (
              (t.input = arguments[arguments.length - 1]),
              (t.index = arguments[arguments.length - 2]),
              s.push(t),
              e
            );
          }),
          s
        );
      })(s, /var\((.+?)[\,)]/g);
      t.startsWith("--")
        ? (this.variablesStructure.addVariable(e),
          r.length > 0 && this.variablesStructure.addVariableUsage(e, r))
        : r.length > 0 &&
          this.variablesStructure.addVariableUsageInProperties(r);
    }
    if (
      !this.options.keyframes ||
      ("animation" !== t && "animation-name" !== t)
    )
      if (this.options.fontFace) {
        if ("font-family" === t)
          for (const e of s.split(",")) {
            const t = g(e.trim());
            this.usedFontFaces.add(t);
          }
      } else;
    else for (const e of s.split(/[\s,]+/)) this.usedAnimations.add(e);
  }
  getFileExtractor(e, t) {
    const s = t.find(t => t.extensions.find(t => e.endsWith(t)));
    return void 0 === s ? this.options.defaultExtractor : s.extractor;
  }
  async extractSelectorsFromFiles(e, t) {
    let s = {
      attributes: { names: [], values: [] },
      classes: [],
      ids: [],
      tags: [],
      undetermined: []
    };
    for (const r of e) {
      let e = [];
      try {
        await h.access(r, i.F_OK), e.push(r);
      } catch (t) {
        e = o.sync(r);
      }
      for (const r of e) {
        s = v(s, m(await h.readFile(r, "utf-8"), this.getFileExtractor(r, t)));
      }
    }
    return s;
  }
  extractSelectorsFromString(e, t) {
    let s = {
      attributes: { names: [], values: [] },
      classes: [],
      ids: [],
      tags: [],
      undetermined: []
    };
    for (const { raw: r, extension: i } of e) {
      s = v(s, m(r, this.getFileExtractor(`.${i}`, t)));
    }
    return s;
  }
  evaluateAtRule(e) {
    if (this.options.keyframes && e.name.endsWith("keyframes"))
      this.atRules.keyframes.push(e);
    else if (this.options.fontFace && "font-face" === e.name && e.nodes)
      for (const t of e.nodes)
        "decl" === t.type &&
          "font-family" === t.prop &&
          this.atRules.fontFace.push({ name: g(t.value), node: e });
  }
  async evaluateRule(e, s) {
    if (this.ignore) return;
    const r = e.prev();
    if (r && "comment" === r.type && p(r, "next")) return void r.remove();
    if (e.parent && "atrule" === e.parent.type && "keyframes" === e.parent.name)
      return;
    if ("rule" !== e.type) return;
    if (
      (function(e) {
        let t = !1;
        return (
          e.walkComments(e => {
            e &&
              "comment" === e.type &&
              e.text.includes("purgecss ignore current") &&
              ((t = !0), e.remove());
          }),
          t
        );
      })(e)
    )
      return;
    let i = !0;
    if (
      ((e.selector = t(e => {
        e.walk(e => {
          "selector" === e.type &&
            ((i = this.shouldKeepSelector(e, s)),
            i ||
              (this.options.rejected && this.selectorsRemoved.add(e.toString()),
              e.remove()));
        });
      }).processSync(e.selector)),
      i && void 0 !== e.nodes)
    )
      for (const t of e.nodes)
        "decl" === t.type && this.collectDeclarationsData(t);
    const n = e.parent;
    e.selector || e.remove(),
      (function(e) {
        return !!(
          ("rule" === e.type && !e.selector) ||
          (e.nodes && !e.nodes.length) ||
          ("atrule" === e.type &&
            ((!e.nodes && !e.params) ||
              (!e.params && e.nodes && !e.nodes.length)))
        );
      })(n) && n.remove();
  }
  async getPurgedCSS(t, s) {
    const r = [],
      i = [];
    for (const e of t) "string" == typeof e ? i.push(...o.sync(e)) : i.push(e);
    for (const t of i) {
      const i =
          "string" == typeof t
            ? this.options.stdin
              ? t
              : await h.readFile(t, "utf-8")
            : t.raw,
        n = e(i);
      this.walkThroughCSS(n, s),
        this.options.fontFace && this.removeUnusedFontFaces(),
        this.options.keyframes && this.removeUnusedKeyframes(),
        this.options.variables && this.removeUnusedCSSVariables();
      const o = { css: n.toString(), file: "string" == typeof t ? t : void 0 };
      "string" == typeof t && (o.file = t),
        this.options.rejected &&
          ((o.rejected = Array.from(this.selectorsRemoved)),
          this.selectorsRemoved.clear()),
        r.push(o);
    }
    return r;
  }
  isSelectorWhitelisted(e) {
    return (
      c.includes(e) ||
      (this.options.whitelist && this.options.whitelist.some(t => t === e)) ||
      (this.options.whitelistPatterns &&
        this.options.whitelistPatterns.some(t => t.test(e)))
    );
  }
  isSelectorWhitelistedChildren(e) {
    return (
      this.options.whitelistPatternsChildren &&
      this.options.whitelistPatternsChildren.some(t => t.test(e))
    );
  }
  async purge(e) {
    this.options = "object" != typeof e ? await f(e) : { ...u, ...e };
    const { content: t, css: s, extractors: r } = this.options,
      i = t.filter(e => "string" == typeof e),
      n = t.filter(e => "object" == typeof e),
      o = await this.extractSelectorsFromFiles(i, r),
      a = this.extractSelectorsFromString(n, r);
    return this.getPurgedCSS(s, v(o, a));
  }
  removeUnusedCSSVariables() {
    this.variablesStructure.removeUnused();
  }
  removeUnusedFontFaces() {
    for (const { name: e, node: t } of this.atRules.fontFace)
      this.usedFontFaces.has(e) || t.remove();
  }
  removeUnusedKeyframes() {
    for (const e of this.atRules.keyframes)
      this.usedAnimations.has(e.params) || e.remove();
  }
  shouldKeepSelector(e, t) {
    if (
      (function(e) {
        return (
          e.parent &&
          "pseudo" === e.parent.type &&
          e.parent.value.startsWith(":")
        );
      })(e)
    )
      return !0;
    let s = !1;
    for (const n of e.nodes) {
      if (n.value && this.isSelectorWhitelistedChildren(n.value)) return !0;
      if (
        n.value &&
        (c.includes(n.value) || this.isSelectorWhitelisted(n.value))
      )
        s = !0;
      else {
        switch (n.type) {
          case "attribute":
            s = "value" === n.attribute || y(n, t);
            break;
          case "class":
            (r = n),
              (s =
                (i = t).classes.includes(r.value) ||
                i.undetermined.includes(r.value));
            break;
          case "id":
            s = b(n, t);
            break;
          case "tag":
            s = w(n, t);
        }
        if (!s) return !1;
      }
    }
    var r, i;
    return s;
  }
  walkThroughCSS(e, t) {
    e.walk(e =>
      "rule" === e.type
        ? this.evaluateRule(e, t)
        : "atrule" === e.type
        ? this.evaluateAtRule(e)
        : void (
            "comment" === e.type &&
            (p(e, "start")
              ? ((this.ignore = !0), e.remove())
              : p(e, "end") && ((this.ignore = !1), e.remove()))
          )
    );
  }
}
export default S;
export {
  S as PurgeCSS,
  u as defaultOptions,
  v as mergeExtractorSelectors,
  f as setOptions
};
