/**
 * Core package of PurgeCSS
 *
 * Contains the core methods to analyze the files, remove unused CSS.
 *
 * @packageDocumentation
 */

import * as fs from "fs";
import * as glob from "fast-glob";
import * as path from "path";
import * as postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { pathToFileURL } from "url";
import { promisify } from "util";
import {
  CONFIG_FILENAME,
  ERROR_CONFIG_FILE_LOADING,
  IGNORE_ANNOTATION_CURRENT,
  IGNORE_ANNOTATION_END,
  IGNORE_ANNOTATION_NEXT,
  IGNORE_ANNOTATION_START,
} from "./constants";
import { ContentCache } from "./ContentCache";
import ExtractorResultSets from "./ExtractorResultSets";
import { CSS_SAFELIST, DYNAMIC_ATTRIBUTES } from "./internal-safelist";
import { defaultOptions } from "./options";
import {
  AtRules,
  ComplexSafelist,
  ExtractorFunction,
  ExtractorResultDetailed,
  Extractors,
  IgnoreType,
  Options,
  PostCSSRoot,
  RawContent,
  RawCSS,
  ResultPurge,
  UserDefinedOptions,
  UserDefinedSafelist,
} from "./types";
import { matchesPattern } from "./utils";

import { VariablesStructure } from "./VariablesStructure";

export * from "./ContentCache";
export * from "./types";
export { defaultOptions, ExtractorResultSets, PurgeCSS, VariablesStructure };
export * from "./VariablesStructure";

const asyncFs = {
  access: promisify(fs.access),
  readFile: promisify(fs.readFile),
  stat: promisify(fs.stat),
};

/**
 * Maximum number of content files read at the same time, by all the PurgeCSS
 * runs of the process together
 */
const CONTENT_FILES_CONCURRENCY = 32;

/**
 * Create a limiter that runs at most `concurrency` tasks at the same time.
 * The tasks start in the order they were given to the limiter.
 *
 * @param concurrency - maximum number of pending tasks
 */
function createLimiter(
  concurrency: number,
): <R>(task: () => Promise<R>) => Promise<R> {
  let pending = 0;
  const queue: (() => void)[] = [];
  return async <R>(task: () => Promise<R>): Promise<R> => {
    if (pending < concurrency) {
      pending++;
    } else {
      // the slot is handed over by the task that ends
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    try {
      return await task();
    } finally {
      const next = queue.shift();
      if (next) next();
      else pending--;
    }
  };
}

/**
 * Limiter shared by all the PurgeCSS instances, so that concurrent runs do
 * not open more files at the same time than a single run
 */
const limitContentFile = createLimiter(CONTENT_FILES_CONCURRENCY);

/**
 * Call an async function for each item, through the content files limiter.
 * The calls start in the order of the items but can end in any order.
 *
 * Once a call fails, no other call starts. The returned promise rejects, once
 * the pending calls are over, with the error of the first item that failed in
 * the order of the items: as the calls start in order, it is the error that
 * calling the function on the items one after the other would give.
 *
 * @param items - items to call the function on
 * @param callback - async function called for each item
 */
async function forEachContentFile<T>(
  items: T[],
  callback: (item: T) => Promise<void>,
): Promise<void> {
  // index and error of the first item that failed, in the order of the items
  let failedIndex = items.length;
  let failedError: unknown;
  await Promise.all(
    items.map((item, index) =>
      limitContentFile(async () => {
        // do not start once an item failed
        if (failedIndex < items.length) return;
        try {
          await callback(item);
        } catch (error) {
          if (index < failedIndex) {
            failedIndex = index;
            failedError = error;
          }
        }
      }),
    ),
  );
  if (failedIndex < items.length) throw failedError;
}

/**
 * Format the user defined safelist into a standardized safelist object
 *
 * @param userDefinedSafelist - the user defined safelist
 * @returns the formatted safelist object that can be used in the PurgeCSS options
 *
 * @public
 */
export function standardizeSafelist(
  userDefinedSafelist: UserDefinedSafelist = [],
): Required<ComplexSafelist> {
  if (Array.isArray(userDefinedSafelist)) {
    return {
      ...defaultOptions.safelist,
      standard: userDefinedSafelist,
    };
  }
  return {
    ...defaultOptions.safelist,
    ...userDefinedSafelist,
  };
}

/**
 * Load the configuration file from the path
 *
 * @param configFile - Path of the config file
 * @returns The options from the configuration file
 *
 * @throws Error
 * This exception is thrown if the configuration file was not imported
 *
 * @public
 */
export async function setOptions(
  configFile: string = CONFIG_FILENAME,
): Promise<Options> {
  let options: Options;
  try {
    const t = path.resolve(process.cwd(), configFile);
    const importedConfig = await import(pathToFileURL(t).href);
    // Handle both ES modules (direct export) and CommonJS (default export)
    options =
      importedConfig.default && typeof importedConfig.default === "object"
        ? importedConfig.default
        : importedConfig;
  } catch (err: unknown) {
    // a config file can throw any value, e.g. `throw "error"`
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`${ERROR_CONFIG_FILE_LOADING} ${message}`, {
      cause: err,
    });
  }
  return {
    ...defaultOptions,
    ...options,
    safelist: standardizeSafelist(options.safelist),
  };
}

/**
 * Use the extract function to get the list of selectors
 *
 * @param content - content (e.g. html file)
 * @param extractor - PurgeCSS extractor used to extract the selectors
 * @returns the sets containing the result of the extractor function
 */
async function extractSelectors(
  content: string,
  extractor: ExtractorFunction,
): Promise<ExtractorResultSets> {
  return new ExtractorResultSets(await extractor(content));
}

/**
 * Check if the node is a css comment indication to ignore the selector rule
 *
 * @param node - node of postcss AST
 * @param type - type of css comment
 * @returns true if the node is a PurgeCSS ignore comment
 */
