import * as postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import * as fs from "fs";

import glob from "glob";
import { promises as asyncFs } from "fs";
import path from "path";

import { defaultOptions } from "./options";
export { defaultOptions } from "./options";

import {
  Options,
  ResultPurge,
  RawContent,
  Extractors,
  ExtractorFunction,
  IgnoreType,
  AtRules,
  RawCSS,
  UserDefinedOptions,
  ExtractorResult
} from "./types";

import {
  CONFIG_FILENAME,
  ERROR_CONFIG_FILE_LOADING,
  IGNORE_ANNOTATION_NEXT,
  IGNORE_ANNOTATION_START,
  IGNORE_ANNOTATION_END,
  IGNORE_ANNOTATION_CURRENT
} from "./constants";
import { CSS_WHITELIST } from "./internal-whitelist";

let ignore = false;
let options: Options;
const atRules: AtRules = {
  fontFace: [],
  keyframes: []
};

const usedAnimations: Set<string> = new Set();
const usedFontFaces: Set<string> = new Set();
export const selectorsRemoved: Set<string> = new Set();

/**
 * Load the configuration file from the path
 * @param configFile Path of the config file
 */
export async function setOptions(
  configFile: string = CONFIG_FILENAME
): Promise<Options> {
  let options: Options;
  try {
    const t = path.join(process.cwd(), configFile);
    options = await import(t);
  } catch (err) {
    throw new Error(`${ERROR_CONFIG_FILE_LOADING} ${err.message}`);
  }
  return {
    ...defaultOptions,
    ...options
  };
}

/**
 * Set the PurgeCSS options
 * @param purgeCSSOptions PurgeCSS options
 */
export function setPurgeCSSOptions(purgeCSSOptions: Options): void {
  options = purgeCSSOptions;
}

/**
 * Remove unused css
 * @param options PurgeCSS options
 */
async function purge(
  userOptions: UserDefinedOptions | string | undefined
): Promise<ResultPurge[]> {
  options =
    typeof userOptions !== "object"
      ? await setOptions(userOptions)
      : {
          ...defaultOptions,
          ...userOptions
        };
  const { content, css, extractors } = options;

  const fileFormatContents = content.filter(
    o => typeof o === "string"
  ) as string[];
  const rawFormatContents = content.filter(
    o => typeof o === "object"
  ) as RawContent[];

  const cssFileSelectors = await extractSelectorsFromFiles(
    fileFormatContents,
    extractors
  );
  const cssRawSelectors = extractSelectorsFromString(
    rawFormatContents,
    extractors
  );

  return getPurgedCSS(
    css,
    mergeExtractorSelectors(cssFileSelectors, cssRawSelectors)
  );
}

/**
 * Use the extract function to get the list of selectors
 * @param content content (e.g. html file)
 * @param extractor PurgeCSS extractor used to extract the selectors
 */
function extractSelectors(
  content: string,
  extractor: ExtractorFunction
): ExtractorResult {
  const selectors = extractor(content);
  return selectors;
}

/**
 * Extract the selectors present in the files using a purgecss extractor
 * @param files Array of files path or glob pattern
 * @param extractors Array of extractors
 */
export async function extractSelectorsFromFiles(
  files: string[],
  extractors: Extractors[]
): Promise<ExtractorResult> {
  let selectors: ExtractorResult = {
    attributes: {
      names: new Set(),
      values: new Set()
    },
    classes: new Set(),
    ids: new Set(),
    tags: new Set(),
    undetermined: new Set()
  };

  for (const globfile of files) {
    let filesNames: string[] = [];
    try {
      await asyncFs.access(globfile, fs.constants.F_OK);
      filesNames.push(globfile);
    } catch (err) {
      filesNames = glob.sync(globfile);
    }
    for (const file of filesNames) {
      const content = await asyncFs.readFile(file, "utf-8");
      const extractor = getFileExtractor(file, extractors);
      const extractedSelectors = extractSelectors(content, extractor);
      selectors = mergeExtractorSelectors(selectors, extractedSelectors);
    }
  }
  return selectors;
}

/**
 * Extract the selectors present in the passed string using a PurgeCSS extractor
 * @param content Array of content
 * @param extractors Array of extractors
 */
export function extractSelectorsFromString(
  content: RawContent[],
  extractors: Extractors[]
): ExtractorResult {
  let selectors: ExtractorResult = {
    attributes: {
      names: new Set(),
      values: new Set()
    },
    classes: new Set(),
    ids: new Set(),
    tags: new Set(),
    undetermined: new Set()
  };

  for (const { raw, extension } of content) {
    const extractor = getFileExtractor(`.${extension}`, extractors);
    const extractedSelectors = extractSelectors(raw, extractor);
    selectors = mergeExtractorSelectors(selectors, extractedSelectors);
  }
  return selectors;
}

