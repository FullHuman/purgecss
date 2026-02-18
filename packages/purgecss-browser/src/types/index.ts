import * as postcss from "postcss";

/**
 * @public
 */
export type PostCSSRoot = postcss.Root;

/**
 * @internal
 */
export interface AtRules {
  fontFace: Array<{
    name: string;
    node: postcss.AtRule;
  }>;

  keyframes: postcss.AtRule[];
}

/**
 * Raw content passed directly as a string (no file-system access).
 *
 * @public
 */
export interface RawContent<T = string> {
  extension: string;
  raw: T;
}

/**
 * Raw CSS passed directly as a string (no file-system access).
 *
 * @public
 */
export interface RawCSS {
  raw: string;
  name?: string;
}

/**
 * @public
 */
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

/**
 * @public
 */
export type ExtractorResult = ExtractorResultDetailed | string[];

/**
 * @public
 */
export type ExtractorFunction<T = string> = (content: T) => ExtractorResult;

/**
 * @public
 */
export interface Extractors {
  extensions: string[];
  extractor: ExtractorFunction;
}

/**
 * @internal
 */
export type IgnoreType = "end" | "start" | "next";

/**
 * @public
 */
export type StringRegExpArray = Array<RegExp | string>;

/**
 * @public
 */
export type ComplexSafelist = {
  standard?: StringRegExpArray;
  /**
   * You can safelist selectors and their children based on a regular
   * expression with `safelist.deep`
   *
   * @example
   *
   * ```ts
   * const purgecss = await new PurgeCSS().purge({
   *   content: [],
   *   css: [],
   *   safelist: {
   *     deep: [/red$/]
   *   }
   * })
   * ```
   *
   * In this example, selectors such as `.bg-red .child-of-bg` will be left
   * in the final CSS, even if `child-of-bg` is not found.
   *
   */
  deep?: RegExp[];
  greedy?: RegExp[];
  variables?: StringRegExpArray;
  keyframes?: StringRegExpArray;
};

/**
 * @public
 */
export type UserDefinedSafelist = StringRegExpArray | ComplexSafelist;

/**
 * Options for the browser-compatible PurgeCSS.
 *
 * Unlike the Node.js version, all `content` and `css` entries must be passed
 * as raw strings — file paths and glob patterns are **not** supported.
 *
 * @public
 */
export interface UserDefinedOptions {
  /**
   * Raw HTML/JS/Vue/… content to analyse for used selectors.
   * Each entry must be an object `{ raw: string; extension: string }`.
   */
  content: RawContent[];
  /**
   * Raw CSS to purge.
   * Each entry must be an object `{ raw: string; name?: string }`.
   */
  css: RawCSS[];
  /** {@inheritDoc purgecss-browser#Options.defaultExtractor} */
  defaultExtractor?: ExtractorFunction;
  /** {@inheritDoc purgecss-browser#Options.extractors} */
  extractors?: Array<Extractors>;
  /** {@inheritDoc purgecss-browser#Options.fontFace} */
  fontFace?: boolean;
  /** {@inheritDoc purgecss-browser#Options.keyframes} */
  keyframes?: boolean;
  /** {@inheritDoc purgecss-browser#Options.rejected} */
  rejected?: boolean;
  /** {@inheritDoc purgecss-browser#Options.rejectedCss} */
  rejectedCss?: boolean;
  /** {@inheritDoc purgecss-browser#Options.variables} */
  variables?: boolean;
  /** {@inheritDoc purgecss-browser#Options.safelist} */
  safelist?: UserDefinedSafelist;
  /** {@inheritDoc purgecss-browser#Options.blocklist} */
  blocklist?: StringRegExpArray;
  /** {@inheritDoc purgecss-browser#Options.dynamicAttributes} */
  dynamicAttributes?: string[];
}

/**
 * Resolved options used internally by PurgeCSS (browser build).
 *
 * @public
 */
export interface Options {
  content: RawContent[];
  css: RawCSS[];
  defaultExtractor: ExtractorFunction;
  extractors: Array<Extractors>;
  fontFace: boolean;
  keyframes: boolean;
  rejected: boolean;
  rejectedCss: boolean;
  variables: boolean;
  safelist: Required<ComplexSafelist>;
  blocklist: StringRegExpArray;
  dynamicAttributes: string[];
}

/**
 * @public
 */
export interface ResultPurge {
  css: string;
  /**
   * Inline source map string, if source map generation was enabled.
   */
  sourceMap?: string;
  rejectedCss?: string;
  file?: string;
  rejected?: string[];
}
