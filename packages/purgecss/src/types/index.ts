import * as postcss from "postcss";

export type PostCSSRoot = postcss.Root;
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
  name?: string;
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
  rejectedCss?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  safelist?: UserDefinedSafelist;
  blocklist?: StringRegExpArray;
  skippedContentGlobs?: Array<string>;
  dynamicAttributes?: string[];
}

/**
 * Options used by PurgeCSS to remove unused CSS
 * Those options are used internally
 * @see {@link UserDefinedOptions} for the options defined by the user
 */
export interface Options {
  /**
   * You can specify content that should be analyzed by PurgeCSS with an
   * array of filenames or globs. The files can be HTML, Pug, Blade, etc.
   */
  content: Array<string | RawContent>;
  /**
   * Similar to content, you can specify css that should be processed by
   * PurgeCSS with an array of filenames or globs
   */
  css: Array<string | RawCSS>;
  defaultExtractor: ExtractorFunction;
  extractors: Array<Extractors>;
  fontFace: boolean;
  keyframes: boolean;
  output?: string;
  rejected: boolean;
  rejectedCss: boolean;
  stdin: boolean;
  stdout: boolean;
  variables: boolean;
  /**
   * You can indicate which selectors are safe to leave in the final CSS.
   * This can be accomplished with the option safelist.
   */
  safelist: Required<ComplexSafelist>;
  /**
   * Blocklist will block the CSS selectors from appearing in the final
   * output CSS. The selectors will be removed even when they are seen
   * as used by PurgeCSS.
   */
  blocklist: StringRegExpArray;
  /**
   * If you provide globs for the content parameter, you can use this option
   * to exclude certain files or folders that would otherwise be scanned.
   * Pass an array of globs matching items that should be excluded.
   * (Note: this option has no effect if content is not globs.)
   */
  skippedContentGlobs: Array<string>;
  /**
   * Option to add custom CSS attribute selectors like "aria-selected",
   * "data-selected", ...etc.
   */
  dynamicAttributes: string[];
}

export interface ResultPurge {
  css: string;
  rejectedCss?: string;
  file?: string;
  rejected?: string[];
}