/**
 * Get the extractor corresponding to the extension file
 * @param filename Name of the file
 * @param extractors Array of extractors definition
 */
function getFileExtractor(
  filename: string,
  extractors: Extractors[]
): ExtractorFunction {
  const extractorObj = extractors.find(extractor =>
    extractor.extensions.find(ext => filename.endsWith(ext))
  );

  return typeof extractorObj === "undefined"
    ? options.defaultExtractor
    : extractorObj.extractor;
}

/**
 * Get the purged version of the css based on the files
 * @param cssOptions css options, files or raw strings
 * @param selectors set of extracted css selectors
 */
async function getPurgedCSS(
  cssOptions: Array<string | RawCSS>,
  selectors: ExtractorResult
): Promise<ResultPurge[]> {
  const sources = [];

  // resolve any globs
  const processedOptions: Array<string | RawCSS> = [];
  for (const option of cssOptions) {
    if (typeof option === "string") {
      processedOptions.push(...glob.sync(option));
    } else {
      processedOptions.push(option);
    }
  }

  for (const option of processedOptions) {
    const cssContent =
      typeof option === "string"
        ? options.stdin
          ? option
          : await asyncFs.readFile(option, "utf-8")
        : option.raw;
    const root = postcss.parse(cssContent);

    // purge unused selectors
    walkThroughCSS(root, selectors);

    if (options.fontFace) removeUnusedFontFaces();
    if (options.keyframes) removeUnusedKeyframes();

    const result: ResultPurge = {
      css: root.toString(),
      file: typeof option === "string" ? option : undefined
    };

    if (typeof option === "string") {
      result.file = option;
    }

    if (options.rejected) {
      result.rejected = Array.from(selectorsRemoved);
      selectorsRemoved.clear();
    }

    sources.push(result);
  }
  return sources;
}

/**
 * Evaluate at-rule and register it for future reference
 * @param node node of postcss AST
 */
function evaluateAtRule(node: postcss.AtRule): void {
  // keyframes
  if (options.keyframes && node.name.endsWith("keyframes")) {
    atRules.keyframes.push(node);
    return;
  }
  // font-face
  if (options.fontFace && node.name === "font-face" && node.nodes) {
    for (const childnode of node.nodes) {
      if (childnode.type === "decl" && childnode.prop === "font-family") {
        atRules.fontFace.push({
          name: stripQuotes(childnode.value),
          node
        });
      }
    }
  }
}

/**
 * Evaluate css selector and decide if it should be removed or not
 * @param node node of postcss AST
 * @param selectors selectors used in content files
 */
async function evaluateRule(
  node: postcss.Node,
  selectors: ExtractorResult
): Promise<void> {
  // exit if is in ignoring state activated by an ignore comment
  if (ignore) {
    return;
  }

  // exit if the previous anotation is a ignore next line comment
  const annotation = node.prev();
  if (
    annotation &&
    annotation.type === "comment" &&
    isIgnoreAnnotation(annotation, "next")
  ) {
    annotation.remove();
    return;
  }

  // exit if it is inside a keyframes
  if (
    node.parent &&
    node.parent.type === "atrule" &&
    node.parent.name === "keyframes"
  ) {
    return;
  }

  // exit if it is not a rule
  if (node.type !== "rule") {
    return;
  }

  // exit if it has an ignore rule comment inside
  if (hasIgnoreAnnotation(node)) {
    return;
  }

  let keepSelector = true;
  node.selector = selectorParser(selectorsParsed => {
    selectorsParsed.walk(selector => {
      if (selector.type !== "selector") {
        return;
      }

      keepSelector = shouldKeepSelector(selector, selectors);

      if (!keepSelector) {
        if (options.rejected) selectorsRemoved.add(selector.toString());
        selector.remove();
      }
    });
  }).processSync(node.selector);

  // declarations
  if (keepSelector && typeof node.nodes !== "undefined") {
    for (const childNode of node.nodes) {
      if (childNode.type !== "decl") continue;
      const { prop, value } = childNode;
      if (options.keyframes) {
        if (prop === "animation" || prop === "animation-name") {
          for (const word of value.split(/[\s,]+/)) {
            usedAnimations.add(word);
          }
        }
      }
      if (options.fontFace) {
        if (prop === "font-family") {
          for (const fontName of value.split(",")) {
            const cleanedFontFace = stripQuotes(fontName.trim());
            usedFontFaces.add(cleanedFontFace);
          }
        }
      }
    }
  }

  // remove empty rules
  const parent = node.parent;
  if (!node.selector) node.remove();
  if (isRuleEmpty(parent)) parent.remove();
}

