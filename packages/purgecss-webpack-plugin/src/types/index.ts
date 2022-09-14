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
  UserDefinedSafelist
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
  safelist: PurgeCSSUserDefinedOptions["safelist"] | SafelistFunction;
  blocklist: PurgeCSSUserDefinedOptions["blocklist"] | BlocklistFunction;
  only?: string[];
};
