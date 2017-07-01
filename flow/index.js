// @flow

export type Options = {
    content: Array<string>,
    css: Array<string>,
    extracters?: Array<ExtractersObj>,
    whitelist?: Array<string>,
    output?: string,
    stdout?: boolean,
    info?: boolean,
    rejected?: boolean,
    legacy?: boolean
}

export type ExtractersObj = {
    extracter: Object,
    extensions: Array<string>
}
