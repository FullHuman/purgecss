import postcss from "postcss";
import PurgeCSS, { defaultOptions, mergeExtractorSelectors } from "purgecss";

import { RawContent, UserDefinedOptions } from "./types";

const purgeCSSPlugin = postcss.plugin<Omit<UserDefinedOptions, "css">>(
  "postcss-plugin-purgecss",
  function(opts) {
    return async function(root, result) {
      const purgeCSS = new PurgeCSS();
      const options = {
        ...defaultOptions,
        ...opts
      };
      const sourceFile = (root.source && root.source.input.file) || "";

      if (opts && typeof opts.contentFunction === "function") {
        options.content = opts.contentFunction(sourceFile);
      }

      purgeCSS.options = options;

      const { content, extractors } = options;

      const fileFormatContents = content.filter(
        o => typeof o === "string"
      ) as string[];
      const rawFormatContents = content.filter(
        o => typeof o === "object"
      ) as RawContent[];

      const {
        selectors: cssFileSelectors,
        fileList: fileDependencies
      } = await purgeCSS.extractSelectorsFromFiles(
        fileFormatContents,
        extractors
      );
      const cssRawSelectors = await purgeCSS.extractSelectorsFromString(
        rawFormatContents,
        extractors
      );

      const selectors = mergeExtractorSelectors(
        cssFileSelectors,
        cssRawSelectors
      );

      if (fileDependencies && fileDependencies.length) {
        fileDependencies.forEach(file => {
          result.messages.push({
            type: "dependency",
            plugin: "postcss-purgecss",
            file: file,
            parent: sourceFile
          });
        });
      }

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
          .map(selector => selector.trim())
          .join("\n  ")}`
        });
        purgeCSS.selectorsRemoved.clear();
      }
    };
  }
);

export default purgeCSSPlugin;
