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

interface GenericFilter<T = string> {
  attributes: {
    names: T[];
    values: T[];
  };
  classes: T[];
  ids: T[];
  tags: T[];
  undetermined: T[];
}

export type ExtractorResultDetailed = GenericFilter;

export type WhiteListDetailed<T> = Omit<GenericFilter<T>, "attributes"> & {
  attributes: {
    names?: T[];
    values?: T[];
  };
};

export type ExtractorResult = ExtractorResultDetailed | string[];

export type ExtractorFunction = (content: string) => ExtractorResult;

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
  fontFace?: boolean;
  keyframes?: boolean;
  output?: string;
  rejected?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  whitelist?: string[] | Partial<WhiteListDetailed<string>>;
  whitelistPatterns?: Array<RegExp> | Partial<WhiteListDetailed<RegExp>>;
  whitelistPatternsChildren?:
    | Array<RegExp>
    | Partial<WhiteListDetailed<RegExp>>;
}

export interface Options {
  content: Array<string | RawContent>;
  css: Array<string | RawCSS>;
  defaultExtractor: ExtractorFunction;
  extractors: Array<Extractors>;
  fontFace: boolean;
  keyframes: boolean;
  output?: string;
  rejected: boolean;
  stdin: boolean;
  stdout: boolean;
  variables: boolean;
  whitelist: WhiteListDetailed<string>;
  whitelistPatterns: WhiteListDetailed<RegExp>;
  whitelistPatternsChildren: WhiteListDetailed<RegExp>;
}

export interface ResultPurge {
  css: string;
  file?: string;
  rejected?: string[];
}