function isIgnoreAnnotation(node: postcss.Comment, type: IgnoreType): boolean {
  switch (type) {
    case "next":
      return node.text.includes(IGNORE_ANNOTATION_NEXT);
    case "start":
      return node.text.includes(IGNORE_ANNOTATION_START);
    case "end":
      return node.text.includes(IGNORE_ANNOTATION_END);
  }
}

/**
 * Check if the node is a comment that can be removed along with its parent
 * when the parent has nothing else left. PurgeCSS ignore annotations are
 * kept since they still need to be processed.
 *
 * @param node - node of postcss AST
 * @returns true if the node is a removable comment
 */
function isRemovableComment(node: postcss.ChildNode): boolean {
  return (
    isPostCSSComment(node) &&
    !isIgnoreAnnotation(node, "next") &&
    !isIgnoreAnnotation(node, "start") &&
    !isIgnoreAnnotation(node, "end")
  );
}

/**
 * Internal state of a postcss container, missing from the type definitions
 */
interface PostCSSContainerInternals {
  nodes: postcss.ChildNode[] | undefined;
  /** index of the current child of each running `each` or `walk` */
  indexes?: Record<string, number>;
  markDirty(): void;
}

/**
 * The node itself when it is a proxy, as the nodes passed to postcss plugin
 * visitors are
 *
 * @param node - node of postcss AST
 */
function getRawNode<T extends postcss.Node>(node: T): T {
  return (node as T & { proxyOf?: T }).proxyOf ?? node;
}

/**
 * Children of a node, from the node itself when it is a proxy
 *
 * @param node - node of postcss AST
 */
function getRawChildren(node: postcss.Node): postcss.ChildNode[] | undefined {
  return (getRawNode(node) as unknown as PostCSSContainerInternals).nodes;
}

/**
 * Removals of nodes made while walking through the css, applied all at once
 * once the walk is over.
 *
 * Removing a node from a postcss container is a splice of its children
 * array, which is linear in the number of children: removing the unused
 * rules one by one from a big stylesheet is quadratic. The removals are
 * recorded instead, and this class answers the questions the walk asks about
 * the tree (parent, previous sibling, empty container) as if the recorded
 * nodes were already removed. `apply` then removes them in one pass per
 * container, which gives the same tree as removing them one by one.
 */
class DeferredRemovals {
  private removed = new Set<postcss.Node>();
  /**
   * For each container that was checked for emptiness, the number of its
   * children not removed, and the number of those that are not removable
   * comments. Computed on the first check, then kept up to date.
   */
  private counts = new Map<postcss.Node, { live: number; kept: number }>();
  /**
   * For a removed node, the index of a sibling before it from which to
   * continue looking for the previous sibling not removed. All the siblings
   * in between are removed.
   */
  private skips = new Map<postcss.Node, number>();
  /**
   * For each root that had children removed, the index of its first child
   * that may not be removed. All the children before it are removed.
   */
  private firstChildren = new Map<postcss.Node, number>();

  /**
   * Record the removal of a node. Like `node.remove()`, it does nothing if the
   * node has no parent or is already removed.
   *
   * @param node - node to remove
   */
  remove(node: postcss.Node): void {
    const raw = getRawNode(node);
    const parent = raw.parent;
    if (!parent || this.removed.has(raw)) return;
    if (parent.type === "root") this.moveRootSpacing(parent, raw);
    this.removed.add(raw);
    const counts = this.counts.get(getRawNode(parent));
    if (counts) {
      counts.live--;
      if (!isRemovableComment(raw as postcss.ChildNode)) counts.kept--;
    }
  }

  /**
   * When the first child of a root is removed, `Root.removeChild` gives the
   * spacing before it to the next child: do the same at the time of the
   * removal, as the next child can be copied as is in the rejected css
   *
   * @param root - parent of the node
   * @param node - node about to be removed
   */
  private moveRootSpacing(root: postcss.Node, node: postcss.Node): void {
    const children = getRawChildren(root);
    if (!children) return;
    const rawRoot = getRawNode(root);
    let first = this.firstChildren.get(rawRoot) ?? 0;
    while (first < children.length && this.removed.has(children[first])) {
      first++;
    }
    this.firstChildren.set(rawRoot, first);
    if (children[first] !== node) return;

    let next = first + 1;
    while (next < children.length && this.removed.has(children[next])) {
      next++;
    }
    if (next < children.length) {
      children[next].raws.before = node.raws.before;
    }
  }

  /**
   * Remove a node from the tree right away. Only used for nodes in containers
   * that have not been walked through yet, as it shifts the children indexes.
   *
   * @param node - node to remove
   */
  removeNow(node: postcss.Node): void {
    const parent = node.parent;
    if (parent) this.counts.delete(getRawNode(parent));
    node.remove();
  }

  /**
   * Parent of the node, `undefined` if the node is removed
   *
   * @param node - node of postcss AST
   */
  parentOf(
    node: postcss.Node,
  ): postcss.Container | postcss.Document | undefined {
    const raw = getRawNode(node);
    return this.removed.has(raw) ? undefined : raw.parent;
  }

  /**
   * Previous sibling of the node not removed, like `node.prev()`
   *
   * @param node - node of postcss AST, not removed
   * @param index - index of the node in the children of its parent
   */
  previousSibling(
    node: postcss.ChildNode,
    index: number,
  ): postcss.ChildNode | undefined {
    const raw = getRawNode(node);
    const parent = raw.parent;
    if (!parent) return undefined;
    const nodes = getRawChildren(parent);
    if (!nodes) return undefined;
    if (nodes[index] !== raw) index = nodes.indexOf(raw);

    let i = index - 1;
    const skipped: postcss.Node[] = [];
    while (i >= 0 && this.removed.has(nodes[i])) {
      skipped.push(nodes[i]);
      i = this.skips.get(nodes[i]) ?? i - 1;
    }
    // nodes are never added back: jump straight there next time
    for (const skippedNode of skipped) this.skips.set(skippedNode, i);
    return i >= 0 ? nodes[i] : undefined;
  }

