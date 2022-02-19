import {
  StringRegExpArray,
  UserDefinedSafelist,
} from "purgecss";

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

export type OutputFunction = (css: string, styles: string[]) => void;

export interface UserDefinedOptions {
  content: Array<string | RawContent>;
  contentFunction?: (sourceFile: string) => Array<string | RawContent>;
  defaultExtractor?: ExtractorFunction;
  extractors?: Array<Extractors>;
  fontFace?: boolean;
  keyframes?: boolean;
  output?: string | OutputFunction | boolean;
  rejected?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  safelist?: UserDefinedSafelist;
  blocklist?: StringRegExpArray;
  skippedContentGlobs?: Array<string>;
  dynamicAttributes?: string[];

  insert?: boolean;
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
  dest?: string;
}
