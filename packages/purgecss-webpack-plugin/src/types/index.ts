import { ComplexSafelist, StringRegExpArray } from "purgecss";

export interface RawContent<T = string> {
  extension: string;
  raw: T;
}
export interface RawCSS {
  raw: string;
}
export type ExtractorFunction<T = string> = (content: T) => string[];
export interface Extractors {
  extensions: string[];
  extractor: ExtractorFunction;
}

export type PathFunction = () => string[];
export type SafelistFunction = () => ComplexSafelist;
export type BlocklistFunction = () => StringRegExpArray;

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
  safelist?: StringRegExpArray | ComplexSafelist | SafelistFunction;
  blocklist?: StringRegExpArray | BlocklistFunction;
  skippedContentGlobs?: Array<string>;
  dynamicAttributes?: string[];
  only?: string[];
}

export type PurgedStats = {
  [index: string]: string[];
};
