import { UserDefinedOptions as PurgeCSSUserDefinedOptions } from "purgecss";

/**
 * @public
 */
export interface UserDefinedOptions extends Omit<
  PurgeCSSUserDefinedOptions,
  "css" | "content"
> {
  content: string[];
}
