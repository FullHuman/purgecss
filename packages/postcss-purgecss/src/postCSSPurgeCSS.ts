import { Helpers, PluginCreator, Root } from "postcss";

import PurgeCSS, {
  defaultOptions,
  mergeExtractorSelectors,
  standardizeSafelist,
} from "purgecss";

import {
  PostCSSv7,
  PostCSSv8,
  PostCSSVersions,
  RawContent,
  UserDefinedOptions,
} from "./types";

const PLUGIN_NAME = "postcss-purgecss";

function isPostCSSv8(postcss: PostCSSVersions): postcss is PostCSSv8 {
  return typeof (postcss as PostCSSv8).Root !== "undefined";
}

async function purgeCSS(
  opts: UserDefinedOptions,
  root: Root,
  { result }: Helpers
): Promise<void> {
  const purgeCSS = new PurgeCSS();
  const options = {
    ...defaultOptions,
    ...opts,
    safelist: standardizeSafelist(opts?.safelist),
  };

  if (opts && typeof opts.contentFunction === "function") {
    options.content = opts.contentFunction(
      (root.source && root.source.input.file) || ""
    );
  }

  purgeCSS.options = options;

  const { content, extractors } = options;

  const fileFormatContents = content.filter(
    (o) => typeof o === "string"
  ) as string[];
  const rawFormatContents = content.filter(
    (o) => typeof o === "object"
  ) as RawContent[];

  const cssFileSelectors = await purgeCSS.extractSelectorsFromFiles(
    fileFormatContents,
    extractors
  );
  const cssRawSelectors = await purgeCSS.extractSelectorsFromString(
    rawFormatContents,
    extractors
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

const purgeCSSPlugin: PluginCreator<UserDefinedOptions> = function (opts) {
  if (typeof opts === "undefined")
    throw new Error("PurgeCSS plugin does not have the correct options");
  return {
    postcssPlugin: PLUGIN_NAME,
    Once(root, helpers) {
      return purgeCSS(opts, root, helpers);
    },
  };
};
purgeCSSPlugin.postcss = true;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createPurgeCSSPlugin(postCSS: PostCSSVersions) {
  if (isPostCSSv8(postCSS)) {
    return purgeCSSPlugin;
  }

  return (postCSS as PostCSSv7).plugin(
    "postcss-purgecss",
    (opts?: UserDefinedOptions) => {
      if (typeof opts === "undefined")
        throw new Error("PurgeCSS plugin does not have the correct options");
      return async function (root, helpers): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return purgeCSS(opts, root, helpers);
      };
    }
  );
}
