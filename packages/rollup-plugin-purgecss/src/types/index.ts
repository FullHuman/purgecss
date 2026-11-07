import type {
  RawContent,
  UserDefinedOptions as PurgeCSSUserDefinedOptions,
} from "purgecss";

export type { RawContent };

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
  "content" | "css" | "output" | "rejectedCss" | "sourceMap"
> & {
  /**
   * Files and raw content to look for selectors in. Not needed when
   * `contentFunction` is set. Without both, all the CSS is removed, with a
   * warning.
   *
   * Relative paths and globs are resolved from the current working
   * directory, or from Vite's `root` with Vite, like the relative globs of
   * `skippedContentGlobs`. The content files are watched in watch mode. A new
   * file matching a glob is only used once the CSS is purged again, e.g.
   * after a change to a watched file.
   *
   * @defaultValue `[]`
   */
  content?: PurgeCSSUserDefinedOptions["content"];
  /**
   * Returns the content to look for selectors in, for the CSS file at the
   * given path. When it is set, `content` is not used. Its relative paths are
   * resolved like the ones of `content`.
   */
  contentFunction?: (sourceFile: string) => Array<string | RawContent>;
  /**
   * What to do with the purged CSS of all the CSS files, once the bundle is
   * generated:
   *
   * - a path: the CSS is written to this file, relative to the current
   *   working directory, or to Vite's `root` with Vite. Its directory is
   *   created if needed.
   *
   * - a function: it is called with the CSS and the CSS of each file.
   *
   * With Vite, it only gets the CSS that Vite bundles in its CSS files: not
   * the CSS imported with `?inline`, nor the CSS of the `<style>` elements
   * and `style` attributes of the HTML files, and not the CSS of the server
   * environments (e.g. `ssr`), which usually import the same CSS files.
   *
   * When a build has no CSS file left, e.g. in watch mode, the file is
   * emptied and the function is called with an empty string, if an earlier
   * build had CSS.
   *
   * With Rollup and Rolldown, when `output` is set (and is not `false`), the
   * imported CSS files export an empty string instead of their CSS.
   *
   * @defaultValue `undefined`, the imported CSS files export their CSS
   */
  output?: PurgeCSSUserDefinedOptions["output"] | OutputFunction | boolean;
  /**
   * Generate the source map of the purged CSS. With Vite, it is handed to
   * Vite along with the CSS. With Rollup and Rolldown, where the CSS files
   * become JS modules, it is always inlined in the CSS they export, but not
   * in the CSS given to `output`, where it would not match the CSS of all the
   * files joined.
   *
   * @defaultValue `false`
   */
  sourceMap?: PurgeCSSUserDefinedOptions["sourceMap"];
  /**
   * Rollup and Rolldown only: the imported CSS files insert their purged CSS
   * in the `<head>` of the document, in a `<style>` element, when the bundle
   * is run in a browser. They still export their CSS.
   *
   * @defaultValue `false`
   */
  insert?: boolean;
  /**
   * Files to purge, as picomatch patterns or regular expressions
   *
   * @defaultValue `["**\/*.css"]`
   */
  include?: string | RegExp | (string | RegExp)[];
  /**
   * Files not to purge, as picomatch patterns or regular expressions.
   * Relative patterns are resolved from the current working directory.
   *
   * @defaultValue `"**\/node_modules/**"`, the CSS of the dependencies,
   * wherever their `node_modules` directory is (e.g. at the root of a
   * workspace)
   */
  exclude?: string | RegExp | (string | RegExp)[];
  /**
   * @deprecated Has no effect. Use `output` to write the purged CSS to a
   * file.
   */
  dest?: string;
};
