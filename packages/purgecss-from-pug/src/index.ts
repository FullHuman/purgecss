import lex from "pug-lexer";

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
