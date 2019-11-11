import { parse as e } from "postcss";
import t from "postcss-selector-parser";
import { promises as s, constants as r } from "fs";
import n from "glob";
import i from "path";
const o = {
    css: [],
    content: [],
    defaultExtractor: e => e.match(/[A-Za-z0-9_-]+/g) || [],
    extractors: [],
    fontFace: !1,
    keyframes: !1,
    rejected: !1,
    stdin: !1,
    stdout: !1,
    variables: !1,
    whitelist: [],
    whitelistPatterns: [],
    whitelistPatternsChildren: []
  },
  a = "purgecss ignore current",
  u = "purgecss ignore",
  c = "purgecss start ignore",
  l = "purgecss end ignore",
  d = "purgecss.config.js",
  f = "Error loading the config file",
  m = [
    "*",
    "::-webkit-scrollbar",
    "::selection",
    ":root",
    "::before",
    "::after"
  ];
async function h(e = d) {
  let t;
  try {
    const s = i.join(process.cwd(), e);
    t = await import(s);
  } catch (e) {
    throw new Error(`${f} ${e.message}`);
  }
  return { ...o, ...t };
}
function p(e, t) {
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
function v(e, t) {
  switch (t) {
    case "next":
      return e.text.includes(u);
    case "start":
      return e.text.includes(c);
    case "end":
      return e.text.includes(l);
  }
}
function g(e, t) {
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
function y(e) {
  return e.replace(/(^["'])|(["']$)/g, "");
}
function w(e, t) {
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
function F(e, t) {
  return t.ids.includes(e.value) || t.undetermined.includes(e.value);
}
function b(e, t) {
  return t.tags.includes(e.value) || t.undetermined.includes(e.value);
}
export default class {
  constructor() {
    (this.ignore = !1),
      (this.atRules = { fontFace: [], keyframes: [] }),
      (this.usedAnimations = new Set()),
      (this.usedFontFaces = new Set()),
      (this.selectorsRemoved = new Set());
  }
  getFileExtractor(e, t) {
    const s = t.find(t => t.extensions.find(t => e.endsWith(t)));
    return void 0 === s ? this.options.defaultExtractor : s.extractor;
  }
  async extractSelectorsFromFiles(e, t) {
    let i = {
      attributes: { names: [], values: [] },
      classes: [],
      ids: [],
      tags: [],
      undetermined: []
    };
    for (const o of e) {
      let e = [];
      try {
        await s.access(o, r.F_OK), e.push(o);
      } catch (t) {
        e = n.sync(o);
      }
      for (const r of e) {
        i = g(i, p(await s.readFile(r, "utf-8"), this.getFileExtractor(r, t)));
      }
    }
    return i;
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
      s = g(s, p(r, this.getFileExtractor(`.${n}`, t)));
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
          this.atRules.fontFace.push({ name: y(t.value), node: e });
  }
  async evaluateRule(e, s) {
    if (this.ignore) return;
    const r = e.prev();
    if (r && "comment" === r.type && v(r, "next")) return void r.remove();
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
              e.text.includes(a) &&
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
      for (const t of e.nodes) {
        if ("decl" !== t.type) continue;
        const { prop: e, value: s } = t;
        if (
          this.options.keyframes &&
          ("animation" === e || "animation-name" === e)
        )
          for (const e of s.split(/[\s,]+/)) this.usedAnimations.add(e);
        if (this.options.fontFace && "font-family" === e)
          for (const e of s.split(",")) {
            const t = y(e.trim());
            this.usedFontFaces.add(t);
          }
      }
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
  async getPurgedCSS(t, r) {
    const i = [],
      o = [];
    for (const e of t) "string" == typeof e ? o.push(...n.sync(e)) : o.push(e);
    for (const t of o) {
      const n =
          "string" == typeof t
            ? this.options.stdin
              ? t
              : await s.readFile(t, "utf-8")
            : t.raw,
        o = e(n);
      this.walkThroughCSS(o, r),
        this.options.fontFace && this.removeUnusedFontFaces(),
        this.options.keyframes && this.removeUnusedKeyframes();
      const a = { css: o.toString(), file: "string" == typeof t ? t : void 0 };
      "string" == typeof t && (a.file = t),
        this.options.rejected &&
          ((a.rejected = Array.from(this.selectorsRemoved)),
          this.selectorsRemoved.clear()),
        i.push(a);
    }
    return i;
  }
  isSelectorWhitelisted(e) {
    return (
      m.includes(e) ||
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
    this.options = "object" != typeof e ? await h(e) : { ...o, ...e };
    const { content: t, css: s, extractors: r } = this.options,
      n = t.filter(e => "string" == typeof e),
      i = t.filter(e => "object" == typeof e),
      a = await this.extractSelectorsFromFiles(n, r),
      u = this.extractSelectorsFromString(i, r);
    return this.getPurgedCSS(s, g(a, u));
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
        (m.includes(i.value) || this.isSelectorWhitelisted(i.value))
      )
        s = !0;
      else {
        switch (i.type) {
          case "attribute":
            s = "value" === i.attribute || w(i, t);
            break;
          case "class":
            (r = i),
              (s =
                (n = t).classes.includes(r.value) ||
                n.undetermined.includes(r.value));
            break;
          case "id":
            s = F(i, t);
            break;
          case "tag":
            s = b(i, t);
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
            (v(e, "start")
              ? ((this.ignore = !0), e.remove())
              : v(e, "end") && ((this.ignore = !1), e.remove()))
          )
    );
  }
}
export { o as defaultOptions, g as mergeExtractorSelectors, h as setOptions };
