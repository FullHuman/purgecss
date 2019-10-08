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
  UserDefinedOptions
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
import { SELECTOR_STANDARD_TYPES } from "./selector-types";

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

  return getPurgedCSS(css, new Set([...cssFileSelectors, ...cssRawSelectors]));
}

/**
 * Use the extract function to get the list of selectors
 * @param content content (e.g. html file)
 * @param extractor PurgeCSS extractor used to extract the selectors
 */
function extractSelectors(
  content: string,
  extractor: ExtractorFunction
): Set<string> {
  const selectors = new Set(extractor(content));
  // Remove empty string
  selectors.delete("");
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
): Promise<Set<string>> {
  let selectors: Set<string> = new Set();
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
      selectors = new Set([...selectors, ...extractedSelectors]);
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
): Set<string> {
  let selectors: Set<string> = new Set();
  for (const { raw, extension } of content) {
    const extractor = getFileExtractor(`.${extension}`, extractors);
    const extractedSelectors = extractSelectors(raw, extractor);
    selectors = new Set([...selectors, ...extractedSelectors]);
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
  selectors: Set<string>
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
 * Get all the selectors in a css rule
 * @param selector css selector
 */
function getSelectorsInRule(selector: selectorParser.Selector): Set<string> {
  const selectorsInRule: Set<string> = new Set();
  // if inside :not pseudo class, ignore
  if (
    selector.parent &&
    selector.parent.value === ":not" &&
    selector.parent.type === "pseudo"
  ) {
    return selectorsInRule;
  }

  for (const { type, value } of selector.nodes) {
    if (
      SELECTOR_STANDARD_TYPES.includes(type) &&
      typeof value !== "undefined"
    ) {
      selectorsInRule.add(value);
    } else if (
      type === "tag" &&
      typeof value !== "undefined" &&
      !/[+]|n|-|(even)|(odd)|^from$|^to$|^\d/.test(value)
    ) {
      // test if we do not have a pseudo class parameter (e.g. 2n in :nth-child(2n))
      selectorsInRule.add(value);
    }
  }
  return selectorsInRule;
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
  selectors: Set<string>
): Promise<void> {
  const annotation = node.prev();
  if (ignore) return;
  if (
    annotation &&
    annotation.type === "comment" &&
    isIgnoreAnnotation(annotation, "next")
  ) {
    annotation.remove();
    return;
  }

  if (
    node.parent &&
    node.parent.type === "atrule" &&
    node.parent.name === "keyframes"
  ) {
    return;
  }

  if (node.type === "rule" && hasIgnoreAnnotation(node)) {
    return;
  }

  if (node.type !== "rule") return;

  let keepSelector = true;
  node.selector = selectorParser(selectorsParsed => {
    selectorsParsed.walk(selector => {
      if (selector.type !== "selector") {
        return;
      }
      const selectorsInRule = getSelectorsInRule(selector);
      keepSelector = shouldKeepSelector(selectors, selectorsInRule);

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
 * @param selectorsInRule selectors in the css rule
 */
function shouldKeepSelector(
  selectorsInContent: Set<string>,
  selectorsInRule: Set<string>
): boolean {
  for (const selector of selectorsInRule) {
    // pseudo class
    const unescapedSelector = selector.replace(/\\/g, "");
    if (unescapedSelector.startsWith(":")) continue;

    // if the selector is whitelisted with children
    // returns true to keep all children selectors
    if (isSelectorWhitelistedChildren(unescapedSelector)) {
      return true;
    }

    if (
      !(
        selectorsInContent.has(unescapedSelector) ||
        CSS_WHITELIST.includes(unescapedSelector) ||
        isSelectorWhitelisted(unescapedSelector)
      )
    ) {
      return false;
    }
  }
  return true;
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
export function walkThroughCSS(root: postcss.Root, selectors: Set<string>) {
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

export default purge;
