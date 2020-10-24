import {
  UserDefinedSafelist,
  StringRegExpArray,
} from "../../../purgecss/src/types/index";

import postCSS7 from "postcss7";
import * as postCSS8 from "postcss";

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
}

export type PostCSSv7 = typeof postCSS7;
export type PostCSSv8 = typeof postCSS8.default;

export type PostCSSVersions = PostCSSv8 | PostCSSv7;
