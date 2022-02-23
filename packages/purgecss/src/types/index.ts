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
 * @public
 */
export interface RawContent<T = string> {
  extension: string;
  raw: T;
}

/**
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
 * Options used by PurgeCSS to remove unused CSS
 *
 * @public
 */
export interface UserDefinedOptions {
  /** {@inheritDoc Options.content} */
  content: Array<string | RawContent>;
  /** {@inheritDoc Options.css} */
  css: Array<string | RawCSS>;
  /** {@inheritDoc Options.defaultExtractor} */
  defaultExtractor?: ExtractorFunction;
  /** {@inheritDoc Options.extractors} */
  extractors?: Array<Extractors>;
  /** {@inheritDoc Options.fontFace} */
  fontFace?: boolean;
  /** {@inheritDoc Options.keyframes} */
  keyframes?: boolean;
  /** {@inheritDoc Options.output} */
  output?: string;
  /** {@inheritDoc Options.rejected} */
  rejected?: boolean;
  /** {@inheritDoc Options.rejectedCss} */
  rejectedCss?: boolean;
  /** {@inheritDoc Options.sourceMap } */
  sourceMap?: boolean | (postcss.SourceMapOptions & { to?: string });
  /** {@inheritDoc Options.stdin} */
  stdin?: boolean;
  /** {@inheritDoc Options.stdout} */
  stdout?: boolean;
  /** {@inheritDoc Options.variables} */
  variables?: boolean;
  /** {@inheritDoc Options.safelist} */
  safelist?: UserDefinedSafelist;
  /** {@inheritDoc Options.blocklist} */
  blocklist?: StringRegExpArray;
  /** {@inheritDoc Options.skippedContentGlobs} */
  skippedContentGlobs?: Array<string>;
  /** {@inheritDoc Options.dynamicAttributes} */
  dynamicAttributes?: string[];
}

/**
 * Options used by PurgeCSS to remove unused CSS
 * Those options are used internally
 * @see {@link UserDefinedOptions} for the options defined by the user
 *
 * @public
 */
export interface Options {
  /**
   * You can specify content that should be analyzed by PurgeCSS with an
   * array of filenames or globs. The files can be HTML, Pug, Blade, etc.
   *
   * @example
   *
   * ```ts
   * await new PurgeCSS().purge({
   *   content: ['index.html', '*.js', '*.html', '*.vue'],
   *   css: ['css/app.css']
   * })
   * ```
   *
   * @example
   * PurgeCSS also works with raw content. To do this, you need to pass an
   * object with the `raw` property instead of a filename. To work properly
   * with custom extractors you need to pass the `extension` property along
   * with the raw content.
   *
   * ```ts
   * await new PurgeCSS().purge({
   *   content: [
   *     {
   *       raw: '<html><body><div class="app"></div></body></html>',
   *       extension: 'html'
   *     },
   *     '*.js',
   *     '*.html',
   *     '*.vue'
   *   ],
   *   css: [
   *     {
   *       raw: 'body { margin: 0 }'
   *     },
   *     'css/app.css'
   *   ]
   * })
   * ```
   */
  content: Array<string | RawContent>;
  /**
   * Similar to content, you can specify css that should be processed by
   * PurgeCSS with an array of filenames or globs
   */
  css: Array<string | RawCSS>;
  defaultExtractor: ExtractorFunction;
  extractors: Array<Extractors>;
  /**
   * If there are any unused \@font-face rules in your css, you can remove
   * them by setting the `fontFace` option to `true`.
   *
   * @defaultValue `false`
   *
   * @example
   * ```ts
   * await new PurgeCSS().purge({
   *   content: ['index.html', '*.js', '*.html', '*.vue'],
   *   css: ['css/app.css'],
   *   fontFace: true
   * })
   * ```
   */
  fontFace: boolean;
  keyframes: boolean;
  output?: string;
  rejected: boolean;
  rejectedCss: boolean;
  /** {@inheritDoc postcss#SourceMapOptions} */
  sourceMap: boolean | (postcss.SourceMapOptions & { to?: string });
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

/**
 * @public
 */
export interface ResultPurge {
  css: string;
  /**
   * sourceMap property will be empty if
   * {@link UserDefinedOptions.sourceMap} inline is not set to false, as the
   * source map will be contained within the text of ResultPurge.css
   */
  sourceMap?: string;
  rejectedCss?: string;
  file?: string;
  rejected?: string[];
}
