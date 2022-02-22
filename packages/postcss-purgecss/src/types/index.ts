import {
  UserDefinedOptions as PurgeCSSUserDefinedOptions,
  RawContent
} from "purgecss";


/**
 * {@inheritDoc purgecss#UserDefinedOptions}
 * 
 * @public
 */
export interface UserDefinedOptions extends Omit<PurgeCSSUserDefinedOptions, "css"> {
  contentFunction?: (sourceFile: string) => Array<string | RawContent>;
}
