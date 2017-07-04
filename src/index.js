// @flow
import type { ExtractersObj, Options } from './../flow/index.js'

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
    IGNORE_ANNOTATION
} from './constants/constants'
import CSS_WHITELIST from './constants/cssWhitelist'
import SELECTOR_STANDARD_TYPES from './constants/selectorTypes'

import DefaultExtracter from './Extracters/DefaultExtracter'

class Purgecss {
    options: Options
    selectors: Set<string>

    constructor(options: Options | string) {
        if (typeof options === 'string' || typeof options === 'undefined')
            options = this.loadConfigFile(options)
        this.checkOptions(options)
        this.options = Object.assign(defaultOptions, options)
        this.selectors = new Set()
    }

    loadConfigFile(configFile?: string) {
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

    checkOptions(options: Options) {
        if (typeof options !== 'object') throw new TypeError(ERROR_OPTIONS_TYPE)
        if (!options.content || !options.content.length) throw new Error(ERROR_MISSING_CONTENT)
        if (!options.css || !options.css.length) throw new Error(ERROR_MISSING_CSS)
        if (options.output && typeof options.output !== 'string')
            throw new TypeError(ERROR_OUTPUT_TYPE)
        if (options.extracters && !Array.isArray(options.extracters))
            throw new TypeError(ERROR_EXTRACTERS_TYPE)
        if (options.whitelist && !Array.isArray(options.whitelist))
            throw new TypeError(ERROR_WHITELIST_TYPE)
        if (options.stdout && typeof options.stdout !== 'boolean')
            throw new TypeError(ERROR_STDOUT_TYPE)
        if (options.info && typeof options.info !== 'boolean') throw new TypeError(ERROR_INFO_TYPE)
        if (options.rejected && typeof options.rejected !== 'boolean')
            throw new TypeError(ERROR_REJECTED_TYPE)
    }

    purge() {
        // Get selectors from content files
        let cssClasses = this.extractFileSelector(this.options.content, this.options.extracters)
        // Get css selectors and remove unused ones
        let files = []
        for (let file of this.options.css) {
            const cssContent = fs.readFileSync(file, 'utf8')
            files.push({
                file,
                css: this.getSelectorsCss(cssContent, cssClasses)
            })
        }
        return files
    }

    extractFileSelector(files: Array<string>, extracters?: Array<ExtractersObj>): Set<string> {
        let selectors = new Set()
        for (let globfile of files) {
            const filesnames = glob.sync(globfile)
            for (let file of filesnames) {
                const content = fs.readFileSync(file, 'utf8')
                const extracter = this.getFileExtracter(file, extracters)
                selectors = new Set(...selectors, this.extractSelectors(content, extracter))
            }
        }

        return selectors
    }

    /**
     * Get the extracter corresponding to the extension file
     * @param {string} filename Name of the file
     * @param {array} extracters Array of extracters definition objects
     */
    getFileExtracter(filename: string, extracters: Array<ExtractersObj> = []) {
        if (!extracters.length) return DefaultExtracter
        const extracterObj: any = extracters.find(extracter =>
            extracter.extensions.find(ext => filename.endsWith(ext))
        )
        return extracterObj.extracter
    }

    extractSelectors(content: string, extracter: Object): Set<string> {
        let selectors = new Set()
        const arraySelector = extracter.extract(content)
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

    getSelectorsCss(css: string, selectors: Set<string>) {
        const root = postcss.parse(css)
        root.walkRules(node => {
            const annotation = node.prev()
            if (this.isIgnoreAnnotation(annotation)) return
            const nodeType = node.type
            node.selector = selectorParser(selectorsParsed => {
                selectorsParsed.walk(selector => {
                    let selectorsInRule = []
                    if (selector.type === 'selector') {
                        for (let nodeSelector of selector.nodes) {
                            const { type, value } = nodeSelector
                            if (SELECTOR_STANDARD_TYPES.includes(type)) {
                                selectorsInRule.push(value)
                            } else if (type === 'attribute') {
                                selectorsInRule.push(nodeSelector.raws.unquoted)
                            }
                        }

                        let keepSelector = this.shouldKeepSelector(selectors, selectorsInRule)
                        if (!keepSelector) {
                            selector.remove()
                        }
                    }
                })
            }).process(node.selector).result

            const parent = node.parent
            // // Remove empty rules
            if (!node.selector) node.remove()
            if (this.isRuleEmpty(parent)) parent.remove()
        })
        return root.toString()
    }

    isIgnoreAnnotation(node: Object) {
        if (node && node.type === 'comment') {
            return node.text.includes(IGNORE_ANNOTATION)
        }
        return false
    }

    isRuleEmpty(node: Object) {
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

    shouldKeepSelector(selectorsInContent: Set<string>, selectorsInRule: Array<string>) {
        for (let selector of selectorsInRule) {
            if (this.options.legacy) {
                const sels = selector.split(/[^a-z]/g)
                let keepSelector = false
                for (let sel of sels) {
                    if (!sel) continue
                    if (!selectorsInContent.has(sel)) break
                    keepSelector = true
                }
                if (keepSelector) return true
            }
            if (selectorsInContent.has(selector) || CSS_WHITELIST.includes(selector)) return true
        }
        return false
    }
}

export default Purgecss
