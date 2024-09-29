/**
 * PostCSS Plugin for PurgeCSS
 *
 * Most bundlers and frameworks to build websites are using PostCSS.
 * The easiest way to configure PurgeCSS is with its PostCSS plugin.
 *
 * @packageDocumentation
 */

import * as path from "path";
import * as postcss from "postcss";
import {
  PurgeCSS,
  defaultOptions,
  mergeExtractorSelectors,
  standardizeSafelist,
  RawContent,
} from "purgecss";
import { UserDefinedOptions } from "./types";

export * from "./types";

const PLUGIN_NAME = "postcss-purgecss";

/**
 * Execute PurgeCSS process on the postCSS root node
 *
 * @param opts - PurgeCSS options
 * @param root - root node of postCSS
 * @param helpers - postCSS helpers
 */
async function purgeCSS(
  opts: UserDefinedOptions,
  root: postcss.Root,
  { result }: postcss.Helpers,
): Promise<void> {
  const purgeCSS = new PurgeCSS();

  let configFileOptions: UserDefinedOptions | undefined;
  try {
    const t = path.resolve(process.cwd(), "purgecss.config.js");
    configFileOptions = await import(t);
  } catch {
    // no config file present
  }

  const options = {
    ...defaultOptions,
    ...configFileOptions,
    ...opts,
    safelist: standardizeSafelist(
      opts?.safelist || configFileOptions?.safelist,
    ),
  };

  if (opts && typeof opts.contentFunction === "function") {
    options.content = opts.contentFunction(
      (root.source && root.source.input.file) || "",
    );
  }

  purgeCSS.options = options;

  if (options.variables) {
    purgeCSS.variablesStructure.safelist = options.safelist.variables || [];
  }

  const { content, extractors } = options;

  const fileFormatContents = content.filter(
    (o) => typeof o === "string",
  ) as string[];
  const rawFormatContents = content.filter(
    (o) => typeof o === "object",
  ) as RawContent[];

  const cssFileSelectors = await purgeCSS.extractSelectorsFromFiles(
    fileFormatContents,
    extractors,
  );
  const cssRawSelectors = await purgeCSS.extractSelectorsFromString(
    rawFormatContents,
    extractors,
  );

  const selectors = mergeExtractorSelectors(cssFileSelectors, cssRawSelectors);

  //purge unused selectors
  purgeCSS.walkThroughCSS(root, selectors);

  if (purgeCSS.options.fontFace) purgeCSS.removeUnusedFontFaces();
  if (purgeCSS.options.keyframes) purgeCSS.removeUnusedKeyframes();
  if (purgeCSS.options.variables) purgeCSS.removeUnusedCSSVariables();

  if (purgeCSS.options.rejected && purgeCSS.selectorsRemoved.size > 0) {
    result.messages.push({
      type: "purgecss",
      plugin: "postcss-purgecss",
      text: `purging ${purgeCSS.selectorsRemoved.size} selectors:
          ${Array.from(purgeCSS.selectorsRemoved)
            .map((selector) => selector.trim())
            .join("\n  ")}`,
    });
    purgeCSS.selectorsRemoved.clear();
  }
}

/**
 * PostCSS Plugin for PurgeCSS
 *
 * @param opts - PurgeCSS Options
 * @returns the postCSS plugin
 *
 * @public
 */
const purgeCSSPlugin: postcss.PluginCreator<UserDefinedOptions> = function (
  opts,
) {
  if (typeof opts === "undefined")
    throw new Error("PurgeCSS plugin does not have the correct options");
  return {
    postcssPlugin: PLUGIN_NAME,
    OnceExit(root, helpers) {
      return purgeCSS(opts, root, helpers);
    },
  };
};
purgeCSSPlugin.postcss = true;

export default purgeCSSPlugin;
export { purgeCSSPlugin };
