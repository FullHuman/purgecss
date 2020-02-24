import * as postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import * as fs from "fs";
import { promisify } from "util";

import glob from "glob";
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
  ExtractorResultDetailed
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
import VariablesStructure from "./variables-structure";

const asyncFs = {
  access: promisify(fs.access),
  readFile: promisify(fs.readFile)
};

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
 * Use the extract function to get the list of selectors
 * @param content content (e.g. html file)
 * @param extractor PurgeCSS extractor used to extract the selectors
 */
async function extractSelectors(
  content: string,
  extractor: ExtractorFunction
): Promise<ExtractorResultDetailed> {
  const selectors = await extractor(content);
  return Array.isArray(selectors)
    ? {
        attributes: {
          names: [],
          values: []
        },
        classes: [],
        ids: [],
        tags: [],
        undetermined: selectors
      }
    : selectors;
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
  extractorSelectorsA: ExtractorResultDetailed,
  extractorSelectorsB: ExtractorResultDetailed
): ExtractorResultDetailed {
  return {
    attributes: {
      names: [
        ...extractorSelectorsA.attributes.names,
        ...extractorSelectorsB.attributes.names
      ],
      values: [
        ...extractorSelectorsA.attributes.values,
        ...extractorSelectorsB.attributes.values
      ]
    },
    classes: [...extractorSelectorsA.classes, ...extractorSelectorsB.classes],
    ids: [...extractorSelectorsA.ids, ...extractorSelectorsB.ids],
    tags: [...extractorSelectorsA.tags, ...extractorSelectorsB.tags],
    undetermined: [
      ...extractorSelectorsA.undetermined,
      ...extractorSelectorsB.undetermined
    ]
  };
}

/**
 * Strips quotes of a string
 * @param str string to be stripped
 */
