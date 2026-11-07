/**
 * PostCSS Plugin for PurgeCSS
 *
 * Most bundlers and frameworks to build websites are using PostCSS.
 * The easiest way to configure PurgeCSS is with its PostCSS plugin.
 *
 * @packageDocumentation
 */

import * as fs from "fs";
import * as path from "path";
import * as postcss from "postcss";
import { pathToFileURL } from "url";
import {
  PurgeCSS,
  defaultOptions,
  mergeExtractorSelectors,
  standardizeSafelist,
  RawContent,
} from "purgecss";
import {
  createRunContentCache,
  pruneSharedContentCache,
} from "./content-cache";
import { getCSSModulesClassNames } from "./css-modules";
import { getContentDependencies } from "./dependencies";
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
  const t = path.resolve(process.cwd(), "purgecss.config.js");
  // the config file is optional, but an existing one that fails to load
  // (e.g. a syntax error) is reported instead of being silently ignored
  if (fs.existsSync(t)) {
    try {
      const importedConfig = await import(pathToFileURL(t).href);
      // Handle both ES modules (direct export) and CommonJS (default export)
      configFileOptions =
        importedConfig.default && typeof importedConfig.default === "object"
          ? importedConfig.default
          : importedConfig;
    } catch (err: unknown) {
      throw new Error(`Error loading the config file ${t}: ${err}`, {
        cause: err,
      });
    }
  }

  // the safelists of the config file and of the plugin options add up
  const configFileSafelist = standardizeSafelist(configFileOptions?.safelist);
  const pluginSafelist = standardizeSafelist(opts?.safelist);
  const options = {
    ...defaultOptions,
    ...configFileOptions,
    ...opts,
    safelist: {
      standard: [...configFileSafelist.standard, ...pluginSafelist.standard],
      deep: [...configFileSafelist.deep, ...pluginSafelist.deep],
      greedy: [...configFileSafelist.greedy, ...pluginSafelist.greedy],
      keyframes: [...configFileSafelist.keyframes, ...pluginSafelist.keyframes],
      variables: [...configFileSafelist.variables, ...pluginSafelist.variables],
    },
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

  // the selectors of the content files are shared with the other runs,
  // unless the option contentCache is false
  const contentCache = createRunContentCache(options.contentCache !== false);
  purgeCSS.contentCache = contentCache;

  // found while the content is extracted, the messages are added once the
  // content files are read. Bundlers only read the messages of a successful
  // run: if the extraction fails, the error is reported alone.
  const dependencies =
    options.dependencies !== false && options.dependencies !== null
      ? getContentDependencies(
          content,
          typeof options.dependencies === "object" ? options.dependencies : {},
        )
      : undefined;
  // still awaited below: only avoids an unhandled rejection if the
  // extraction fails first
  dependencies?.catch(() => undefined);

  await purgeContent(purgeCSS, root, result, content, extractors);
  if (dependencies) {
    // let the dev servers run the plugin again when the content changes
    result.messages.push(
      ...(await dependencies).getMessages(result.opts.from, contentCache.files),
    );
  }

  if (options.contentCache !== false) {
    const contentKey = JSON.stringify([
      process.cwd(),
      options.skippedContentGlobs,
      content.filter((entry) => typeof entry === "string"),
    ]);
    pruneSharedContentCache(contentKey, contentCache.files);
  }
}

/**
 * Remove the unused CSS of the postCSS root node
 *
 * @param purgeCSS - PurgeCSS instance with its options
 * @param root - root node of postCSS
 * @param result - result of postCSS
 * @param content - content option of PurgeCSS
 * @param extractors - extractors option of PurgeCSS
 */
async function purgeContent(
  purgeCSS: PurgeCSS,
  root: postcss.Root,
  result: postcss.Result,
  content: Array<string | RawContent>,
  extractors: UserDefinedOptions["extractors"] = [],
): Promise<void> {
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

  // CSS modules scoped by an earlier plugin (postcss-modules in Vite): the
  // content and the options use the local names of the classes, not their
  // scoped names
  const cssModulesClassNames = getCSSModulesClassNames(
    root,
    result.messages,
    selectors,
    purgeCSS.options,
  );
  if (
    cssModulesClassNames.used.length > 0 ||
    cssModulesClassNames.usedIds.length > 0
  ) {
    selectors.merge({
      attributes: { names: [], values: [] },
      classes: cssModulesClassNames.used,
      ids: cssModulesClassNames.usedIds,
      tags: [],
      undetermined: [],
    });
  }
  const { safelist, blocklist } = purgeCSS.options;
  purgeCSS.options = {
    ...purgeCSS.options,
    safelist: {
      ...safelist,
      standard: [
        ...safelist.standard,
        ...cssModulesClassNames.safelist.standard,
      ],
      deep: [...safelist.deep, ...cssModulesClassNames.safelist.deep],
      greedy: [...safelist.greedy, ...cssModulesClassNames.safelist.greedy],
    },
    blocklist: [...blocklist, ...cssModulesClassNames.blocklist],
  };

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
