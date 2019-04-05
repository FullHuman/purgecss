// @flow

import fs from 'fs'
import path from 'path'
import glob from 'glob'
import defaultOptions from './constants/defaultOptions'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'
import {
    CONFIG_FILENAME,
    ERROR_CONFIG_FILE_LOADING,
    ERROR_MISSING_CONTENT,
    ERROR_MISSING_CSS,
    ERROR_EXTRACTER_FAILED,
    ERROR_OPTIONS_TYPE,
    ERROR_OUTPUT_TYPE,
    ERROR_EXTRACTERS_TYPE,
    ERROR_WHITELIST_TYPE,
    ERROR_STDOUT_TYPE,
    ERROR_WHITELIST_PATTERNS_TYPE,
    IGNORE_ANNOTATION_NEXT,
    IGNORE_ANNOTATION_START,
    IGNORE_ANNOTATION_END
} from './constants/constants'
import CSS_WHITELIST from './constants/cssWhitelist'
import SELECTOR_STANDARD_TYPES from './constants/selectorTypes'

import DefaultExtractor from './Extractors/DefaultExtractor'

class Purgecss {
    options: Options
    root: Object
    atRules: AtRules = {
        keyframes: [],
        fontFace: []
    }
    usedAnimations: Set<string> = new Set()
    usedFontFaces: Set<string> = new Set()
    selectorsRemoved: Set<string> = new Set()
    ignore: boolean = false

    constructor(options: Options | string) {
        if (typeof options === 'string' || typeof options === 'undefined')
            options = this.loadConfigFile(options)
        this.checkOptions(options)
        this.options = Object.assign(defaultOptions, options)
    }

    /**
     * Load the configuration file from the path
     * @param {string} configFile Path of the config file
     */
    loadConfigFile(configFile: string): Options {
        const pathConfig = typeof configFile === 'undefined' ? CONFIG_FILENAME : configFile
        let options
        try {
            const t = path.resolve(process.cwd(), pathConfig)
            options = require(t)
        } catch (e) {
            throw new Error(ERROR_CONFIG_FILE_LOADING + e.message)
        }
        return options
    }

    /**
     * Verify that the purgecss options provided are valid
     * @param {object} options Purgecss options
     */
    checkOptions(options: Options) {
        if (typeof options !== 'object') throw new TypeError(ERROR_OPTIONS_TYPE)
        if (!options.content || !options.content.length) throw new Error(ERROR_MISSING_CONTENT)
        if (!options.css || !options.css.length) throw new Error(ERROR_MISSING_CSS)
        if (options.output && typeof options.output !== 'string')
            throw new TypeError(ERROR_OUTPUT_TYPE)
        if (options.extractors && !Array.isArray(options.extractors))
            throw new TypeError(ERROR_EXTRACTERS_TYPE)
        if (options.whitelist && !Array.isArray(options.whitelist))
            throw new TypeError(ERROR_WHITELIST_TYPE)
        if (options.stdout && typeof options.stdout !== 'boolean')
            throw new TypeError(ERROR_STDOUT_TYPE)
        if (options.whitelistPatterns && !Array.isArray(options.whitelistPatterns))
            throw new TypeError(ERROR_WHITELIST_PATTERNS_TYPE)
    }

    /**
     * Main function that purge the css file
     */
    purge(): Array<ResultPurge> {
        // Get selectors from content files
        const { content, extractors, css } = this.options

        const fileFormatContents = ((content.filter(o => typeof o === 'string'): Array<any>): Array<
            string
        >)
        const rawFormatContents = ((content.filter(o => typeof o === 'object'): Array<any>): Array<
            RawContent
        >)

        const cssFileSelectors = this.extractFileSelector(fileFormatContents, extractors)
        const cssRawSelectors = this.extractRawSelector(rawFormatContents, extractors)

        // Get css selectors and remove unused ones
        return this.getCssContents(css, new Set([...cssFileSelectors, ...cssRawSelectors]))
    }

    /**
     * Get the content of the css files, or return the raw content
     * @param {array} cssOptions  Array of css options, files and raw
     * @param {Set} cssSelectors Set of all extracted css selectors
     */
    getCssContents(cssOptions: Array<any>, cssSelectors: Set<string>): Array<ResultPurge> {
        const sources = []

        // resolve any globs and flatten again
        cssOptions = cssOptions.map(option => {
            return typeof option === 'string' ? glob.sync(option) : option
        })
        cssOptions = [].concat.apply([], cssOptions)

        for (let option of cssOptions) {
            let file = null
            let rejected: ?Array<string> = null
            let cssContent = ''
            if (typeof option === 'string') {
                file = option
                cssContent = this.options.stdin ? file : fs.readFileSync(file, 'utf8')
            } else {
                cssContent = option.raw
            }

            this.root = postcss.parse(cssContent)

            // purge selectors
            this.getSelectorsCss(cssSelectors)

            // purge keyframes
            if (this.options.keyframes) this.removeUnusedKeyframes()

            // purge font face
            if (this.options.fontFace) this.removeUnusedFontFaces()

            const purgeResult = {
                file,
                css: this.root.toString(),
                rejected
            }

            if (this.options.rejected) {
                rejected = Array.from(this.selectorsRemoved)
                this.selectorsRemoved.clear()
            }

            purgeResult.rejected = rejected

            sources.push(purgeResult)
        }

        return sources
    }

