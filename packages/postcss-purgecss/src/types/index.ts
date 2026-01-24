import {
  UserDefinedOptions as PurgeCSSUserDefinedOptions,
  RawContent,
} from "purgecss";

export {
  UserDefinedOptions as PurgeCSSUserDefinedOptions,
  RawContent,
  UserDefinedSafelist,
  ComplexSafelist,
  ExtractorFunction,
  ExtractorResult,
  StringRegExpArray,
  RawCSS,
  Extractors,
  ExtractorResultDetailed,
} from "purgecss";

/**
 * {@inheritDoc purgecss#UserDefinedOptions}
 *
 * @public
 */
export interface UserDefinedOptions extends Omit<
  PurgeCSSUserDefinedOptions,
  "content" | "css"
> {
  content?: PurgeCSSUserDefinedOptions["content"];
  contentFunction?: (sourceFile: string) => Array<string | RawContent>;
}
