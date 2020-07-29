import postcss from "postcss";

export interface AtRules {
  fontFace: Array<{
    name: string;
    node: postcss.AtRule;
  }>;

  keyframes: postcss.AtRule[];
}

export interface RawContent<T = string> {
  extension: string;
  raw: T;
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

export type ExtractorFunction<T = string> = (content: T) => ExtractorResult;

export interface Extractors {
  extensions: string[];
  extractor: ExtractorFunction;
}

export type IgnoreType = "end" | "start" | "next";

export type StringRegExpArray = Array<RegExp | string>;

export type ComplexSafelist = {
  standard?: StringRegExpArray;
  deep?: RegExp[];
  greedy?: RegExp[];
  variables?: StringRegExpArray;
  keyframes?: StringRegExpArray;
};

export type UserDefinedSafelist = StringRegExpArray | ComplexSafelist;

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
  safelist?: UserDefinedSafelist;
  blocklist?: StringRegExpArray;
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
  safelist: Required<ComplexSafelist>;
  blocklist: StringRegExpArray;
}

export interface ResultPurge {
  css: string;
  file?: string;
  rejected?: string[];
}