    /**
     * Remove Keyframes that were never used
     */
    removeUnusedKeyframes() {
        for (const node of this.atRules.keyframes) {
            const nodeName = node.params
            const used = this.usedAnimations.has(nodeName)

            if (!used) {
                node.remove()
            }
        }
    }

    /**
     * Remove Font-Faces that were never used
     */
    removeUnusedFontFaces() {
        for (const { node, name } of this.atRules.fontFace) {
            const used = this.usedFontFaces.has(name)

            if (!used) {
                node.remove()
            }
        }
    }

    /**
     * Extract the selectors present in the passed string using a purgecss extractor
     * @param {array} content Array of content
     * @param {array} extractors Array of extractors
     */
    extractRawSelector(content: Array<RawContent>, extractors?: Array<ExtractorsObj>): Set<string> {
        let selectors = new Set()
        for (const { raw, extension } of content) {
            const extractor = this.getFileExtractor(`.${extension}`, extractors)
            selectors = new Set([...selectors, ...this.extractSelectors(raw, extractor)])
        }
        return selectors
    }

    /**
     * Extract the selectors present in the files using a purgecss extractor
     * @param {array} files Array of files path or glob pattern
     * @param {array} extractors Array of extractors
     */
    extractFileSelector(files: Array<string>, extractors?: Array<ExtractorsObj>): Set<string> {
        let selectors = new Set()
        for (let globfile of files) {
            let filesnames = []
            if (fs.existsSync(globfile)) {
                filesnames.push(globfile)
            } else {
                filesnames = glob.sync(globfile)
            }
            for (let file of filesnames) {
                const content = fs.readFileSync(file, 'utf8')
                const extractor = this.getFileExtractor(file, extractors)
                selectors = new Set([...selectors, ...this.extractSelectors(content, extractor)])
            }
        }
        return selectors
    }

    /**
     * Get the extractor corresponding to the extension file
     * @param {string} filename Name of the file
     * @param {array} extractors Array of extractors definition objects
     */
    getFileExtractor(filename: string, extractors: Array<ExtractorsObj> = []) {
        if (!extractors.length) return DefaultExtractor

        const extractorObj = extractors.find(extractor =>
            extractor.extensions.find(ext => filename.endsWith(ext))
        ) || DefaultExtractor
        return extractorObj.extractor
    }

    /**
     * Use the extract function of the extractor to get the list of selectors
     * @param {string} content Content (e.g: html file)
     * @param {object} extractor Purgecss extractor use to extract the selector
     */
    extractSelectors(content: string, extractor: Object): Set<string> {
        let selectors = new Set()
        const arraySelector = extractor.extract(content)
        if (arraySelector === null) {
            throw new Error(ERROR_EXTRACTER_FAILED)
        }
        arraySelector.forEach(selector => {
            selectors.add(selector)
        })
        // Remove empty string
        selectors.delete('')
        return selectors
    }

    /**
     * Use postcss to walk through the css ast and remove unused css
     * @param {*} selectors selectors used in content files
     */
    getSelectorsCss(selectors: Set<string>) {
        this.root.walk(node => {
            if (node.type === 'rule') {
                return this.evaluateRule(node, selectors)
            }
            if (node.type === 'atrule') {
                return this.evaluateAtRule(node)
            }
            if (node.type === 'comment') {
                if (this.isIgnoreAnnotation(node, 'start')) this.ignore = true
                else if (this.isIgnoreAnnotation(node, 'end')) this.ignore = false
            }
        })
    }

