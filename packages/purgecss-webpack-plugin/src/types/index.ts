import type {
  ComplexSafelist,
  StringRegExpArray,
  UserDefinedOptions as PurgeCSSUserDefinedOptions,
} from "purgecss";

export {
  ComplexSafelist,
  StringRegExpArray,
  UserDefinedOptions as PurgeCSSUserDefinedOptions,
  RawContent,
  RawCSS,
  ExtractorFunction,
  Extractors,
  ExtractorResult,
  ExtractorResultDetailed,
  UserDefinedSafelist,
} from "purgecss";

/**
 * @public
 */
export type PathFunction = () => string[];
/**
 * @public
 */
export type SafelistFunction = () => ComplexSafelist;
/**
 * @public
 */
export type BlocklistFunction = () => StringRegExpArray;

/**
 * @public
 */
export type PurgedStats = {
  [index: string]: string[];
};

/**
 * @public
 */
export type UserDefinedOptions = Omit<
  PurgeCSSUserDefinedOptions,
  "css" | "content" | "safelist" | "blocklist" | "sourceMap"
> & {
  paths: string[] | PathFunction;
  moduleExtensions?: string[];
  verbose?: boolean;
  safelist?: PurgeCSSUserDefinedOptions["safelist"] | SafelistFunction;
  blocklist?: PurgeCSSUserDefinedOptions["blocklist"] | BlocklistFunction;
  only?: string[];
};

/**
 * Compilation of webpack or Rspack
 *
 * @public
 */
export type CompilationLike = object;

/**
 * Compiler of webpack or Rspack, the part of it the plugin is applied to.
 * The types of the plugin do not depend on webpack, which Rspack projects
 * don't install.
 *
 * @public
 */
export interface CompilerLike {
  hooks: {
    compilation: {
      tap(name: string, callback: (compilation: CompilationLike) => void): void;
    };
  };
}
