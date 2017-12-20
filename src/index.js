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
    ERROR_INFO_TYPE,
    ERROR_REJECTED_TYPE,
    ERROR_WHITELIST_PATTERNS_TYPE,
    IGNORE_ANNOTATION
} from './constants/constants'
import CSS_WHITELIST from './constants/cssWhitelist'
import SELECTOR_STANDARD_TYPES from './constants/selectorTypes'

import DefaultExtractor from './Extractors/DefaultExtractor'
import LegacyExtractor from './Extractors/LegacyExtractor'

class Purgecss {
    options: Options
    root: Object

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
        if (options.info && typeof options.info !== 'boolean') throw new TypeError(ERROR_INFO_TYPE)
        if (options.rejected && typeof options.rejected !== 'boolean')
            throw new TypeError(ERROR_REJECTED_TYPE)
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

        for (let option of cssOptions) {
            let file = null
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

            sources.push({
                file,
                css: this.root.toString()
            })
        }

        return sources
    }

    /**
     * Remove Keyframes that are never used
     */
    removeUnusedKeyframes() {
        const usedAnimations = new Set()

        // list all used animations
        this.root.walkDecls(/animation/, decl => {
            for (const word of decl.value.split(' ')) {
                usedAnimations.add(word)
            }
        })

        // remove unused keyframes
        this.root.walkAtRules(/(keyframes)$/, rule => {
            const keyframeUsed = usedAnimations.has(rule.params)

            if (!keyframeUsed) {
                rule.remove()
            }
        })
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
        if (!extractors.length) {
            if (this.options.legacy === true) return LegacyExtractor
            return DefaultExtractor
        }
        const extractorObj: any = extractors.find(extractor =>
            extractor.extensions.find(ext => filename.endsWith(ext))
        )
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
        this.root.walkRules(node => {
            const annotation = node.prev()
            if (this.isIgnoreAnnotation(annotation)) return
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
                                typeof value !== 'undefined'
                            ) {
                                selectorsInRule.push(value)
                            } else if (
                                type === 'tag' &&
                                !/[+]|(even)|(odd)|^from$|^to$|^\d/.test(value)
                            ) {
                                // test if we do not have a pseudo class parameter (e.g. 2n in :nth-child(2n))
                                selectorsInRule.push(value)
                            }
                        }

                        let keepSelector = this.shouldKeepSelector(selectors, selectorsInRule)

                        if (!keepSelector) {
                            selector.remove()
                        }
                    }
                })
            }).processSync(node.selector)

            const parent = node.parent
            // Remove empty rules
            if (!node.selector) node.remove()
            if (this.isRuleEmpty(parent)) parent.remove()
        })
    }

    /**
     * Check if the node is a css comment to ignore the selector rule
     * @param {object} node Node of postcss abstract syntax tree
     */
    isIgnoreAnnotation(node: Object): boolean {
        if (node && node.type === 'comment') {
            return node.text.includes(IGNORE_ANNOTATION)
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
            // legacy
            if (this.options.legacy) {
                const sels = selector.split(/[^a-z]/g)
                let keepSelector = false
                for (let sel of sels) {
                    if (!sel) continue
                    if (!selectorsInContent.has(sel)) break
                    keepSelector = true
                }
                if (keepSelector) return true
                if (
                    selectorsInContent.has(selector) ||
                    CSS_WHITELIST.includes(selector) ||
                    this.isSelectorWhitelisted(selector)
                )
                    return true
            } else {
                // non legacy extractors
                // pseudo class
                const unescapedSelector = selector.replace(/\\/g, '')
                if (unescapedSelector.startsWith(':')) continue
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
        }
        return this.options.legacy ? false : true
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
}

export default Purgecss
