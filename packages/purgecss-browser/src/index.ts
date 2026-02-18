/**
 * Browser-compatible build of PurgeCSS.
 *
 * This package has the same CSS-purging logic as the main `purgecss` package
 * but **without** any Node.js APIs (`fs`, `path`, `glob`, …).
 * All `content` and `css` must therefore be provided as raw strings.
 *
 * @packageDocumentation
 */

import * as postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import {
  IGNORE_ANNOTATION_CURRENT,
  IGNORE_ANNOTATION_END,
  IGNORE_ANNOTATION_NEXT,
  IGNORE_ANNOTATION_START,
} from "./constants";
import ExtractorResultSets from "./ExtractorResultSets";
import { CSS_SAFELIST } from "./internal-safelist";
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

import { VariablesStructure } from "./VariablesStructure";

export * from "./types";
export { defaultOptions, ExtractorResultSets, PurgeCSS, VariablesStructure };
export * from "./VariablesStructure";

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
 * Use the extract function to get the list of selectors
 *
 * @param content - content (e.g. html string)
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
 * Check if the node correspond to an empty css rule
 *
 * @param node - node of postcss AST
 * @returns true if the rule is empty
 */
function isRuleEmpty(node?: postcss.Container): boolean {
  if (
    (isPostCSSRule(node) && !node.selector) ||
    (node?.nodes && !node.nodes.length) ||
    (isPostCSSAtRule(node) &&
      ((!node.nodes && !node.params) ||
        (!node.params && node.nodes && !node.nodes.length)))
  ) {
    return true;
  }
  return false;
}

/**
 * Check if the node has a css comment indicating to ignore the current selector rule
 *
 * @param rule - rule of postcss AST
 */
