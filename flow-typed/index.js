// @flow

declare type Options = {
  content: Array<string>,
  css: Array<string>,
  extractors?: Array<ExtractorsObj>,
  whitelist?: Array<string>,
  whitelistPatterns?: Array<RegExp>,
  output?: string,
  stdout?: boolean,
  stdin?: boolean,
  info?: boolean,
  rejected?: boolean,
  legacy?: boolean
}

declare type ExtractorsObj = {
  extractor: Object,
  extensions: Array<string>
}
