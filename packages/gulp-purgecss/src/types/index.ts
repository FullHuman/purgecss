import { UserDefinedOptions as PurgeCSSUserDefinedOptions } from "purgecss";

export interface UserDefinedOptions
  extends Omit<PurgeCSSUserDefinedOptions, "css" | "content"> {
  content: string[];
}
