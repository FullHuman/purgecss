export interface RawContent<T = string> {
  extension: string;
  raw: T;
}
export interface RawCSS {
  raw: string;
}
type ExtractorFunction<T = string> = (content: T) => string[];
export interface Extractors {
  extensions: string[];
  extractor: ExtractorFunction;
}

type PathFunction = () => string[];
type WhitelistFunction = () => string[];
type WhitelistPatternsFunction = () => Array<RegExp>;

export interface UserDefinedOptions {
  paths: string[] | PathFunction;
  defaultExtractor?: ExtractorFunction;
  extractors?: Array<Extractors>;
  fontFace?: boolean;
  keyframes?: boolean;
  moduleExtensions?: string[];
  output?: string;
  rejected?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  verbose?: boolean;
  whitelist?: string[] | WhitelistFunction;
  whitelistPatterns?: Array<RegExp> | WhitelistPatternsFunction;
  whitelistPatternsChildren?: Array<RegExp> | WhitelistPatternsFunction;
  whitelistPatternsGreedy?: Array<RegExp> | WhitelistPatternsFunction;
  only?: string[];
}

export type PurgedStats = {
  [index: string]: string[];
};

export interface PurgeAsset {
  asset: {
    source: () => string;
  };
  name: string;
}

export interface File {
  resource?: string;
}