    /**
     * Evaluate css selector and decide if it should be removed or not
     * @param {AST} node postcss ast node
     * @param {Set} selectors selectors used in content files
     */
    evaluateRule(node: Object, selectors: Set<string>) {
        const annotation = node.prev()
        if (this.isIgnoreAnnotation(annotation, 'next') || this.ignore === true) return

        let keepSelector = true
        node.selector = selectorParser(selectorsParsed => {
            selectorsParsed.walk(selector => {
                const selectorsInRule = []
                if (selector.type === 'selector') {
                    // if inside :not pseudo class, ignore
                    if (
                        selector.parent &&
                        selector.parent.value === ':not' &&
                        selector.parent.type === 'pseudo'
                    ) {
                        return
                    }
                    for (const { type, value } of selector.nodes) {
                        if (
                            SELECTOR_STANDARD_TYPES.includes(type) &&
                            typeof value !== 'undefined' &&
                            /^\d/g.test(value) === false
                        ) {
                            selectorsInRule.push(value)
                        } else if (
                            type === 'tag' &&
                            !/[+]|n|-|(even)|(odd)|^from$|^to$|^\d/.test(value)
                        ) {
                            // test if we do not have a pseudo class parameter (e.g. 2n in :nth-child(2n))
                            selectorsInRule.push(value)
                        }
                    }

                    keepSelector = this.shouldKeepSelector(selectors, selectorsInRule)

                    if (!keepSelector) {
                        if (this.options.rejected) this.selectorsRemoved.add(selector.toString())
                        selector.remove()
                    }
                }
            })
        }).processSync(node.selector)

        // loop declarations
        if (keepSelector) {
            for (const { prop, value } of node.nodes) {
                if (this.options.keyframes) {
                    if (prop === 'animation' || prop === 'animation-name') {
                        for (const word of value.split(/[\s,]+/)) {
                            this.usedAnimations.add(word)
                        }
                    }
                }
                if (this.options.fontFace) {
                    if (prop === 'font-family') {
                        this.usedFontFaces.add(value)
                    }
                }
            }
        }

        const parent = node.parent

        // Remove empty rules
        if (!node.selector) node.remove()
        if (this.isRuleEmpty(parent)) parent.remove()
    }

    /**
     * Evaluate at-rule and register it for future reference
     * @param {AST} node postcss ast node
     */
    evaluateAtRule(node: Object) {
        if (this.options.keyframes && node.name.endsWith('keyframes')) {
            this.atRules.keyframes.push(node)
            return
        }

        if (this.options.fontFace && node.name === 'font-face') {
            for (const { prop, value } of node.nodes) {
                if (prop === 'font-family') {
                    this.atRules.fontFace.push({
                        name: value,
                        node
                    })
                }
            }
            return
        }
    }

    /**
     * Check if the node is a css comment to ignore the selector rule
     * @param {object} node Node of postcss abstract syntax tree
     * @param {string} type Type of css comment (next, start, end)
     */
    isIgnoreAnnotation(node: Object, type: IgnoreType): boolean {
        if (node && node.type === 'comment') {
            switch (type) {
                case 'next':
                    return node.text.includes(IGNORE_ANNOTATION_NEXT)
                case 'start':
                    return node.text.includes(IGNORE_ANNOTATION_START)
                case 'end':
                    return node.text.includes(IGNORE_ANNOTATION_END)
            }
        }
        return false
    }

    /**
     * Check if the node correspond to an empty css rule
     * @param {object} node Node of postcss abstract syntax tree
     */
    isRuleEmpty(node: Object): boolean {
        if (
            (node.type === 'decl' && !node.value) ||
            ((node.type === 'rule' && !node.selector) || (node.nodes && !node.nodes.length)) ||
            (node.type === 'atrule' &&
                ((!node.nodes && !node.params) || (!node.params && !node.nodes.length)))
        ) {
            return true
        }
        return false
    }

    /**
     * Determine if the selector should be kept, based on the selectors found in the files
     * @param {Set} selectorsInContent Set of css selectors found in the content files
     * @param {Array} selectorsInRule Array of selectors
     */
    shouldKeepSelector(selectorsInContent: Set<string>, selectorsInRule: Array<string>): boolean {
        for (let selector of selectorsInRule) {
            // pseudo class
            const unescapedSelector = selector.replace(/\\/g, '')

            if (unescapedSelector.startsWith(':')) {
                continue
            }

            // If the selector is whitelisted with children keep, simply
            // returns true to keep all children selectors
            if (this.isSelectorWhitelistedChildren(unescapedSelector)) {
                return true
            }

            if (
                !(
                    selectorsInContent.has(unescapedSelector) ||
                    CSS_WHITELIST.includes(unescapedSelector) ||
                    this.isSelectorWhitelisted(unescapedSelector)
                )
            ) {
                return false
            }
        }
        return true
    }

    /**
     * Check if the selector is whitelisted by the options whitelist or whitelistPatterns
     * @param {string} selector css selector
     */
    isSelectorWhitelisted(selector: string): boolean {
        return !!(
            CSS_WHITELIST.includes(selector) ||
            (this.options.whitelist &&
                this.options.whitelist.some((v: string) => v === selector)) ||
            (this.options.whitelistPatterns &&
                this.options.whitelistPatterns.some((v: RegExp) => v.test(selector)))
        )
    }

    /**
     * Check if the selector is whitelisted by the whitelistPatternsChildren
     * options element
     *
     * @param {string} selector
     */
    isSelectorWhitelistedChildren(selector: string): boolean {
        return !!(
            this.options.whitelistPatternsChildren &&
            this.options.whitelistPatternsChildren.some((v: RegExp) => v.test(selector))
        )
    }
}

export default Purgecss
