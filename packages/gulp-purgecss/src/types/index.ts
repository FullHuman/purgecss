import { UserDefinedOptions as PurgeCSSUserDefinedOptions } from "../../../purgecss/src/types/index";

export interface UserDefinedOptions
  extends Omit<PurgeCSSUserDefinedOptions, "css" | "content"> {
  content: string[];
}
