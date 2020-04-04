import postcss from "postcss";

export interface AtRules {
  fontFace: Array<{
    name: string;
    node: postcss.AtRule;
  }>;

  keyframes: postcss.AtRule[];
}

export interface RawContent {
  extension: string;
  raw: string;
}

export interface RawCSS {
  raw: string;
}

export interface ExtractorResultDetailed {
  attributes: {
    names: string[];
    values: string[];
  };
  classes: string[];
  ids: string[];
  tags: string[];
  undetermined: string[];
}

export type ExtractorResult = ExtractorResultDetailed | string[];

export type ExtractorFunction = (content: string) => ExtractorResult;

export type ComparatorFunction = (node: string, selector: string) => boolean;

export interface Extractors {
  extensions: string[];
  extractor: ExtractorFunction;
}

export type IgnoreType = "end" | "start" | "next";

export interface UserDefinedOptions {
  content: Array<string | RawContent>;
  css: Array<string | RawCSS>;
  defaultExtractor?: ExtractorFunction;
  extractors?: Array<Extractors>;
  customClassComparator?: ComparatorFunction;
  fontFace?: boolean;
  keyframes?: boolean;
  output?: string;
  rejected?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  whitelist?: string[];
  whitelistPatterns?: Array<RegExp>;
  whitelistPatternsChildren?: Array<RegExp>;
}

export interface Options {
  content: Array<string | RawContent>;
  css: Array<string | RawCSS>;
  defaultExtractor: ExtractorFunction;
  extractors: Array<Extractors>;
  customClassComparator: ComparatorFunction;
  fontFace: boolean;
  keyframes: boolean;
  output?: string;
  rejected: boolean;
  stdin: boolean;
  stdout: boolean;
  variables: boolean;
  whitelist: string[];
  whitelistPatterns: Array<RegExp>;
  whitelistPatternsChildren: Array<RegExp>;
}

export interface ResultPurge {
  css: string;
  file?: string;
  rejected?: string[];
}
