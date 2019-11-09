import { parse } from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { promises, constants } from 'fs';
import glob from 'glob';
import path from 'path';

const defaultOptions = {
    css: [],
    content: [],
    defaultExtractor: (content) => content.match(/[A-Za-z0-9_-]+/g) || [],
    extractors: [],
    fontFace: false,
    keyframes: false,
    rejected: false,
    stdin: false,
    stdout: false,
    variables: false,
    whitelist: [],
    whitelistPatterns: [],
    whitelistPatternsChildren: []
};

const IGNORE_ANNOTATION_CURRENT = "purgecss ignore current";
const IGNORE_ANNOTATION_NEXT = "purgecss ignore";
const IGNORE_ANNOTATION_START = "purgecss start ignore";
const IGNORE_ANNOTATION_END = "purgecss end ignore";
const CONFIG_FILENAME = "purgecss.config.js";
// Error Message
const ERROR_CONFIG_FILE_LOADING = "Error loading the config file";

const CSS_WHITELIST = [
    "*",
    "::-webkit-scrollbar",
    "::selection",
    ":root",
    "::before",
    "::after"
];

/**
 * Load the configuration file from the path
 * @param configFile Path of the config file
 */
async function setOptions(configFile = CONFIG_FILENAME) {
    let options;
    try {
        const t = path.join(process.cwd(), configFile);
        options = await import(t);
    }
    catch (err) {
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
function extractSelectors(content, extractor) {
    const selectors = extractor(content);
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
function isIgnoreAnnotation(node, type) {
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
function isRuleEmpty(node) {
    if ((node.type === "rule" && !node.selector) ||
        (node.nodes && !node.nodes.length) ||
        (node.type === "atrule" &&
            ((!node.nodes && !node.params) ||
                (!node.params && node.nodes && !node.nodes.length)))) {
        return true;
    }
    return false;
}
/**
 * Check if the node has a css comment indicating to ignore the current selector rule
 * @param rule rule of postcss AST
 */
function hasIgnoreAnnotation(rule) {
    let found = false;
    rule.walkComments(node => {
        if (node &&
            node.type === "comment" &&
            node.text.includes(IGNORE_ANNOTATION_CURRENT)) {
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
function mergeExtractorSelectors(extractorSelectorsA, extractorSelectorsB) {
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
function stripQuotes(str) {
    return str.replace(/(^["'])|(["']$)/g, "");
}
/**
 * Returns true if the attribute is found in the extractor selectors
 * @param attributeNode node of type `attribute`
 * @param selectors extractor selectors
 */
function isAttributeFound(attributeNode, selectors) {
    if (!selectors.attributes.names.includes(attributeNode.attribute) &&
        !selectors.undetermined.includes(attributeNode.attribute)) {
        return false;
    }
    switch (attributeNode.operator) {
        case "$=":
            return (selectors.attributes.values.some(str => str.endsWith(attributeNode.value)) ||
                Array.from(selectors.undetermined).some(str => str.endsWith(attributeNode.value)));
        case "~=":
        case "*=":
            return (selectors.attributes.values.some(str => str.includes(attributeNode.value)) ||
                selectors.undetermined.some(str => str.includes(attributeNode.value)));
        case "=":
            return (selectors.attributes.values.some(str => str === attributeNode.value) ||
                selectors.undetermined.some(str => str === attributeNode.value));
        case "|=":
        case "^=":
            return (selectors.attributes.values.some(str => str.startsWith(attributeNode.value)) ||
                selectors.undetermined.some(str => str.startsWith(attributeNode.value)));
        default:
            return true;
    }
}
/**
 * Returns true if the class is found in the extractor selectors
 * @param classNode node of type `class`
 * @param selectors extractor selectors
 */
function isClassFound(classNode, selectors) {
    return (selectors.classes.includes(classNode.value) ||
        selectors.undetermined.includes(classNode.value));
}
/**
 * Returns true if the identifier is found in the extractor selectors
 * @param identifierNode node of type `identifier`
 * @param selectors extractor selectors
 */
function isIdentifierFound(identifierNode, selectors) {
    return (selectors.ids.includes(identifierNode.value) ||
        selectors.undetermined.includes(identifierNode.value));
}
/**
 * Returns true if the tag is found in the extractor selectors
 * @param tagNode node of type `tag`
 * @param selectors extractor selectors
 */
function isTagFound(tagNode, selectors) {
    return (selectors.tags.includes(tagNode.value) ||
        selectors.undetermined.includes(tagNode.value));
}
/**
 * Returns true if the selector is inside a :not pseudo class
 * @param selector selector
 */
function isInPseudoClassNot(selector) {
    return (selector.parent &&
        selector.parent.type === "pseudo" &&
        selector.parent.value === ":not");
}
class PurgeCSS {
    constructor() {
        this.ignore = false;
        this.atRules = {
            fontFace: [],
            keyframes: []
        };
        this.usedAnimations = new Set();
        this.usedFontFaces = new Set();
        this.selectorsRemoved = new Set();
    }
    /**
     * Get the extractor corresponding to the extension file
     * @param filename Name of the file
     * @param extractors Array of extractors definition
     */
    getFileExtractor(filename, extractors) {
        const extractorObj = extractors.find(extractor => extractor.extensions.find(ext => filename.endsWith(ext)));
        return typeof extractorObj === "undefined"
            ? this.options.defaultExtractor
            : extractorObj.extractor;
    }
    /**
     * Extract the selectors present in the files using a purgecss extractor
     * @param files Array of files path or glob pattern
     * @param extractors Array of extractors
     */
    async extractSelectorsFromFiles(files, extractors) {
        let selectors = {
            attributes: {
                names: [],
                values: []
            },
            classes: [],
            ids: [],
            tags: [],
            undetermined: []
        };
        for (const globfile of files) {
            let filesNames = [];
            try {
                await promises.access(globfile, constants.F_OK);
                filesNames.push(globfile);
            }
            catch (err) {
                filesNames = glob.sync(globfile);
            }
            for (const file of filesNames) {
                const content = await promises.readFile(file, "utf-8");
                const extractor = this.getFileExtractor(file, extractors);
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
    extractSelectorsFromString(content, extractors) {
        let selectors = {
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
            const extractedSelectors = extractSelectors(raw, extractor);
            selectors = mergeExtractorSelectors(selectors, extractedSelectors);
        }
        return selectors;
    }
    /**
     * Evaluate at-rule and register it for future reference
     * @param node node of postcss AST
     */
    evaluateAtRule(node) {
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
    async evaluateRule(node, selectors) {
        // exit if is in ignoring state activated by an ignore comment
        if (this.ignore) {
            return;
        }
        // exit if the previous anotation is a ignore next line comment
        const annotation = node.prev();
        if (annotation &&
            annotation.type === "comment" &&
            isIgnoreAnnotation(annotation, "next")) {
            annotation.remove();
            return;
        }
        // exit if it is inside a keyframes
        if (node.parent &&
            node.parent.type === "atrule" &&
            node.parent.name === "keyframes") {
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
                if (childNode.type !== "decl")
                    continue;
                const { prop, value } = childNode;
                if (this.options.keyframes) {
                    if (prop === "animation" || prop === "animation-name") {
                        for (const word of value.split(/[\s,]+/)) {
                            this.usedAnimations.add(word);
                        }
                    }
                }
                if (this.options.fontFace) {
                    if (prop === "font-family") {
                        for (const fontName of value.split(",")) {
                            const cleanedFontFace = stripQuotes(fontName.trim());
                            this.usedFontFaces.add(cleanedFontFace);
                        }
                    }
                }
            }
        }
        // remove empty rules
        const parent = node.parent;
        if (!node.selector)
            node.remove();
        if (isRuleEmpty(parent))
            parent.remove();
    }
    /**
     * Get the purged version of the css based on the files
     * @param cssOptions css options, files or raw strings
     * @param selectors set of extracted css selectors
     */
    async getPurgedCSS(cssOptions, selectors) {
        const sources = [];
        // resolve any globs
        const processedOptions = [];
        for (const option of cssOptions) {
            if (typeof option === "string") {
                processedOptions.push(...glob.sync(option));
            }
            else {
                processedOptions.push(option);
            }
        }
        for (const option of processedOptions) {
            const cssContent = typeof option === "string"
                ? this.options.stdin
                    ? option
                    : await promises.readFile(option, "utf-8")
                : option.raw;
            const root = parse(cssContent);
            // purge unused selectors
            this.walkThroughCSS(root, selectors);
            if (this.options.fontFace)
                this.removeUnusedFontFaces();
            if (this.options.keyframes)
                this.removeUnusedKeyframes();
            const result = {
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
    isSelectorWhitelisted(selector) {
        return (CSS_WHITELIST.includes(selector) ||
            (this.options.whitelist &&
                this.options.whitelist.some((v) => v === selector)) ||
            (this.options.whitelistPatterns &&
                this.options.whitelistPatterns.some((v) => v.test(selector))));
    }
    /**
     * Check if the selector is whitelisted by the whitelistPatternsChildren option
     * @param selector selector
     */
    isSelectorWhitelistedChildren(selector) {
        return (this.options.whitelistPatternsChildren &&
            this.options.whitelistPatternsChildren.some((pattern) => pattern.test(selector)));
    }
    /**
     * Remove unused css
     * @param options PurgeCSS options
     */
    async purge(userOptions) {
        this.options =
            typeof userOptions !== "object"
                ? await setOptions(userOptions)
                : {
                    ...defaultOptions,
                    ...userOptions
                };
        const { content, css, extractors } = this.options;
        const fileFormatContents = content.filter(o => typeof o === "string");
        const rawFormatContents = content.filter(o => typeof o === "object");
        const cssFileSelectors = await this.extractSelectorsFromFiles(fileFormatContents, extractors);
        const cssRawSelectors = this.extractSelectorsFromString(rawFormatContents, extractors);
        return this.getPurgedCSS(css, mergeExtractorSelectors(cssFileSelectors, cssRawSelectors));
    }
    /**
     * Remove unused font-faces
     */
    removeUnusedFontFaces() {
        for (const { name, node } of this.atRules.fontFace) {
            if (!this.usedFontFaces.has(name)) {
                node.remove();
            }
        }
    }
    /**
     * Remove unused keyframes
     */
    removeUnusedKeyframes() {
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
    shouldKeepSelector(selector, selectorsFromExtractor) {
        // ignore the selector if it is inside a :not pseudo class.
        if (isInPseudoClassNot(selector))
            return true;
        let isPresent = false;
        for (const nodeSelector of selector.nodes) {
            // if the selector is whitelisted with children
            // returns true to keep all children selectors
            if (nodeSelector.value &&
                this.isSelectorWhitelistedChildren(nodeSelector.value)) {
                return true;
            }
            // The selector is found in the internal and user-defined whitelist
            if (nodeSelector.value &&
                (CSS_WHITELIST.includes(nodeSelector.value) ||
                    this.isSelectorWhitelisted(nodeSelector.value))) {
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
            }
            // selector is not in whitelist children or in whitelist
            // and it has not been found  as an attribute/class/identifier/tag
            if (!isPresent)
                return false;
        }
        return isPresent;
    }
    /**
     * Walk through the CSS AST and remove unused CSS
     * @param root root node of the postcss AST
     * @param selectors selectors used in content files
     */
    walkThroughCSS(root, selectors) {
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
                }
                else if (isIgnoreAnnotation(node, "end")) {
                    this.ignore = false;
                    // remove ignore annotation
                    node.remove();
                }
            }
        });
    }
}

export default PurgeCSS;
export { defaultOptions, mergeExtractorSelectors, setOptions };
