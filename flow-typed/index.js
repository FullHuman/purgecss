// @flow

type RawContent = {
  raw: string,
  extension: string
}

declare type Options = {
  content: Array<string | RawContent>,
  css: Array<string | RawContent>,
  extractors?: Array<ExtractorsObj>,
  whitelist?: Array<string>,
  whitelistPatterns?: Array<RegExp>,
  output?: string,
  stdout?: boolean,
  stdin?: boolean,
  info?: boolean,
  rejected?: boolean,
  legacy?: boolean,
  keyframes?: boolean,
  fontFace?: boolean
}

declare type ExtractorsObj = {
  extractor: Object,
  extensions: Array<string>
}

declare type ResultPurge = {
  file: ?string,
  css: string
}

declare type AtRules = {
  keyframes: Array<Object>,
  fontFace: Array<Object>
}
