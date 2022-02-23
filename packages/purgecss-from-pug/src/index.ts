import lex from "pug-lexer";

/**
 * Get the potential selectors from Pug code
 *
 * @param content - Pug code
 * @returns the attributes, classes, ids, and tags from the Pug code
 *
 * @public
 */
const purgeFromPug = (content: string): string[] => {
  const tokens = lex(content);
  const selectors: string[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case "tag":
      case "id":
      case "class":
        selectors.push(...token.val.split(" "));
        break;
      case "attribute":
        if (token.name === "class" || token.name === "id") {
          if (typeof token.val !== "string") continue;
          selectors.push(
            ...(token.mustEscape
              ? token.val.replace(/"/g, "")
              : token.val
            ).split(" ")
          );
        }
        break;
      default:
        break;
    }
  }
  return selectors;
};

export default purgeFromPug;
