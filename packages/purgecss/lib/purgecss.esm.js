import { parse as e } from "postcss";
import t from "postcss-selector-parser";
import { access as s, readFile as r, constants as n } from "fs";
import { promisify as i } from "util";
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
  c = "purgecss ignore current",
  l = "purgecss ignore",
  d = "purgecss start ignore",
  h = "purgecss end ignore",
  f = "purgecss.config.js",
  m = "Error loading the config file",
  p = [
    "*",
    "::-webkit-scrollbar",
    "::selection",
    ":root",
    "::before",
    "::after"
  ];
class v {
  constructor(e) {
    (this.nodes = []), (this.isUsed = !1), (this.value = e);
  }
}
class g {
  constructor() {
    (this.nodes = new Map()), (this.usedVariables = new Set());
  }
  getVariableNode(e) {
    return this.nodes.get(e);
  }
  addVariable(e) {
    const { prop: t } = e;
    if (!this.nodes.has(t)) {
      const s = new v(e);
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
const y = { access: i(s), readFile: i(r) };
async function b(e = f) {
  let t;
  try {
    const s = a.join(process.cwd(), e);
    t = await import(s);
  } catch (e) {
    throw new Error(`${m} ${e.message}`);
  }
  return { ...u, ...t };
}
function w(e, t) {
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
function S(e, t) {
  switch (t) {
    case "next":
      return e.text.includes(l);
    case "start":
      return e.text.includes(d);
    case "end":
      return e.text.includes(h);
  }
}
function F(e, t) {
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
function x(e) {
  return e.replace(/(^["'])|(["']$)/g, "");
}
function k(e, t) {
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
function U(e, t) {
  return t.ids.includes(e.value) || t.undetermined.includes(e.value);
}
function R(e, t) {
  return t.tags.includes(e.value) || t.undetermined.includes(e.value);
}
class A {
  constructor() {
    (this.ignore = !1),
      (this.atRules = { fontFace: [], keyframes: [] }),
      (this.usedAnimations = new Set()),
      (this.usedFontFaces = new Set()),
      (this.selectorsRemoved = new Set()),
      (this.variablesStructure = new g()),
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
            const t = x(e.trim());
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
        await y.access(r, n.F_OK), e.push(r);
      } catch (t) {
        e = o.sync(r);
      }
      for (const r of e) {
        s = F(s, w(await y.readFile(r, "utf-8"), this.getFileExtractor(r, t)));
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
    for (const { raw: r, extension: n } of e) {
      s = F(s, w(r, this.getFileExtractor(`.${n}`, t)));
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
          this.atRules.fontFace.push({ name: x(t.value), node: e });
  }
  async evaluateRule(e, s) {
    if (this.ignore) return;
    const r = e.prev();
    if (r && "comment" === r.type && S(r, "next")) return void r.remove();
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
              e.text.includes(c) &&
              ((t = !0), e.remove());
          }),
          t
        );
      })(e)
    )
      return;
    let n = !0;
    if (
      ((e.selector = t(e => {
        e.walk(e => {
          "selector" === e.type &&
            ((n = this.shouldKeepSelector(e, s)) ||
              (this.options.rejected && this.selectorsRemoved.add(e.toString()),
              e.remove()));
        });
      }).processSync(e.selector)),
      n && void 0 !== e.nodes)
    )
      for (const t of e.nodes)
        "decl" === t.type && this.collectDeclarationsData(t);
    const i = e.parent;
    e.selector || e.remove(),
      (function(e) {
        return !!(
          ("rule" === e.type && !e.selector) ||
          (e.nodes && !e.nodes.length) ||
          ("atrule" === e.type &&
            ((!e.nodes && !e.params) ||
              (!e.params && e.nodes && !e.nodes.length)))
        );
      })(i) && i.remove();
  }
  async getPurgedCSS(t, s) {
    const r = [],
      n = [];
    for (const e of t) "string" == typeof e ? n.push(...o.sync(e)) : n.push(e);
    for (const t of n) {
      const n =
          "string" == typeof t
            ? this.options.stdin
              ? t
              : await y.readFile(t, "utf-8")
            : t.raw,
        i = e(n);
      this.walkThroughCSS(i, s),
        this.options.fontFace && this.removeUnusedFontFaces(),
        this.options.keyframes && this.removeUnusedKeyframes(),
        this.options.variables && this.removeUnusedCSSVariables();
      const o = { css: i.toString(), file: "string" == typeof t ? t : void 0 };
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
      p.includes(e) ||
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
    this.options = "object" != typeof e ? await b(e) : { ...u, ...e };
    const { content: t, css: s, extractors: r } = this.options,
      n = t.filter(e => "string" == typeof e),
      i = t.filter(e => "object" == typeof e),
      o = await this.extractSelectorsFromFiles(n, r),
      a = this.extractSelectorsFromString(i, r);
    return this.getPurgedCSS(s, F(o, a));
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
          e.parent && "pseudo" === e.parent.type && ":not" === e.parent.value
        );
      })(e)
    )
      return !0;
    let s = !1;
    for (const i of e.nodes) {
      if (i.value && this.isSelectorWhitelistedChildren(i.value)) return !0;
      if (
        i.value &&
        (p.includes(i.value) || this.isSelectorWhitelisted(i.value))
      )
        s = !0;
      else {
        switch (i.type) {
          case "attribute":
            s = "value" === i.attribute || k(i, t);
            break;
          case "class":
            (r = i),
              (s =
                (n = t).classes.includes(r.value) ||
                n.undetermined.includes(r.value));
            break;
          case "id":
            s = U(i, t);
            break;
          case "tag":
            s = R(i, t);
        }
        if (!s) return !1;
      }
    }
    var r, n;
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
            (S(e, "start")
              ? ((this.ignore = !0), e.remove())
              : S(e, "end") && ((this.ignore = !1), e.remove()))
          )
    );
  }
}
export default A;
export {
  A as PurgeCSS,
  u as defaultOptions,
  F as mergeExtractorSelectors,
  b as setOptions
};
