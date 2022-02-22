import type {
  RawContent,
  UserDefinedOptions as PurgeCSSUserDefinedOptions,
} from "purgecss";

/**
 * @public
 */
export type OutputFunction = (css: string, styles: string[]) => void;

/**
 * {@inheritDoc purgecss#UserDefinedOptions}
 *
 * @public
 */
export type UserDefinedOptions = Omit<
  PurgeCSSUserDefinedOptions,
  "css" | "output" | "rejectedCss"
> & {
  contentFunction?: (sourceFile: string) => Array<string | RawContent>;
  output: PurgeCSSUserDefinedOptions["output"] | OutputFunction | boolean;
  insert?: boolean;
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
  dest?: string;
};
