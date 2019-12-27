"use strict";
function _interopDefault(e) {
  return e && "object" == typeof e && "default" in e ? e.default : e;
}
function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var t = {};
  return (
    e &&
      Object.keys(e).forEach(function(s) {
        var r = Object.getOwnPropertyDescriptor(e, s);
        Object.defineProperty(
          t,
          s,
          r.get
            ? r
            : {
                enumerable: !0,
                get: function() {
                  return e[s];
                }
              }
        );
      }),
    (t.default = e),
    t
  );
}
Object.defineProperty(exports, "__esModule", { value: !0 });
var postcss = require("postcss"),
  selectorParser = _interopDefault(require("postcss-selector-parser")),
  fs = require("fs"),
  util = require("util"),
  glob = _interopDefault(require("glob")),
  path = _interopDefault(require("path"));
const defaultOptions = {
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
  IGNORE_ANNOTATION_CURRENT = "purgecss ignore current",
  IGNORE_ANNOTATION_NEXT = "purgecss ignore",
  IGNORE_ANNOTATION_START = "purgecss start ignore",
  IGNORE_ANNOTATION_END = "purgecss end ignore",
  CONFIG_FILENAME = "purgecss.config.js",
  ERROR_CONFIG_FILE_LOADING = "Error loading the config file",
  CSS_WHITELIST = [
    "*",
    "::-webkit-scrollbar",
    "::selection",
    ":root",
    "::before",
    "::after"
  ];
class VariableNode {
  constructor(e) {
    (this.nodes = []), (this.isUsed = !1), (this.value = e);
  }
}
class VariablesStructure {
  constructor() {
    (this.nodes = new Map()), (this.usedVariables = new Set());
  }
  getVariableNode(e) {
    return this.nodes.get(e);
  }
  addVariable(e) {
    const { prop: t } = e;
    if (!this.nodes.has(t)) {
      const s = new VariableNode(e);
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
const asyncFs = {
  access: util.promisify(fs.access),
  readFile: util.promisify(fs.readFile)
};
async function setOptions(e = CONFIG_FILENAME) {
  let t;
  try {
    const s = path.join(process.cwd(), e);
    t = await new Promise(function(e) {
      e(_interopNamespace(require(s)));
    });
  } catch (e) {
    throw new Error(`${ERROR_CONFIG_FILE_LOADING} ${e.message}`);
  }
  return { ...defaultOptions, ...t };
}
function extractSelectors(e, t) {
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
function isIgnoreAnnotation(e, t) {
  switch (t) {
    case "next":
      return e.text.includes(IGNORE_ANNOTATION_NEXT);
    case "start":
      return e.text.includes(IGNORE_ANNOTATION_START);
    case "end":
      return e.text.includes(IGNORE_ANNOTATION_END);
  }
}
function isRuleEmpty(e) {
  return !!(
    ("rule" === e.type && !e.selector) ||
    (e.nodes && !e.nodes.length) ||
    ("atrule" === e.type &&
      ((!e.nodes && !e.params) || (!e.params && e.nodes && !e.nodes.length)))
  );
}
function hasIgnoreAnnotation(e) {
  let t = !1;
  return (
    e.walkComments(e => {
      e &&
        "comment" === e.type &&
        e.text.includes(IGNORE_ANNOTATION_CURRENT) &&
        ((t = !0), e.remove());
    }),
    t
  );
}
function mergeExtractorSelectors(e, t) {
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
function stripQuotes(e) {
  return e.replace(/(^["'])|(["']$)/g, "");
}
function isAttributeFound(e, t) {
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
function isClassFound(e, t) {
  return t.classes.includes(e.value) || t.undetermined.includes(e.value);
}
function isIdentifierFound(e, t) {
  return t.ids.includes(e.value) || t.undetermined.includes(e.value);
}
function isTagFound(e, t) {
  return t.tags.includes(e.value) || t.undetermined.includes(e.value);
}
function isInPseudoClassNot(e) {
  return e.parent && "pseudo" === e.parent.type && ":not" === e.parent.value;
}
function matchAll(e, t) {
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
}
class PurgeCSS {
  constructor() {
    (this.ignore = !1),
      (this.atRules = { fontFace: [], keyframes: [] }),
      (this.usedAnimations = new Set()),
      (this.usedFontFaces = new Set()),
      (this.selectorsRemoved = new Set()),
      (this.variablesStructure = new VariablesStructure()),
      (this.options = defaultOptions);
  }
  collectDeclarationsData(e) {
    const { prop: t, value: s } = e;
    this.options.variables;
    {
      const r = matchAll(s, /var\((.+?)[\,)]/g);
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
            const t = stripQuotes(e.trim());
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
        await asyncFs.access(r, fs.constants.F_OK), e.push(r);
      } catch (t) {
        e = glob.sync(r);
      }
      for (const r of e) {
        s = mergeExtractorSelectors(
          s,
          extractSelectors(
            await asyncFs.readFile(r, "utf-8"),
            this.getFileExtractor(r, t)
          )
        );
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
      s = mergeExtractorSelectors(
        s,
        extractSelectors(r, this.getFileExtractor(`.${n}`, t))
      );
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
          this.atRules.fontFace.push({ name: stripQuotes(t.value), node: e });
  }
  async evaluateRule(e, t) {
    if (this.ignore) return;
    const s = e.prev();
    if (s && "comment" === s.type && isIgnoreAnnotation(s, "next"))
      return void s.remove();
    if (e.parent && "atrule" === e.parent.type && "keyframes" === e.parent.name)
      return;
    if ("rule" !== e.type) return;
    if (hasIgnoreAnnotation(e)) return;
    let r = !0;
    if (
      ((e.selector = selectorParser(e => {
        e.walk(e => {
          "selector" === e.type &&
            ((r = this.shouldKeepSelector(e, t)) ||
              (this.options.rejected && this.selectorsRemoved.add(e.toString()),
              e.remove()));
        });
      }).processSync(e.selector)),
      r && void 0 !== e.nodes)
    )
      for (const t of e.nodes)
        "decl" === t.type && this.collectDeclarationsData(t);
    const n = e.parent;
    e.selector || e.remove(), isRuleEmpty(n) && n.remove();
  }
  async getPurgedCSS(e, t) {
    const s = [],
      r = [];
    for (const t of e)
      "string" == typeof t ? r.push(...glob.sync(t)) : r.push(t);
    for (const e of r) {
      const r =
          "string" == typeof e
            ? this.options.stdin
              ? e
              : await asyncFs.readFile(e, "utf-8")
            : e.raw,
        n = postcss.parse(r);
      this.walkThroughCSS(n, t),
        this.options.fontFace && this.removeUnusedFontFaces(),
        this.options.keyframes && this.removeUnusedKeyframes(),
        this.options.variables && this.removeUnusedCSSVariables();
      const o = { css: n.toString(), file: "string" == typeof e ? e : void 0 };
      "string" == typeof e && (o.file = e),
        this.options.rejected &&
          ((o.rejected = Array.from(this.selectorsRemoved)),
          this.selectorsRemoved.clear()),
        s.push(o);
    }
    return s;
  }
  isSelectorWhitelisted(e) {
    return (
      CSS_WHITELIST.includes(e) ||
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
    this.options =
      "object" != typeof e ? await setOptions(e) : { ...defaultOptions, ...e };
    const { content: t, css: s, extractors: r } = this.options,
      n = t.filter(e => "string" == typeof e),
      o = t.filter(e => "object" == typeof e),
      i = await this.extractSelectorsFromFiles(n, r),
      a = this.extractSelectorsFromString(o, r);
    return this.getPurgedCSS(s, mergeExtractorSelectors(i, a));
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
    if (isInPseudoClassNot(e)) return !0;
    let s = !1;
    for (const r of e.nodes) {
      if (r.value && this.isSelectorWhitelistedChildren(r.value)) return !0;
      if (
        r.value &&
        (CSS_WHITELIST.includes(r.value) || this.isSelectorWhitelisted(r.value))
      )
        s = !0;
      else {
        switch (r.type) {
          case "attribute":
            s = "value" === r.attribute || isAttributeFound(r, t);
            break;
          case "class":
            s = isClassFound(r, t);
            break;
          case "id":
            s = isIdentifierFound(r, t);
            break;
          case "tag":
            s = isTagFound(r, t);
        }
        if (!s) return !1;
      }
    }
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
            (isIgnoreAnnotation(e, "start")
              ? ((this.ignore = !0), e.remove())
              : isIgnoreAnnotation(e, "end") &&
                ((this.ignore = !1), e.remove()))
          )
    );
  }
}
(exports.PurgeCSS = PurgeCSS),
  (exports.default = PurgeCSS),
  (exports.defaultOptions = defaultOptions),
  (exports.mergeExtractorSelectors = mergeExtractorSelectors),
  (exports.setOptions = setOptions);
