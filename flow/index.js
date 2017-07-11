// @flow

export type Options = {
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

export type ExtractorsObj = {
    extractor: Object,
    extensions: Array<string>
}
