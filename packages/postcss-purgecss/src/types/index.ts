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
 * Options of the dependency messages of the content
 *
 * @public
 */
export interface DependenciesOptions {
  /**
   * Root directory of the bundler, absolute or relative to the working
   * directory: the content paths outside it get no dependency message.
   *
   * @defaultValue under Turbopack, the root Next.js infers from the workspace
   * markers and lock files, otherwise no limit
   */
  root?: string;
}

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
  /**
   * Add PostCSS dependency messages for the content files and globs, so that
   * the dev servers (Vite, webpack and Rspack with postcss-loader, Next.js,
   * Parcel) run the plugin again when the content changes. Set it to `false`
   * to add no message, e.g. when a bundler rejects a path of the content.
   *
   * Pass an object to set the root directory of the bundler: the paths
   * outside it get no message. Under Turbopack (Next.js), which stops with an
   * error for a path outside its root, the root defaults to the one Next.js
   * infers (the outermost directory with a workspace marker or a lock file).
   * Set it to the value of `outputFileTracingRoot` or `turbopack.root` when
   * the Next.js config sets one of them.
   *
   * @defaultValue `true`
   */
  dependencies?: boolean | DependenciesOptions;
  /**
   * Keep the selectors extracted from the content files between the CSS
   * files and the runs of the plugin in the process: a content file is only
   * read and extracted again when it changed. Set it to `false` to read and
   * extract the content files for every CSS file.
   *
   * @defaultValue `true`
   */
  contentCache?: boolean;
}