/**
 * Check if the node is a css comment indication to ignore the selector rule
 * @param node node of postcss AST
 * @param type type of css comment
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
 * @param node node of postcss AST
 */
function isRuleEmpty(node: postcss.Container): boolean {
  if (
    (node.type === "rule" && !node.selector) ||
    (node.nodes && !node.nodes.length) ||
    (node.type === "atrule" &&
      ((!node.nodes && !node.params) ||
        (!node.params && node.nodes && !node.nodes.length)))
  ) {
    return true;
  }
  return false;
}

/**
 * Check if the selector is whitelisted by the option whitelist or whitelistPatterns
 * @param selector css selector
 */
function isSelectorWhitelisted(selector: string): boolean {
  return (
    CSS_WHITELIST.includes(selector) ||
    (options.whitelist &&
      options.whitelist.some((v: string) => v === selector)) ||
    (options.whitelistPatterns &&
      options.whitelistPatterns.some((v: RegExp) => v.test(selector)))
  );
}

/**
 * Check if the selector is whitelisted by the whitelistPatternsChildren option
 * @param selector selector
 */
function isSelectorWhitelistedChildren(selector: string): boolean {
  return (
    options.whitelistPatternsChildren &&
    options.whitelistPatternsChildren.some((pattern: RegExp) =>
      pattern.test(selector)
    )
  );
}

/**
 * Check if the node has a css comment indicating to ignore the current selector rule
 * @param rule rule of postcss AST
 */