  private countsOf(
    container: postcss.Container | postcss.Document,
    children: postcss.ChildNode[],
  ): {
    live: number;
    kept: number;
  } {
    const raw = getRawNode(container);
    let counts = this.counts.get(raw);
    if (!counts) {
      counts = { live: 0, kept: 0 };
      for (const child of children) {
        if (this.removed.has(child)) continue;
        counts.live++;
        if (!isRemovableComment(child)) counts.kept++;
      }
      this.counts.set(raw, counts);
    }
    return counts;
  }

  /**
   * Check if the container corresponds to an empty css rule, once the
   * recorded nodes are removed
   *
   * @param node - container of postcss AST
   * @returns true if the rule is empty
   */
  isEmpty(node: postcss.Container | postcss.Document): boolean {
    if (isPostCSSRule(node) && !node.selector) return true;
    const children = getRawChildren(node);
    if (!children) {
      return isPostCSSAtRule(node) && !node.params;
    }
    const { live, kept } = this.countsOf(node, children);
    if (live === 0) return true;
    // only comments that can be removed along with it are left
    return (isPostCSSRule(node) || isPostCSSAtRule(node)) && kept === 0;
  }

  /**
   * Remove the recorded nodes from the tree, in one pass per container
   */
  apply(): void {
    const parents = new Set<postcss.Node>();
    for (const node of this.removed) {
      if (node.parent) parents.add(getRawNode(node.parent));
    }
    for (const parent of parents) {
      const container = parent as unknown as PostCSSContainerInternals;
      const nodes = container.nodes ?? [];
      const kept: postcss.ChildNode[] = [];
      // positions of the removed children, to update the running iterators
      // like `removeChild` does
      const removedPositions: number[] = [];
      for (let i = 0; i < nodes.length; i++) {
        if (this.removed.has(nodes[i])) {
          removedPositions.push(i);
        } else {
          kept.push(nodes[i]);
        }
      }
      container.nodes = kept;
      if (container.indexes) {
        for (const id in container.indexes) {
          const index = container.indexes[id];
          let shift = 0;
          while (
            shift < removedPositions.length &&
            removedPositions[shift] <= index
          ) {
            shift++;
          }
          container.indexes[id] = index - shift;
        }
      }
    }
    for (const node of this.removed) {
      node.parent = undefined;
    }
    for (const parent of parents) {
      (parent as unknown as PostCSSContainerInternals).markDirty();
    }
    this.removed.clear();
    this.counts.clear();
    this.skips.clear();
    this.firstChildren.clear();
  }
}

/**
 * Copy of a container without its children
 *
 * @param container - rule or at-rule of postcss AST
 */
function cloneWithoutChildren<T extends postcss.Rule | postcss.AtRule>(
  container: T,
): T {
  const raw = getRawNode(container) as T;
  const nodes = raw.nodes;
  // the children are not cloned only to be thrown away
  raw.nodes = [];
  try {
    return raw.clone() as T;
  } finally {
    raw.nodes = nodes;
  }
}

/**
 * Build the rejected css of a rule: a copy of the rule with only its rejected
 * selectors, wrapped in empty copies of all its ancestors (at-rules and nested
 * rules) so that it keeps the context it applies in, e.g.
 * `@supports (display: grid) { @media print { .rejected {} } }`.
 *
 * Returns `undefined` when an ancestor was already removed from the tree: the
 * ancestor was rejected with all its content, which already contains the rule.
 *
 * @param rule - rule with rejected selectors
 * @param rejectedSelectors - selectors removed from the rule
 * @param removals - removals recorded during the walk
 */
function getRejectedNode(
  rule: postcss.Rule,
  rejectedSelectors: string[],
  removals: DeferredRemovals,
): postcss.Node | undefined {
  const rejectedRule = rule.clone();
  rejectedRule.selectors = rejectedSelectors;

  let rejectedNode: postcss.Node = rejectedRule;
  let ancestor = removals.parentOf(rule);
  while (isPostCSSRule(ancestor) || isPostCSSAtRule(ancestor)) {
    rejectedNode = cloneWithoutChildren(ancestor).append(rejectedNode);
    ancestor = removals.parentOf(ancestor);
  }

  // the chain of ancestors stops at the root unless one of them was removed
  return ancestor ? rejectedNode : undefined;
}

/**
 * Check if the node has a css comment indicating to ignore the current selector rule
 *
 * @param rule - rule of postcss AST
 * @param removals - removals recorded during the walk
 */
function hasIgnoreAnnotation(
  rule: postcss.Rule,
  removals: DeferredRemovals,
): boolean {
  let found = false;
  rule.walkComments((node) => {
    if (
      node &&
      node.type === "comment" &&
      node.text.includes(IGNORE_ANNOTATION_CURRENT)
    ) {
      found = true;
      // the content of the rule is not walked through yet
      removals.removeNow(node);
    }
  });
  return found;
}

/**
 * Merge two extractor selectors
 *
 * @param extractorSelectorsA - extractor selectors A
 * @param extractorSelectorsB - extractor selectors B
 * @returns  the merged extractor result sets
 *
 * @public
 */
export function mergeExtractorSelectors(
  ...extractors: (ExtractorResultDetailed | ExtractorResultSets)[]
): ExtractorResultSets {
  const result = new ExtractorResultSets([]);
  extractors.forEach(result.merge, result);
  return result;
}

/**
 * Strips quotes of a string
 *
 * @param str - string to be stripped
 */
