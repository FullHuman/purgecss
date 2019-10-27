import postcss from "postcss";
import {
  walkThroughCSS,
  defaultOptions,
  extractSelectorsFromFiles,
  extractSelectorsFromString,
  setPurgeCSSOptions,
  removeUnusedFontFaces,
  removeUnusedKeyframes,
  selectorsRemoved
} from "purgecss";

import { RawContent, UserDefinedOptions } from "./types";

type PurgeCSSPostCSSOptions = Omit<UserDefinedOptions, "css">;

const purgeCSSPlugin = postcss.plugin("postcss-plugin-purgecss", function(
  opts: PurgeCSSPostCSSOptions
) {
  return async function(root, result) {
    const options = {
      ...defaultOptions,
      ...opts
    };

    setPurgeCSSOptions(options);

    const { content, extractors } = options;

    const fileFormatContents = content.filter(
      o => typeof o === "string"
    ) as string[];
    const rawFormatContents = content.filter(
      o => typeof o === "object"
    ) as RawContent[];

    const cssFileSelectors = await extractSelectorsFromFiles(
      fileFormatContents,
      extractors
    );
    const cssRawSelectors = extractSelectorsFromString(
      rawFormatContents,
      extractors
    );

    const selectors = new Set([...cssFileSelectors, ...cssRawSelectors]);

    //purge unused selectors
    walkThroughCSS(root, selectors);

    if (options.fontFace) removeUnusedFontFaces();
    if (options.keyframes) removeUnusedKeyframes();

    if (options.rejected && selectorsRemoved.size > 0) {
      result.messages.push({
        type: "purgecss",
        plugin: "postcss-purgecss",
        text: `purging ${selectorsRemoved.size} selectors:
        ${Array.from(selectorsRemoved)
          .map(selector => selector.trim())
          .join("\n  ")}`
      });
      selectorsRemoved.clear();
    }
  };
});

export default purgeCSSPlugin;
