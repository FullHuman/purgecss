/**
 * Pug extractor for PurgeCSS
 *
 * A PurgeCSS extractor for PUG files that automatically generates a list of
 * used CSS selectors. This extractor can be used with PurgeCSS to eliminate
 * unused CSS and reduce the size of your production builds.
 *
 * @packageDocumentation
 */

import lex from "pug-lexer";
import type { ExtractorResultDetailed } from "purgecss";

const getAttributeTokenValues = (token: lex.AttributeToken): string[] => {
  if (typeof token.val === "string") {
    return (token.mustEscape ? token.val.replace(/"/g, "") : token.val).split(
      " ",
    );
  }
  return [];
};
/**
 * Get the potential selectors from Pug code
 *
 * @param content - Pug code
 * @returns the attributes, classes, ids, and tags from the Pug code
 *
 * @public
 */
export const purgeCSSFromPug = (content: string): ExtractorResultDetailed => {
  const tokens = lex(content);
  const extractorResult: ExtractorResultDetailed = {
    attributes: {
      // always add to attributes, to handle things like [class*=foo]
      names: ["class", "id"],
      values: ["true", "false"],
    },
    classes: [],
    ids: [],
    tags: [],
    undetermined: [],
  };
  for (const token of tokens) {
    if (token.type === "tag") {
      extractorResult.tags.push(token.val);
    } else if (token.type === "class") {
      extractorResult.classes.push(...token.val.split(" "));
      extractorResult.attributes.values.push(...token.val.split(" "));
    } else if (token.type === "id") {
      extractorResult.ids.push(token.val);
      extractorResult.attributes.values.push(token.val);
    } else if (token.type === "attribute") {
      const tokenValues = getAttributeTokenValues(token);
      if (token.name === "class") {
        extractorResult.classes.push(...tokenValues);
      } else if (token.name === "id") {
        extractorResult.ids.push(...tokenValues);
      } else {
        extractorResult.attributes.names.push(token.name);
      }
      extractorResult.attributes.values.push(...tokenValues);
    }
  }
  return extractorResult;
};