function stripQuotes(str: string): string {
  return str.replace(/(^["'])|(["']$)/g, "");
}

/**
 * Returns true if the attribute is found in the extractor selectors
 *
 * @param attributeNode - node of type `attribute`
 * @param selectors - extractor selectors
 */
function isAttributeFound(
  attributeNode: selectorParser.Attribute,
  selectors: ExtractorResultSets,
): boolean {
  if (!selectors.hasAttrName(attributeNode.attribute)) {
    return false;
  }

  if (typeof attributeNode.value === "undefined") {
    return true;
  }

  switch (attributeNode.operator) {
    case "$=":
      return selectors.hasAttrSuffix(attributeNode.value);
    case "~=":
    case "*=":
      return selectors.hasAttrSubstr(attributeNode.value);
    case "=":
      return selectors.hasAttrValue(attributeNode.value);
    case "|=":
    case "^=":
      return selectors.hasAttrPrefix(attributeNode.value);
    default:
      return true;
  }
}

/**
 * Returns true if the class is found in the extractor selectors
 *
 * @param classNode - node of type `class`
 * @param selectors - extractor selectors
 */
function isClassFound(
  classNode: selectorParser.ClassName,
  selectors: ExtractorResultSets,
): boolean {
  return selectors.hasClass(classNode.value);
}

/**
 * Returns true if the identifier is found in the extractor selectors
 *
 * @param identifierNode - node of type `identifier`
 * @param selectors - extractor selectors
 */
function isIdentifierFound(
  identifierNode: selectorParser.Identifier,
  selectors: ExtractorResultSets,
): boolean {
  return selectors.hasId(identifierNode.value);
}

/**
 * Returns true if the tag is found in the extractor selectors
 *
 * @param tagNode - node of type `tag`
 * @param selectors - extractor selectors
 */
function isTagFound(
  tagNode: selectorParser.Tag,
  selectors: ExtractorResultSets,
): boolean {
  return selectors.hasTag(tagNode.value);
}

/**
 * Returns true if the selector is inside a pseudo class
 * (e.g. :nth-child, :nth-of-type, :only-child, :not)
 *
 * @param selector - selector
 */
function isInPseudoClass(selector: selectorParser.Node): boolean {
  return (
    (selector.parent &&
      selector.parent.type === "pseudo" &&
      selector.parent.value.startsWith(":")) ||
    false
  );
}

/**
 * Returns true if the selector is inside the pseudo classes :where() or :is()
 * @param selector - selector
 */
function isInPseudoClassWhereOrIs(selector: selectorParser.Node): boolean {
  return (
    (selector.parent &&
      selector.parent.type === "pseudo" &&
      (selector.parent.value === ":where" ||
        selector.parent.value === ":is")) ||
    false
  );
}

/**
 * Returns true if the selector is nested anywhere inside a :not() pseudo class.
 * Removing a selector there changes the meaning of the negation, so it is kept.
 *
 * @param selector - selector
 */
function isInsideNotPseudoClass(selector: selectorParser.Node): boolean {
  let node = selector.parent;
  while (node) {
    if (node.type === "pseudo" && node.value === ":not") {
      return true;
    }
    node = node.parent;
  }
  return false;
}

/**
 * Returns true if the selector is a pseudo class at the root level
 * Pseudo classes checked: :where, :is, :has, :not
 * @param selector - selector
 */
function isPseudoClassAtRootLevel(selector: selectorParser.Node): boolean {
  let result = false;
  if (
    selector.type === "selector" &&
    selector.parent?.type === "root" &&
    selector.nodes.length === 1
  ) {
    selector.walk((node) => {
      if (
        node.type === "pseudo" &&
        (node.value === ":where" ||
          node.value === ":is" ||
          node.value === ":has" ||
          node.value === ":not")
      ) {
        result = true;
      }
    });
  }
  return result;
}

function isPostCSSAtRule(node?: postcss.Node): node is postcss.AtRule {
  return node?.type === "atrule";
}

function isPostCSSRule(node?: postcss.Node): node is postcss.Rule {
  return node?.type === "rule";
}

function isPostCSSComment(node?: postcss.Node): node is postcss.Comment {
  return node?.type === "comment";
}

/**
 * A css file walked through, before it is turned back into css
 */
interface PurgedRoot {
  root: PostCSSRoot;
  from: string | undefined;
  file: string | undefined;
  rejected?: string[];
  rejectedCss?: string;
}

/**
 * Class used to instantiate PurgeCSS and can then be used
 * to purge CSS files.
 *
 * @example
 * ```ts
 * await new PurgeCSS().purge({
 *    content: ['index.html'],
 *    css: ['css/app.css']
 * })
 * ```
 *
 * @public
 */
class PurgeCSS {
  private ignore = false;
  private atRules: AtRules = {
    fontFace: [],
    keyframes: [],
  };

  private usedAnimations: Set<string> = new Set();
  private usedFontFaces: Set<string> = new Set();
  public selectorsRemoved: Set<string> = new Set();
  public removedNodes: postcss.Node[] = [];
  public variablesStructure: VariablesStructure = new VariablesStructure();

  public options: Options = defaultOptions;

  /** removals of nodes made during the walk through the css */
  private removals = new DeferredRemovals();

  /**
   * Cache of the selectors extracted from the content files. When set, a
   * content file is only read and extracted again if it changed since the
   * cache got its selectors, see {@link ContentCache}. The same cache can be
   * set on several PurgeCSS instances, running one after the other or at the
   * same time.
   *
   * @defaultValue `undefined`, the content files are read on every run
   */
  public contentCache?: ContentCache;

  private collectDeclarationsData(
    declaration: postcss.Declaration,
    isIgnored: boolean,
  ): void {
    const { prop, value } = declaration;

    // collect css properties data
    if (this.options.variables) {
      // custom properties kept by an ignore annotation are not registered so
      // they are never removed, but the variables they use still count as used.
      // The variables used by a registered custom property are read from its
      // value when removing the unused variables, if it is used itself
      if (prop.startsWith("--") && !isIgnored) {
        this.variablesStructure.addVariable(declaration);
      } else {
        this.variablesStructure.addVariableUsageInProperties(
          value.matchAll(/\bvar\(\s*(.+?)\s*[,)]/g),
        );
      }
    }

    // collect keyframes data
    if (this.options.keyframes) {
      if (prop === "animation" || prop === "animation-name") {
        for (const word of value.split(/[\s,]+/)) {
          this.usedAnimations.add(word);
        }
        return;
      }
      // Also check CSS custom properties for animation names
      // e.g., --my-animation: fadeIn 0.4s;
      if (prop.startsWith("--")) {
        for (const word of value.split(/[\s,]+/)) {
          this.usedAnimations.add(word);
        }
      }
    }

    // collect font faces data
    if (this.options.fontFace) {
      if (prop === "font-family") {
        for (const fontName of value.split(",")) {
          const cleanedFontFace = stripQuotes(fontName.trim());
          this.usedFontFaces.add(cleanedFontFace);
        }
      }
      return;
    }
  }

  /**
   * Collect the data of the declarations directly inside a node
   *
   * @param node - rule or at-rule of postcss AST
   * @param isIgnored - whether the node is kept by an ignore annotation
   */
  private collectDeclarationsDataOfNode(
    node: postcss.Container,
    isIgnored = false,
  ): void {
    node.each((childNode) => {
      if (childNode.type !== "decl") return;
      this.collectDeclarationsData(childNode, isIgnored);
    });
  }

  /**
   * Check if a node is kept by an ignore annotation: inside an ignore range,
   * or right after an ignore next line comment, which is then removed
   *
   * @param node - node of postcss AST
   * @param index - index of the node in the children of its parent
   */
  private isIgnored(node: postcss.ChildNode, index: number): boolean {
    if (this.ignore) {
      return true;
    }

    const annotation = this.removals.previousSibling(node, index);
    if (
      isPostCSSComment(annotation) &&
      isIgnoreAnnotation(annotation, "next")
    ) {
      this.removals.remove(annotation);
      return true;
    }

    return false;
  }

  /**
   * Get the extractor corresponding to the extension file
   * @param filename - Name of the file
   * @param extractors - Array of extractors definition
   */
  private getFileExtractor(
    filename: string,
    extractors: Extractors[],
  ): ExtractorFunction {
    const extractorObj = extractors.find((extractor) =>
      extractor.extensions.find((ext) => filename.endsWith(ext)),
    );

    return typeof extractorObj === "undefined"
      ? this.options.defaultExtractor
      : extractorObj.extractor;
  }

  /**
   * Extract the selectors present in the files using a PurgeCSS extractor
   *
   * @param files - Array of files path or glob pattern
   * @param extractors - Array of extractors
   */
  public async extractSelectorsFromFiles(
    files: string[],
    extractors: Extractors[],
  ): Promise<ExtractorResultSets> {
    const selectors = new ExtractorResultSets([]);
    const filesNames: string[] = [];
    for (const globFile of files) {
      try {
        await asyncFs.access(globFile, fs.constants.F_OK);
        filesNames.push(globFile);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        filesNames.push(
          ...glob.sync(globFile, {
            onlyFiles: true,
            ignore: this.options.skippedContentGlobs.map((glob) =>
              glob.replace(/^\.\//, ""),
            ),
          }),
        );
      }
    }
    if (files.length > 0 && filesNames.length === 0) {
      console.warn("No files found from the passed PurgeCSS option 'content'.");
    }
    // files are read and extracted concurrently, and the selectors of each
    // file are merged as soon as they are extracted, so that they are not
    // kept in memory until every file is done. The merged sets are the same
    // whatever the order.
    await forEachContentFile(filesNames, async (file) => {
      selectors.merge(await this.extractSelectorsFromFile(file, extractors));
    });
    return selectors;
  }

  /**
   * Extract the selectors present in a file, reusing the selectors of the
   * content cache when the file did not change
   *
   * @param file - path of the file
   * @param extractors - Array of extractors
   */
  private async extractSelectorsFromFile(
    file: string,
    extractors: Extractors[],
  ): Promise<ExtractorResultSets> {
    const extractor = this.getFileExtractor(file, extractors);
    const contentCache = this.contentCache;
    if (!contentCache) {
      const content = await asyncFs.readFile(file, "utf-8");
      return extractSelectors(content, extractor);
    }

    const filePath = path.resolve(file);
    // the file is stat before being read: if it changes in between, the
    // stored stats are the old ones and it is read again next time
    const checkedAt = Date.now();
    const { mtimeMs, ctimeMs, size, ino } = await asyncFs.stat(filePath);
    const stats = { mtimeMs, ctimeMs, size, ino };
    const cachedSelectors = contentCache.get(filePath, stats, extractor);
    if (cachedSelectors) {
      return cachedSelectors;
    }
    // stored before being awaited, so that the runs at the same time wait
    // for this extraction instead of starting their own
    const selectors = asyncFs
      .readFile(filePath, "utf-8")
      .then((content) => extractSelectors(content, extractor));
    contentCache.set(filePath, { ...stats, extractor, selectors, checkedAt });
    return selectors;
  }

  /**
   * Extract the selectors present in the passed string using a PurgeCSS extractor
   *
   * @param content - Array of content
   * @param extractors - Array of extractors
   */
  public async extractSelectorsFromString(
    content: RawContent[],
    extractors: Extractors[],
  ): Promise<ExtractorResultSets> {
    const selectors = new ExtractorResultSets([]);
    for (const { raw, extension } of content) {
      const extractor = this.getFileExtractor(`.${extension}`, extractors);
      const extractedSelectors = await extractSelectors(raw, extractor);
      selectors.merge(extractedSelectors);
    }
    return selectors;
  }

  /**
   * Evaluate at-rule and register it for future reference
   * @param node - node of postcss AST
   * @param index - index of the node in the children of its parent
   */
  private evaluateAtRule(node: postcss.AtRule, index: number): void {
    const isIgnored = this.isIgnored(node, index);

    // when tracking variables, collect var() usages from declarations
    // nested inside at-rules (e.g. @media, @supports, ...)
    if (
      this.options.variables &&
      (node.name === "media" || node.name === "supports")
    ) {
      this.collectDeclarationsDataOfNode(node, isIgnored);
    }

    // exit if it is kept by an ignore annotation
    if (isIgnored) {
      return;
    }

    // @property rules of css variables
    if (
      this.options.variables &&
      node.name === "property" &&
      node.params.trim().startsWith("--")
    ) {
      this.variablesStructure.addProperty(node);
      return;
    }

    // keyframes
    if (this.options.keyframes && node.name.endsWith("keyframes")) {
      this.atRules.keyframes.push(node);
      return;
    }
    // font-face
    if (this.options.fontFace && node.name === "font-face" && node.nodes) {
      for (const childNode of node.nodes) {
        if (childNode.type === "decl" && childNode.prop === "font-family") {
          this.atRules.fontFace.push({
            name: stripQuotes(childNode.value),
            node,
          });
        }
      }
    }
  }

  /**
   * Evaluate css selector and decide if it should be removed or not
   *
   * @param node - node of postcss AST
   * @param index - index of the node in the children of its parent
   * @param selectors - selectors used in content files
   */
  private evaluateRule(
    node: postcss.Rule,
    index: number,
    selectors: ExtractorResultSets,
  ): void {
    // exit if it is kept by an ignore annotation (ignore range or ignore next
    // line comment), still collecting what its declarations use
    if (this.isIgnored(node, index)) {
      if (isPostCSSRule(node)) this.collectDeclarationsDataOfNode(node, true);
      return;
    }

    // collect variables and exit if it is inside a keyframes
    if (
      node.parent &&
      isPostCSSAtRule(node.parent) &&
      node.parent.name.endsWith("keyframes")
    ) {
      // declarations inside keyframes rules
      if (isPostCSSRule(node)) this.collectDeclarationsDataOfNode(node);
      return;
    }

    // exit if it is not a rule
    if (!isPostCSSRule(node)) {
      return;
    }

    // exit if it has an ignore rule comment inside, still collecting what its
    // declarations use
    if (hasIgnoreAnnotation(node, this.removals)) {
      this.collectDeclarationsDataOfNode(node, true);
      return;
    }

    const selectorsRemovedFromRule: string[] = [];
    // selector transformer, walk over the list of the parsed selectors twice.
    // First pass will remove the unused selectors. It goes through
    // pseudo-classes like :where() and :is() and remove the unused
    // selectors inside of them, but will not remove the pseudo-classes
    // themselves. Second pass will remove selectors containing empty
    // :where and :is.
    node.selector = selectorParser((selectorsParsed) => {
      selectorsParsed.walk((selector) => {
        if (selector.type !== "selector") {
          return;
        }
        const keepSelector = this.shouldKeepSelector(selector, selectors);

        if (!keepSelector) {
          // the whitespace after the previous comma belongs to the selector
          const removedSelector = selector.toString().trim();
          if (this.options.rejected) {
            this.selectorsRemoved.add(removedSelector);
          }
          if (this.options.rejectedCss) {
            selectorsRemovedFromRule.push(removedSelector);
          }
          selector.remove();
        }
      });

      // removes selectors containing empty :where and :is
      selectorsParsed.walk((selector) => {
        if (selector.type !== "selector") {
          return;
        }

        if (selector.toString() && /(:where)|(:is)/.test(selector.toString())) {
          selector.walk((node) => {
            if (node.type !== "pseudo") return;
            if (node.value !== ":where" && node.value !== ":is") return;
            if (node.nodes.length === 0) {
              selector.remove();
            }
          });
        }
      });
    }).processSync(node.selector);

    // declarations
    if (node.selector) this.collectDeclarationsDataOfNode(node);

    // rebuild the rule with the removed selectors, before the rule and its
    // emptied parents are detached from the tree
    if (this.options.rejectedCss && selectorsRemovedFromRule.length > 0) {
      const rejectedNode = getRejectedNode(
        node,
        selectorsRemovedFromRule,
        this.removals,
      );
      if (rejectedNode) this.removedNodes.push(rejectedNode);
    }

    // remove empty rules
    const parent = this.removals.parentOf(node);
    if (!node.selector) {
      this.removals.remove(node);
    }
    // remove the parents left empty, going up through nested rules and
    // at-rules (e.g. @supports inside @media) but not past the root
    let emptyCandidate = parent;
    while (emptyCandidate && this.removals.isEmpty(emptyCandidate)) {
      const grandParent = this.removals.parentOf(emptyCandidate);
      this.removals.remove(emptyCandidate);
      emptyCandidate =
        isPostCSSRule(grandParent) || isPostCSSAtRule(grandParent)
          ? grandParent
          : undefined;
    }
  }

  /**
   * Get the purged version of the css based on the files
   *
   * @param cssOptions - css options, files or raw strings
   * @param selectors - set of extracted css selectors
   */
  public async getPurgedCSS(
    cssOptions: Array<string | RawCSS>,
    selectors: ExtractorResultSets,
  ): Promise<ResultPurge[]> {
    const sources = [];

    // resolve any globs
    const processedOptions: Array<string | RawCSS> = [];
    for (const option of cssOptions) {
      if (typeof option === "string") {
        processedOptions.push(
          ...glob.sync(option, {
            onlyFiles: true,
            ignore: this.options.skippedContentGlobs,
          }),
        );
      } else {
        processedOptions.push(option);
      }
    }

    // unused font faces, keyframes and variables are removed once every css
    // file has been walked through, so that a font face, keyframes or variable
    // defined in one file and used in another one is kept. The files are kept
    // in memory until then, and only when one of these options is enabled
    const removesUnusedAcrossFiles =
      this.options.fontFace || this.options.keyframes || this.options.variables;
    const purgedRoots: PurgedRoot[] = [];
    for (const option of processedOptions) {
      const cssContent =
        typeof option === "string"
          ? this.options.stdin
            ? option
            : await asyncFs.readFile(option, "utf-8")
          : option.raw;
      // the name of raw css is used as its path in the source maps, like
      // the path of a css file: the map sources are relative to the
      // directory of `sourceMap.to`, which defaults to that path
      const from =
        typeof option === "string"
          ? this.options.stdin
            ? undefined
            : option
          : option.name || undefined;
      const root = postcss.parse(cssContent, { from });

      // the rejected css of a file only contains the rules removed from it
      this.removedNodes = [];

      // purge unused selectors
      this.walkThroughCSS(root, selectors);

      const purgedRoot: PurgedRoot = {
        root,
        from,
        file: typeof option === "string" ? option : option.name,
      };

      if (this.options.rejected) {
        purgedRoot.rejected = Array.from(this.selectorsRemoved);
        this.selectorsRemoved.clear();
      }

      if (this.options.rejectedCss) {
        purgedRoot.rejectedCss = postcss
          .root({ nodes: this.removedNodes })
          .toString();
      }

      if (removesUnusedAcrossFiles) {
        purgedRoots.push(purgedRoot);
      } else {
        sources.push(this.getResultPurge(purgedRoot));
      }
    }

    if (this.options.fontFace) this.removeUnusedFontFaces();
    if (this.options.keyframes) this.removeUnusedKeyframes();
    if (this.options.variables) this.removeUnusedCSSVariables();

    for (const purgedRoot of purgedRoots) {
      sources.push(this.getResultPurge(purgedRoot));
    }
    return sources;
  }

  /**
   * Build the result of a purged css file
   *
   * @param purgedRoot - purged css file
   */
  private getResultPurge({
    root,
    from,
    file,
    rejected,
    rejectedCss,
  }: PurgedRoot): ResultPurge {
    const postCSSResult = root.toResult({
      map: this.options.sourceMap,
      to:
        typeof this.options.sourceMap === "object" && this.options.sourceMap.to
          ? this.options.sourceMap.to
          : from,
    });
    const result: ResultPurge = {
      css: postCSSResult.toString(),
      file,
    };

    if (this.options.sourceMap) {
      result.sourceMap = postCSSResult.map?.toString();
    }

    if (this.options.rejected) {
      result.rejected = rejected;
    }

    if (this.options.rejectedCss) {
      result.rejectedCss = rejectedCss;
    }

    return result;
  }

  /**
   * Check if the keyframe is safelisted with the option safelist keyframes
   *
   * @param keyframesName - name of the keyframe animation
   */
  private isKeyframesSafelisted(keyframesName: string): boolean {
    return this.options.safelist.keyframes.some((safelistItem) =>
      matchesPattern(safelistItem, keyframesName),
    );
  }

  /**
   * Check if the selector is blocklisted with the option blocklist
   *
   * @param selector - css selector
   */
  private isSelectorBlocklisted(selector: string): boolean {
    return this.options.blocklist.some((blocklistItem) =>
      matchesPattern(blocklistItem, selector),
    );
  }

  /**
   * Check if the selector is safelisted with the option safelist standard
   *
   * @param selector - css selector
   */
  private isSelectorSafelisted(selector: string): boolean {
    const isSafelisted = this.options.safelist.standard.some((safelistItem) =>
      matchesPattern(safelistItem, selector),
    );
    const isPseudoElement = /^::.*/.test(selector);
    return CSS_SAFELIST.includes(selector) || isPseudoElement || isSafelisted;
  }

  /**
   * Check if the selector is safelisted with the option safelist deep
   *
   * @param selector - selector
   */
  private isSelectorSafelistedDeep(selector: string): boolean {
    return this.options.safelist.deep.some((safelistItem) =>
      matchesPattern(safelistItem, selector),
    );
  }

  /**
   * Check if the selector is safelisted with the option safelist greedy
   *
   * @param selector - selector
   */
  private isSelectorSafelistedGreedy(selector: string): boolean {
    return this.options.safelist.greedy.some((safelistItem) =>
      matchesPattern(safelistItem, selector),
    );
  }

  /**
   * Check if the attribute is dynamic, i.e. it can be set or changed at runtime.
   * Attribute selectors on dynamic attributes are always kept, whatever their
   * value, as the attribute may not appear in the content files.
   *
   * `value` is highly used in input elements and can change based on the user,
   * idem for `checked`, `selected` and `open`, so they are always dynamic.
   * Other attributes can be added with the option dynamicAttributes.
   *
   * @param attributeName - name of the attribute, e.g. `aria-selected`
   */
  private isAttributeDynamic(attributeName: string): boolean {
    return (
      DYNAMIC_ATTRIBUTES.includes(attributeName) ||
      this.options.dynamicAttributes.some((dynamicAttribute) =>
        matchesPattern(dynamicAttribute, attributeName),
      )
    );
  }

  /**
   * Remove unused CSS
   *
   * @param userOptions - PurgeCSS options or path to the configuration file
   * @returns an array of object containing the filename and the associated CSS
   *
   * @example Using a configuration file named purgecss.config.js
   * ```ts
   * const purgeCSSResults = await new PurgeCSS().purge()
   * ```
   *
   * @example Using a custom path to the configuration file
   * ```ts
   * const purgeCSSResults = await new PurgeCSS().purge('./purgecss.config.js')
   * ```
   *
   * @example Using the PurgeCSS options
   * ```ts
   * const purgeCSSResults = await new PurgeCSS().purge({
   *    content: ['index.html', '**\/*.js', '**\/*.html', '**\/*.vue'],
   *    css: ['css/app.css']
   * })
   * ```
   */
  public async purge(
    userOptions: UserDefinedOptions | string | undefined,
  ): Promise<ResultPurge[]> {
    this.options =
      typeof userOptions !== "object"
        ? await setOptions(userOptions)
        : {
            ...defaultOptions,
            ...userOptions,
            safelist: standardizeSafelist(userOptions.safelist),
          };
    const { content, css, extractors, safelist } = this.options;

    if (this.options.variables) {
      this.variablesStructure.safelist = safelist.variables || [];
    }

    const fileFormatContents = content.filter(
      (o) => typeof o === "string",
    ) as string[];
    const rawFormatContents = content.filter(
      (o) => typeof o === "object",
    ) as RawContent[];

    const cssFileSelectors = await this.extractSelectorsFromFiles(
      fileFormatContents,
      extractors,
    );
    const cssRawSelectors = await this.extractSelectorsFromString(
      rawFormatContents,
      extractors,
    );

    return this.getPurgedCSS(
      css,
      mergeExtractorSelectors(cssFileSelectors, cssRawSelectors),
    );
  }

  /**
   * Remove unused CSS variables
   */
  public removeUnusedCSSVariables(): void {
    this.variablesStructure.removeUnused();
  }

  /**
   * Remove unused font-faces
   */
  public removeUnusedFontFaces(): void {
    for (const { name, node } of this.atRules.fontFace) {
      if (!this.usedFontFaces.has(name)) {
        node.remove();
      }
    }
  }

  /**
   * Remove unused keyframes
   */
  public removeUnusedKeyframes(): void {
    for (const node of this.atRules.keyframes) {
      if (
        !this.usedAnimations.has(node.params) &&
        !this.isKeyframesSafelisted(node.params)
      ) {
        node.remove();
      }
    }
  }

  /**
   * Transform a selector node into a string
   */
  private getSelectorValue(selector: selectorParser.Node): string | undefined {
    return (
      (selector.type === "attribute" && selector.attribute) || selector.value
    );
  }

  /**
   * Determine if the selector should be kept, based on the selectors found in the files
   *
   * @param selector - set of css selectors found in the content files or string
   * @param selectorsFromExtractor - selectors in the css rule
   *
   * @returns true if the selector should be kept in the processed CSS
   */
  private shouldKeepSelector(
    selector: selectorParser.Selector,
    selectorsFromExtractor: ExtractorResultSets,
  ): boolean {
    // selectors in pseudo classes are ignored except :where() and :is(). For those pseudo-classes, we are treating the selectors inside the same way as they would be outside.
    if (isInPseudoClass(selector) && !isInPseudoClassWhereOrIs(selector)) {
      return true;
    }

    // keep the blocklist from matching the pseudo class name itself (":is", ":not", …)
    if (isPseudoClassAtRootLevel(selector)) {
      return true;
    }

    // :where() and :is() inside :not() are kept as a whole, otherwise the
    // emptied pseudo class would drop the negated rule
    if (
      isInPseudoClassWhereOrIs(selector) &&
      isInsideNotPseudoClass(selector)
    ) {
      return true;
    }

    // if there is any greedy safelist pattern, run all the selector parts through them
    // if there is any match, return true
    if (this.options.safelist.greedy.length > 0) {
      const selectorParts = selector.nodes.map(this.getSelectorValue);
      if (
        selectorParts.some(
          (selectorPart) =>
            selectorPart && this.isSelectorSafelistedGreedy(selectorPart),
        )
      ) {
        return true;
      }
    }

    for (const selectorNode of selector.nodes) {
      const selectorValue = this.getSelectorValue(selectorNode);

      // if the selector is safelisted with children
      // returns true to keep all children selectors
      if (selectorValue && this.isSelectorSafelistedDeep(selectorValue)) {
        return true;
      }

      // The selector is found in the internal and user-defined safelist
      if (
        selectorValue &&
        (CSS_SAFELIST.includes(selectorValue) ||
          this.isSelectorSafelisted(selectorValue))
      ) {
        continue;
      }

      // The selector is present in the blocklist
      if (selectorValue && this.isSelectorBlocklisted(selectorValue)) {
        return false;
      }

      let isPresent: boolean;
      switch (selectorNode.type) {
        case "attribute":
          isPresent = this.isAttributeDynamic(selectorNode.attribute)
            ? true
            : isAttributeFound(selectorNode, selectorsFromExtractor);
          break;
        case "class":
          isPresent = isClassFound(selectorNode, selectorsFromExtractor);
          break;
        case "id":
          isPresent = isIdentifierFound(selectorNode, selectorsFromExtractor);
          break;
        case "tag":
          isPresent = isTagFound(selectorNode, selectorsFromExtractor);
          break;
        default:
          // Pseudo-classes (:where, :is, :not, …) carry no matchable name at
          // this level; their inner selectors are evaluated separately. Skip
          // them without treating the compound as unused.
          continue;
      }

      // a matchable part (class/id/tag/attribute) was not found: drop it
      if (!isPresent) {
        return false;
      }
    }

    // nothing was found missing: keep the selector
    return true;
  }

  /**
   * Walk through the CSS AST and remove unused CSS
   *
   * @param root - root node of the postcss AST
   * @param selectors - selectors used in content files
   */
  public walkThroughCSS(
    root: PostCSSRoot,
    selectors: ExtractorResultSets,
  ): void {
    // the nodes are removed once the whole tree has been walked through
    try {
      root.walk((node, index) => {
        if (node.type === "rule") {
          return this.evaluateRule(node, index, selectors);
        }
        if (node.type === "atrule") {
          return this.evaluateAtRule(node, index);
        }
        if (node.type === "comment") {
          if (isIgnoreAnnotation(node, "start")) {
            this.ignore = true;
            // remove ignore annotation
            this.removals.remove(node);
          } else if (isIgnoreAnnotation(node, "end")) {
            this.ignore = false;
            // remove ignore annotation
            this.removals.remove(node);
          }
        }
      });
    } finally {
      this.removals.apply();
    }
  }
}