function stripQuotes(str: string) {
  return str.replace(/(^["'])|(["']$)/g, "");
}

/**
 * Returns true if the attribute is found in the extractor selectors
 * @param attributeNode node of type `attribute`
 * @param selectors extractor selectors
 */
function isAttributeFound(
  attributeNode: selectorParser.Attribute,
  selectors: ExtractorResultDetailed
): boolean {
  if (
    !selectors.attributes.names.includes(attributeNode.attribute) &&
    !selectors.undetermined.includes(attributeNode.attribute)
  ) {
    return false;
  }

  switch (attributeNode.operator) {
    case "$=":
      return (
        selectors.attributes.values.some(str =>
          str.endsWith(attributeNode.value!)
        ) ||
        selectors.undetermined.some(str => str.endsWith(attributeNode.value!))
      );
    case "~=":
    case "*=":
      return (
        selectors.attributes.values.some(str =>
          str.includes(attributeNode.value!)
        ) ||
        selectors.undetermined.some(str => str.includes(attributeNode.value!))
      );
    case "=":
      return (
        selectors.attributes.values.some(str => str === attributeNode.value) ||
        selectors.undetermined.some(str => str === attributeNode.value!)
      );
    case "|=":
    case "^=":
      return (
        selectors.attributes.values.some(str =>
          str.startsWith(attributeNode.value!)
        ) ||
        selectors.undetermined.some(str => str.startsWith(attributeNode.value!))
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
  selectors: ExtractorResultDetailed
): boolean {
  return (
    selectors.classes.includes(classNode.value) ||
    selectors.undetermined.includes(classNode.value)
  );
}

/**
 * Returns true if the identifier is found in the extractor selectors
 * @param identifierNode node of type `identifier`
 * @param selectors extractor selectors
 */
function isIdentifierFound(
  identifierNode: selectorParser.Identifier,
  selectors: ExtractorResultDetailed
): boolean {
  return (
    selectors.ids.includes(identifierNode.value) ||
    selectors.undetermined.includes(identifierNode.value)
  );
}

/**
 * Returns true if the tag is found in the extractor selectors
 * @param tagNode node of type `tag`
 * @param selectors extractor selectors
 */
function isTagFound(
  tagNode: selectorParser.Tag,
  selectors: ExtractorResultDetailed
): boolean {
  return (
    selectors.tags.includes(tagNode.value) ||
    selectors.undetermined.includes(tagNode.value)
  );
}

/**
 * Returns true if the selector is inside a pseudo class
 * (e.g. :nth-child, :nth-of-type, :only-child, :not)
 * @param selector selector
 */
function isInPseudoClass(selector: selectorParser.Node) {
  return (
    selector.parent &&
    selector.parent.type === "pseudo" &&
    selector.parent.value.startsWith(":")
  );
}

function matchAll(str: string, regexp: RegExp): RegExpMatchArray[] {
  const matches: RegExpMatchArray[] = [];
  str.replace(regexp, function() {
    const match: RegExpMatchArray = Array.prototype.slice.call(
      arguments,
      0,
      -2
    );
    match.input = arguments[arguments.length - 1];
    match.index = arguments[arguments.length - 2];
    matches.push(match);
    return str;
  });
  return matches;
}

class PurgeCSS {
  private ignore = false;
  private atRules: AtRules = {
    fontFace: [],
    keyframes: []
  };

  private usedAnimations: Set<string> = new Set();
  private usedFontFaces: Set<string> = new Set();
  public selectorsRemoved: Set<string> = new Set();
  private variablesStructure: VariablesStructure = new VariablesStructure();

  public options: Options = defaultOptions;

  private collectDeclarationsData(declaration: postcss.Declaration) {
    const { prop, value } = declaration;

    // collect css properties data
    if (this.options.variables) {
      const usedVariablesMatchesInDeclaration = matchAll(
        value,
        /var\((.+?)[\,)]/g
      );
      if (prop.startsWith("--")) {
        this.variablesStructure.addVariable(declaration);

        if (usedVariablesMatchesInDeclaration.length > 0) {
          this.variablesStructure.addVariableUsage(
            declaration,
            usedVariablesMatchesInDeclaration
          );
        }
      } else {
        if (usedVariablesMatchesInDeclaration.length > 0) {
          this.variablesStructure.addVariableUsageInProperties(
            usedVariablesMatchesInDeclaration
          );
        }
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
   * @param filename Name of the file
   * @param extractors Array of extractors definition
   */
  private getFileExtractor(
    filename: string,
    extractors: Extractors[]
  ): ExtractorFunction {
    const extractorObj = extractors.find(extractor =>
      extractor.extensions.find(ext => filename.endsWith(ext))
    );

    return typeof extractorObj === "undefined"
      ? this.options.defaultExtractor
      : extractorObj.extractor;
  }

  /**
   * Extract the selectors present in the files using a purgecss extractor
   * @param files Array of files path or glob pattern
   * @param extractors Array of extractors
   */
  public async extractSelectorsFromFiles(
    files: string[],
    extractors: Extractors[]
  ): Promise<{ selectors: ExtractorResultDetailed; fileList: string[] }> {
    let selectors: ExtractorResultDetailed = {
      attributes: {
        names: [],
        values: []
      },
      classes: [],
      ids: [],
      tags: [],
      undetermined: []
    };

    let fileList: string[] = [];

    for (const globfile of files) {
      let filesNames: string[] = [];

      try {
        await asyncFs.access(globfile, fs.constants.F_OK);
        filesNames.push(globfile);
      } catch (err) {
        filesNames = glob.sync(globfile);
      }
      for (const file of filesNames) {
        fileList.push(file);
        const content = await asyncFs.readFile(file, "utf-8");
        const extractor = this.getFileExtractor(file, extractors);
        const extractedSelectors = await extractSelectors(content, extractor);
        selectors = mergeExtractorSelectors(selectors, extractedSelectors);
      }
    }
    return { selectors, fileList };
  }

  /**
   * Extract the selectors present in the passed string using a PurgeCSS extractor
   * @param content Array of content
   * @param extractors Array of extractors
   */
  public async extractSelectorsFromString(
    content: RawContent[],
    extractors: Extractors[]
  ): Promise<ExtractorResultDetailed> {
    let selectors: ExtractorResultDetailed = {
      attributes: {
        names: [],
        values: []
      },
      classes: [],
      ids: [],
      tags: [],
      undetermined: []
    };

    for (const { raw, extension } of content) {
      const extractor = this.getFileExtractor(`.${extension}`, extractors);
      const extractedSelectors = await extractSelectors(raw, extractor);
      selectors = mergeExtractorSelectors(selectors, extractedSelectors);
    }
    return selectors;
  }

  /**
   * Evaluate at-rule and register it for future reference
   * @param node node of postcss AST
   */
  private evaluateAtRule(node: postcss.AtRule): void {
    // keyframes
    if (this.options.keyframes && node.name.endsWith("keyframes")) {
      this.atRules.keyframes.push(node);
      return;
    }
    // font-face
    if (this.options.fontFace && node.name === "font-face" && node.nodes) {
      for (const childnode of node.nodes) {
        if (childnode.type === "decl" && childnode.prop === "font-family") {
          this.atRules.fontFace.push({
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
  private async evaluateRule(
    node: postcss.Node,
    selectors: ExtractorResultDetailed
  ): Promise<void> {
    // exit if is in ignoring state activated by an ignore comment
    if (this.ignore) {
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

        keepSelector = this.shouldKeepSelector(selector, selectors);

        if (!keepSelector) {
          if (this.options.rejected)
            this.selectorsRemoved.add(selector.toString());
          selector.remove();
        }
      });
    }).processSync(node.selector);

    // declarations
    if (keepSelector && typeof node.nodes !== "undefined") {
      for (const childNode of node.nodes) {
        if (childNode.type !== "decl") continue;
        this.collectDeclarationsData(childNode);
      }
    }

    // remove empty rules
    const parent = node.parent;
    if (!node.selector) node.remove();
    if (isRuleEmpty(parent)) parent.remove();
  }

  /**
   * Get the purged version of the css based on the files
   * @param cssOptions css options, files or raw strings
   * @param selectors set of extracted css selectors
   */
  public async getPurgedCSS(
    cssOptions: Array<string | RawCSS>,
    selectors: ExtractorResultDetailed
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
          ? this.options.stdin
            ? option
            : await asyncFs.readFile(option, "utf-8")
          : option.raw;
      const root = postcss.parse(cssContent);

      // purge unused selectors
      this.walkThroughCSS(root, selectors);

      if (this.options.fontFace) this.removeUnusedFontFaces();
      if (this.options.keyframes) this.removeUnusedKeyframes();
      if (this.options.variables) this.removeUnusedCSSVariables();

      const result: ResultPurge = {
        css: root.toString(),
        file: typeof option === "string" ? option : undefined
      };

      if (typeof option === "string") {
        result.file = option;
      }

      if (this.options.rejected) {
        result.rejected = Array.from(this.selectorsRemoved);
        this.selectorsRemoved.clear();
      }

      sources.push(result);
    }
    return sources;
  }

  /**
   * Check if the selector is whitelisted by the option whitelist or whitelistPatterns
   * @param selector css selector
   */
  private isSelectorWhitelisted(selector: string): boolean {
    return (
      CSS_WHITELIST.includes(selector) ||
      (this.options.whitelist &&
        this.options.whitelist.some((v: string) => v === selector)) ||
      (this.options.whitelistPatterns &&
        this.options.whitelistPatterns.some((v: RegExp) => v.test(selector)))
    );
  }

  /**
   * Check if the selector is whitelisted by the whitelistPatternsChildren option
   * @param selector selector
   */
  private isSelectorWhitelistedChildren(selector: string): boolean {
    return (
      this.options.whitelistPatternsChildren &&
      this.options.whitelistPatternsChildren.some((pattern: RegExp) =>
        pattern.test(selector)
      )
    );
  }

  /**
   * Remove unused css
   * @param options PurgeCSS options
   */
  public async purge(
    userOptions: UserDefinedOptions | string | undefined
  ): Promise<ResultPurge[]> {
    this.options =
      typeof userOptions !== "object"
        ? await setOptions(userOptions)
        : {
            ...defaultOptions,
            ...userOptions
          };
    const { content, css, extractors } = this.options;

    const fileFormatContents = content.filter(
      o => typeof o === "string"
    ) as string[];
    const rawFormatContents = content.filter(
      o => typeof o === "object"
    ) as RawContent[];

    const {
      selectors: cssFileSelectors
    } = await this.extractSelectorsFromFiles(fileFormatContents, extractors);
    const cssRawSelectors = await this.extractSelectorsFromString(
      rawFormatContents,
      extractors
    );

    return this.getPurgedCSS(
      css,
      mergeExtractorSelectors(cssFileSelectors, cssRawSelectors)
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
      if (!this.usedAnimations.has(node.params)) {
        node.remove();
      }
    }
  }

  /**
   * Determine if the selector should be kept, based on the selectors found in the files
   * @param selectorsInContent set of css selectors found in the content files or string
   * @param selectorsFromExtractor selectors in the css rule
   */
  private shouldKeepSelector(
    selector: selectorParser.Selector,
    selectorsFromExtractor: ExtractorResultDetailed
  ): boolean {
    // ignore the selector if it is inside a pseudo class
    if (isInPseudoClass(selector)) return true;

    let isPresent = false;

    for (const nodeSelector of selector.nodes) {
      const val =
        (nodeSelector.type === "attribute" && nodeSelector.attribute) ||
        nodeSelector.value;

      // if the selector is whitelisted with children
      // returns true to keep all children selectors
      if (val && this.isSelectorWhitelistedChildren(val)) {
        return true;
      }

      // The selector is found in the internal and user-defined whitelist
      if (
        val &&
        (CSS_WHITELIST.includes(val) || this.isSelectorWhitelisted(val))
      ) {
        isPresent = true;
        continue;
      }

      switch (nodeSelector.type) {
        case "attribute":
          // `value` is a dynamic attribute, highly used in input element
          // the choice is to always leave `value` as it can change based on the user
          // idem for `checked`, `selected`, `open`
          isPresent = ["value", "checked", "selected", "open"].includes(
            nodeSelector.attribute
          )
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
      // and it has not been found as an attribute/class/identifier/tag
      if (!isPresent) {
        return false;
      }
    }
    return isPresent;
  }

  /**
   * Walk through the CSS AST and remove unused CSS
   * @param root root node of the postcss AST
   * @param selectors selectors used in content files
   */
  public walkThroughCSS(
    root: postcss.Root,
    selectors: ExtractorResultDetailed
  ) {
    root.walk(node => {
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

export { PurgeCSS };
export default PurgeCSS;
