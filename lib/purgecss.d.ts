// Type definitions for Purgecss 0.2.0
// Project: Purgecss
// Definitions by: Ffloriel https://github.com/Ffloriel

export = Purgecss;

declare class Purgecss {

    options: Purgecss.Options

    constructor(options: Purgecss.Options | string)
    loadConfigFile(configFile: string): Purgecss.Options
    checkOptions(options: Purgecss.Options)
    purge(): Array<Purgecss.FileResult>
    extractFileSelector(files: Array<string>, extractors?: Array<Purgecss.ExtractorsObj>): Set<string>
    getFileExtractor(filename: string, extractors: Array<Purgecss.ExtractorsObj>): Object
    extractorSelectors(content: string, extractor: Object): Set<string>
    getSelectorsCss(css: string, selectors: Set<string>): string
    isIgnoreAnnotation(node: Object): boolean
    isRuleEmpty(node:Object): boolean
    shouldKeepSelector(selectorsInContent: Set<string>, selectorsInRule: Array<string>)

}

declare namespace Purgecss {

    export interface Options {
        content: Array<string>,
        css: Array<string>,
        extractors?: Array<ExtractorsObj>,
        whitelist?: Array<string>,
        output?: string,
        stdout?: boolean,
        info?: boolean,
        rejected?: boolean,
        legacy?: boolean
    }

    export interface ExtractorsObj {
        extractor: Object,
        extensions: Array<string>
    }

    export interface FileResult {
        file: string,
        css: string
    }

    export interface MyClassMethodOptions {
        width?: number;
        height?: number;
    }
}