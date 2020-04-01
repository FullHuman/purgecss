export interface RawContent {
  extension: string;
  raw: string;
}
export interface RawCSS {
  raw: string;
}
type ExtractorFunction = (content: string) => string[];
export interface Extractors {
  extensions: string[];
  extractor: ExtractorFunction;
}
export interface UserDefinedOptions {
  content?: Array<string | RawContent>;
  contentFunction?: (sourceFile: string) => Array<string | RawContent>;
  css: Array<string | RawCSS>;
  defaultExtractor?: ExtractorFunction;
  extractors?: Array<Extractors>;
  fontFace?: boolean;
  keyframes?: boolean;
  output?: string;
  registerDependencies?: boolean;
  rejected?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  whitelist?: string[];
  whitelistPatterns?: Array<RegExp>;
  whitelistPatternsChildren?: Array<RegExp>;
}