function hasIgnoreAnnotation(rule: postcss.Rule): boolean {
  let found = false;
  rule.walkComments(node => {
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
 * @param extractorSelectorsA extractor selectors A
 * @param extractorSelectorsB extractor selectors B
 */
export function mergeExtractorSelectors(
  extractorSelectorsA: ExtractorResult,
  extractorSelectorsB: ExtractorResult
): ExtractorResult {
  return {
    attributes: {
      names: new Set([
        ...extractorSelectorsA.attributes.names,
        ...extractorSelectorsB.attributes.names
      ]),
      values: new Set([
        ...extractorSelectorsA.attributes.values,
        ...extractorSelectorsB.attributes.values
      ])
    },
    classes: new Set([
      ...extractorSelectorsA.classes,
      ...extractorSelectorsB.classes
    ]),
    ids: new Set([...extractorSelectorsA.ids, ...extractorSelectorsB.ids]),
    tags: new Set([...extractorSelectorsA.tags, ...extractorSelectorsB.tags]),
    undetermined: new Set([
      ...extractorSelectorsA.undetermined,
      ...extractorSelectorsB.undetermined
    ])
  };
}

/**
 * Remove unused font-faces
 */
export function removeUnusedFontFaces(): void {
  for (const { name, node } of atRules.fontFace) {
    if (!usedFontFaces.has(name)) {
      node.remove();
    }
  }
}

/**
 * Remove unused keyframes
 */
export function removeUnusedKeyframes(): void {
  for (const node of atRules.keyframes) {
    if (!usedAnimations.has(node.params)) {
      node.remove();
    }
  }
}

/**
 * Determine if the selector should be kept, based on the selectors found in the files
 * @param selectorsInContent set of css selectors found in the content files or string
 * @param selectorsFromExtractor selectors in the css rule
 */
function shouldKeepSelector(
  selector: selectorParser.Selector,
  selectorsFromExtractor: ExtractorResult
): boolean {
  // ignore the selector if it is inside a :not pseudo class.
  if (isInPseudoClassNot(selector)) return true;

  let isPresent = false;
  for (const nodeSelector of selector.nodes) {
    // if the selector is whitelisted with children
    // returns true to keep all children selectors
    if (
      nodeSelector.value &&
      isSelectorWhitelistedChildren(nodeSelector.value)
    ) {
      return true;
    }

    // The selector is found in the internal and user-defined whitelist
    if (
      nodeSelector.value &&
      (CSS_WHITELIST.includes(nodeSelector.value) ||
        isSelectorWhitelisted(nodeSelector.value))
    ) {
      isPresent = true;
      continue;
    }

    switch (nodeSelector.type) {
      case "attribute":
        // `value` is a dynamic attribute, highly used in input element
        // the choice is to always leave `value` as it can change based on the user
        isPresent =
          nodeSelector.attribute === "value"
            ? true
            : isAttributeFound(nodeSelector, selectorsFromExtractor);
        break;
      case "class":
        isPresent = isClassFound(nodeSelector, selectorsFromExtractor);
        break;
      case "id":
        isPresent = isIdentifierFound(nodeSelector, selectorsFromExtractor);
        break;
      case "tag":
        isPresent = isTagFound(nodeSelector, selectorsFromExtractor);
        break;
      default:
        break;
    }
    // selector is not in whitelist children or in whitelist
    // and it has not been found  as an attribute/class/identifier/tag
    if (!isPresent) return false;
  }
  return isPresent;
}

/**
 * Strips quotes of a string
 * @param str string to be stripped
 */
function stripQuotes(str: string) {
  return str.replace(/(^["'])|(["']$)/g, "");
}

/**
 * Walk through the CSS AST and remove unused CSS
 * @param root root node of the postcss AST
 * @param selectors selectors used in content files
 */
export function walkThroughCSS(root: postcss.Root, selectors: ExtractorResult) {
  root.walk(node => {
    if (node.type === "rule") {
      return evaluateRule(node, selectors);
    }
    if (node.type === "atrule") {
      return evaluateAtRule(node);
    }
    if (node.type === "comment") {
      if (isIgnoreAnnotation(node, "start")) {
        ignore = true;
        // remove ignore annotation
        node.remove();
      } else if (isIgnoreAnnotation(node, "end")) {
        ignore = false;
        // remove ignore annotation
        node.remove();
      }
    }
  });
}

/**
 * Returns true if the attribute is found in the extractor selectors
 * @param attributeNode node of type `attribute`
 * @param selectors extractor selectors
 */
function isAttributeFound(
  attributeNode: selectorParser.Attribute,
  selectors: ExtractorResult
): boolean {
  if (
    !selectors.attributes.names.has(attributeNode.attribute) &&
    !selectors.undetermined.has(attributeNode.attribute)
  ) {
    return false;
  }

  switch (attributeNode.operator) {
    case "$=":
      return (
        Array.from(selectors.attributes.values).some(str =>
          str.endsWith(attributeNode.value!)
        ) ||
        Array.from(selectors.undetermined).some(str =>
          str.endsWith(attributeNode.value!)
        )
      );
    case "~=":
    case "*=":
      return (
        Array.from(selectors.attributes.values).some(str =>
          str.includes(attributeNode.value!)
        ) ||
        Array.from(selectors.undetermined).some(str =>
          str.includes(attributeNode.value!)
        )
      );
    case "=":
      return (
        Array.from(selectors.attributes.values).some(
          str => str === attributeNode.value
        ) ||
        Array.from(selectors.undetermined).some(
          str => str === attributeNode.value!
        )
      );
    case "|=":
    case "^=":
      return (
        Array.from(selectors.attributes.values).some(str =>
          str.startsWith(attributeNode.value!)
        ) ||
        Array.from(selectors.undetermined).some(str =>
          str.startsWith(attributeNode.value!)
        )
      );
    default:
      return true;
  }
}

/**
 * Returns true if the class is found in the extractor selectors
 * @param classNode node of type `class`
 * @param selectors extractor selectors
 */
function isClassFound(
  classNode: selectorParser.ClassName,
  selectors: ExtractorResult
): boolean {
  return (
    selectors.classes.has(classNode.value) ||
    selectors.undetermined.has(classNode.value)
  );
}

/**
 * Returns true if the identifier is found in the extractor selectors
 * @param identifierNode node of type `identifier`
 * @param selectors extractor selectors
 */
function isIdentifierFound(
  identifierNode: selectorParser.Identifier,
  selectors: ExtractorResult
): boolean {
  return (
    selectors.ids.has(identifierNode.value) ||
    selectors.undetermined.has(identifierNode.value)
  );
}

/**
 * Returns true if the tag is found in the extractor selectors
 * @param tagNode node of type `tag`
 * @param selectors extractor selectors
 */
function isTagFound(
  tagNode: selectorParser.Tag,
  selectors: ExtractorResult
): boolean {
  return (
    selectors.tags.has(tagNode.value) ||
    selectors.undetermined.has(tagNode.value)
  );
}

/**
 * Returns true if the selector is inside a :not pseudo class
 * @param selector selector
 */
function isInPseudoClassNot(selector: selectorParser.Node) {
  return (
    selector.parent &&
    selector.parent.type === "pseudo" &&
    selector.parent.value === ":not"
  );
}

export default purge;
