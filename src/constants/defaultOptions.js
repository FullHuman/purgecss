// @flow

import DefaultExtractor from '../Extractors/DefaultExtractor'

const defaultOptions: Options = {
    css: [],
    content: [],
    defaultExtractor: DefaultExtractor,
    extractors: [],
    whitelist: [],
    output: undefined,
    stdout: false,
    keyframes: false,
    fontFace: false,
    rejected: false
}

export default defaultOptions