function hasIgnoreAnnotation(rule: postcss.Rule): boolean {
  let found = false;
  rule.walkComments((node) => {
    if (
      node &&
      node.type === "comment" &&
      node.text.includes(IGNORE_ANNOTATION_CURRENT)
    ) {
      found = true;
      node.remove();
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
 * Browser-compatible PurgeCSS class.
 *
 * Works identically to the Node.js `PurgeCSS` class, except that all
 * `content` and `css` options **must** be supplied as raw strings — the
 * browser build has no access to the file system.
 *
 * @example
 * ```ts
 * const results = await new PurgeCSS().purge({
 *   content: [{ raw: '<div class="used">…</div>', extension: 'html' }],
 *   css:     [{ raw: '.used { color: red } .unused { color: blue }' }],
 * });
 * console.log(results[0].css); // → '.used { color: red }'
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

  private collectDeclarationsData(declaration: postcss.Declaration): void {
    const { prop, value } = declaration;

    // collect css properties data
    if (this.options.variables) {
      const usedVariablesMatchesInDeclaration =
        value.matchAll(/var\((.+?)[,)]/g);
      if (prop.startsWith("--")) {
        this.variablesStructure.addVariable(declaration);
        this.variablesStructure.addVariableUsage(
          declaration,
          usedVariablesMatchesInDeclaration,
        );
      } else {
        this.variablesStructure.addVariableUsageInProperties(
          usedVariablesMatchesInDeclaration,
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
   * Get the extractor corresponding to the extension file
   * @param filename - Name of the file (or `.{extension}`)
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
   * Extract the selectors present in the passed raw content strings using a
   * PurgeCSS extractor.
   *
   * @param content - Array of raw content objects
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
   */
  private evaluateAtRule(node: postcss.AtRule): void {
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
   * @param selectors - selectors used in content files
   */
  private evaluateRule(
    node: postcss.Node,
    selectors: ExtractorResultSets,
  ): void {
    // exit if is in ignoring state activated by an ignore comment
    if (this.ignore) {
      return;
    }

    // exit if the previous annotation is a ignore next line comment
    const annotation = node.prev();
    if (
      isPostCSSComment(annotation) &&
      isIgnoreAnnotation(annotation, "next")
    ) {
      annotation.remove();
      return;
    }

    // exit if it is inside a keyframes
    if (
      node.parent &&
      isPostCSSAtRule(node.parent) &&
      node.parent.name.endsWith("keyframes")
    ) {
      return;
    }

    // exit if it is not a rule
    if (!isPostCSSRule(node)) {
      return;
    }

    // exit if it has an ignore rule comment inside
    if (hasIgnoreAnnotation(node)) {
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
          if (this.options.rejected) {
            this.selectorsRemoved.add(selector.toString());
          }
          if (this.options.rejectedCss) {
            selectorsRemovedFromRule.push(selector.toString());
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
    if (node.selector && typeof node.nodes !== "undefined") {
      for (const childNode of node.nodes) {
        if (childNode.type !== "decl") continue;
        this.collectDeclarationsData(childNode);
      }
    }

    // remove empty rules
    const parent = node.parent;
    if (!node.selector) {
      node.remove();
    }
    if (isRuleEmpty(parent)) parent?.remove();

    // rebuild the rule with the removed selectors and optionally its parent
    if (this.options.rejectedCss) {
      if (selectorsRemovedFromRule.length > 0) {
        const clone = node.clone();
        const parentClone = parent?.clone().removeAll().append(clone);
        clone.selectors = selectorsRemovedFromRule;
        const nodeToPreserve = parentClone ? parentClone : clone;
        this.removedNodes.push(nodeToPreserve);
      }
    }
  }

  /**
   * Get the purged version of the css based on the raw CSS objects
   *
   * @param cssOptions - array of raw CSS objects
   * @param selectors - set of extracted css selectors
   */
  public async getPurgedCSS(
    cssOptions: RawCSS[],
    selectors: ExtractorResultSets,
  ): Promise<ResultPurge[]> {
    const sources: ResultPurge[] = [];

    for (const option of cssOptions) {
      const root = postcss.parse(option.raw);

      // purge unused selectors
      this.walkThroughCSS(root, selectors);

      if (this.options.fontFace) this.removeUnusedFontFaces();
      if (this.options.keyframes) this.removeUnusedKeyframes();
      if (this.options.variables) this.removeUnusedCSSVariables();

      const result: ResultPurge = {
        css: root.toResult().toString(),
        file: option.name,
      };

      if (this.options.rejected) {
        result.rejected = Array.from(this.selectorsRemoved);
        this.selectorsRemoved.clear();
      }

      if (this.options.rejectedCss) {
        result.rejectedCss = postcss
          .root({ nodes: this.removedNodes })
          .toString();
      }

      sources.push(result);
    }
    return sources;
  }

  /**
   * Check if the keyframe is safelisted with the option safelist keyframes
   *
   * @param keyframesName - name of the keyframe animation
   */
  private isKeyframesSafelisted(keyframesName: string): boolean {
    return this.options.safelist.keyframes.some((safelistItem) => {
      return typeof safelistItem === "string"
        ? safelistItem === keyframesName
        : safelistItem.test(keyframesName);
    });
  }

  /**
   * Check if the selector is blocklisted with the option blocklist
   *
   * @param selector - css selector
   */
  private isSelectorBlocklisted(selector: string): boolean {
    return this.options.blocklist.some((blocklistItem) => {
      return typeof blocklistItem === "string"
        ? blocklistItem === selector
        : blocklistItem.test(selector);
    });
  }

  /**
   * Check if the selector is safelisted with the option safelist standard
   *
   * @param selector - css selector
   */
  private isSelectorSafelisted(selector: string): boolean {
    const isSafelisted = this.options.safelist.standard.some((safelistItem) => {
      return typeof safelistItem === "string"
        ? safelistItem === selector
        : safelistItem.test(selector);
    });
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
      safelistItem.test(selector),
    );
  }

  /**
   * Check if the selector is safelisted with the option safelist greedy
   *
   * @param selector - selector
   */
  private isSelectorSafelistedGreedy(selector: string): boolean {
    return this.options.safelist.greedy.some((safelistItem) =>
      safelistItem.test(selector),
    );
  }

  /**
   * Remove unused CSS
   *
   * @param userOptions - PurgeCSS options (raw content and CSS only — no file paths)
   * @returns an array of objects containing the optional name and the purged CSS string
   *
   * @example
   * ```ts
   * const results = await new PurgeCSS().purge({
   *   content: [{ raw: document.documentElement.outerHTML, extension: 'html' }],
   *   css:     [{ raw: originalCss }],
   * });
   * ```
   */
  public async purge(
    userOptions: UserDefinedOptions,
  ): Promise<ResultPurge[]> {
    this.options = {
      ...defaultOptions,
      ...userOptions,
      safelist: standardizeSafelist(userOptions.safelist),
    };

    const { content, css, extractors, safelist } = this.options;

    if (this.options.variables) {
      this.variablesStructure.safelist = safelist.variables || [];
    }

    const selectors = await this.extractSelectorsFromString(
      content,
      extractors,
    );

    return this.getPurgedCSS(css, selectors);
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
   * Determine if the selector should be kept, based on the selectors found in
   * the content strings
   *
   * @param selector - set of css selectors found in the content
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

    if (isPseudoClassAtRootLevel(selector)) {
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

    let isPresent = false;

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
        isPresent = true;
        continue;
      }

      // The selector is present in the blocklist
      if (selectorValue && this.isSelectorBlocklisted(selectorValue)) {
        return false;
      }

      switch (selectorNode.type) {
        case "attribute":
          // `value` is a dynamic attribute, highly used in input element
          // the choice is to always leave `value` as it can change based on the user
          // idem for `checked`, `selected`, `open`
          isPresent = [
            ...this.options.dynamicAttributes,
            "value",
            "checked",
            "selected",
            "open",
          ].includes(selectorNode.attribute)
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
          continue;
      }

      // selector is not safelisted
      // and it has not been found as an attribute/class/id/tag
      if (!isPresent) {
        return false;
      }
    }

    return isPresent;
  }

  /**
   * Walk through the CSS AST and remove unused CSS
   *
   * @param root - root node of the postcss AST
   * @param selectors - selectors used in content strings
   */
  public walkThroughCSS(
    root: PostCSSRoot,
    selectors: ExtractorResultSets,
  ): void {
    root.walk((node) => {
      if (node.type === "rule") {
        return this.evaluateRule(node, selectors);
      }
      if (node.type === "atrule") {
        return this.evaluateAtRule(node);
      }
      if (node.type === "comment") {
        if (isIgnoreAnnotation(node, "start")) {
          this.ignore = true;
          // remove ignore annotation
          node.remove();
        } else if (isIgnoreAnnotation(node, "end")) {
          this.ignore = false;
          // remove ignore annotation
          node.remove();
        }
      }
    });
  }
}
