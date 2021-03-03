import {
  UserDefinedSafelist,
  StringRegExpArray,
} from "../../../purgecss/src/types/index";

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

export interface UserDefinedOptions {
  content?: Array<string | RawContent>;
  contentFunction?: (sourceFile: string) => Array<string | RawContent>;
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
  skippedContentGlobs?: Array<string>;
}
