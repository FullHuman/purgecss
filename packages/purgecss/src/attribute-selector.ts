// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- Load the ambient declaration under ts-node without emitting a runtime import.
/// <reference path="./css-tokenizer.d.ts" />
import { CSSToken, TokenType, tokenizer } from "@csstools/css-tokenizer";

interface AttributeSelector {
  raw: string;
  attribute: string;
  namespace?: string | true;
  wildcardNamespace: boolean;
  operator?: "=" | "~=" | "|=" | "^=" | "$=" | "*=";
  value?: string;
  modifier?: "i" | "s";
  rawModifier?: string;
}

function isDelimiter(token: CSSToken | undefined, value: string): boolean {
  return token?.[0] === TokenType.Delim && token[4].value === value;
}

/**
 * Parse one attribute selector without recovering malformed syntax.
 *
 * @param css - original CSS, before the selector parser can rewrite it
 * @param complete - require the entire input to be a single attribute selector
 */
export function parseAttributeSelector(
  css: string,
  complete = true,
): AttributeSelector | undefined {
  let invalid = false;
  const reader = tokenizer(
    { css },
    {
      onParseError: () => {
        invalid = true;
      },
    },
  );
  const tokens: CSSToken[] = [];
  let token = reader.nextToken();
  while (token[0] === TokenType.Whitespace || token[0] === TokenType.Comment) {
    token = reader.nextToken();
  }
  if (token[0] !== TokenType.OpenSquare) return;
  const start = token[2];
  // Stop at the attribute's closing bracket, without tokenizing the rest of a
  // potentially long compound selector. Brackets inside strings are one token.
  do {
    token = reader.nextToken();
    if (token[0] === TokenType.EOF) return;
    if (token[0] !== TokenType.Comment) tokens.push(token);
  } while (token[0] !== TokenType.CloseSquare);
  const raw = css.slice(start, token[3] + 1);
  if (complete) {
    do {
      token = reader.nextToken();
    } while (
      token[0] === TokenType.Whitespace ||
      token[0] === TokenType.Comment
    );
    if (token[0] !== TokenType.EOF) return;
  }
  if (invalid) return;

  let position = 0;
  const skipWhitespace = (): void => {
    while (tokens[position]?.[0] === TokenType.Whitespace) position++;
  };
  skipWhitespace();
  let name = tokens[position++];
  let namespace: string | true | undefined;
  let wildcardNamespace = false;
  if (isDelimiter(name, "|")) {
    namespace = true;
    name = tokens[position++];
  } else if (
    isDelimiter(tokens[position], "|") &&
    !isDelimiter(tokens[position + 1], "=")
  ) {
    if (name?.[0] === TokenType.Ident) namespace = name[4].value;
    else if (isDelimiter(name, "*")) {
      namespace = "*";
      wildcardNamespace = true;
    } else return;
    position++;
    name = tokens[position++];
  }
  if (name?.[0] !== TokenType.Ident) return;
  const result: AttributeSelector = {
    raw,
    attribute: name[4].value,
    namespace,
    wildcardNamespace,
  };

  skipWhitespace();
  if (tokens[position]?.[0] !== TokenType.CloseSquare) {
    const operator = tokens[position++];
    if (isDelimiter(operator, "=")) result.operator = "=";
    else if (
      operator?.[0] === TokenType.Delim &&
      ["~", "|", "^", "$", "*"].includes(operator[4].value) &&
      isDelimiter(tokens[position], "=") &&
      // A two-character matcher must be contiguous, including across comments.
      operator[3] + 1 === tokens[position][2]
    ) {
      result.operator =
        `${operator[4].value}=` as AttributeSelector["operator"];
      position++;
    } else return;

    skipWhitespace();
    const value = tokens[position++];
    if (value?.[0] !== TokenType.Ident && value?.[0] !== TokenType.String)
      return;
    result.value = value[4].value;
    skipWhitespace();
    const modifier = tokens[position];
    if (modifier?.[0] === TokenType.Ident) {
      const flag = modifier[4].value.toLowerCase();
      if (flag !== "i" && flag !== "s") return;
      result.modifier = flag;
      result.rawModifier = modifier[1];
      position++;
      skipWhitespace();
    }
  }
  if (
    tokens[position]?.[0] !== TokenType.CloseSquare ||
    position !== tokens.length - 1
  )
    return;
  return result;
}

export function getAttributeSelectorKey(attribute: AttributeSelector): string {
  return JSON.stringify([
    attribute.namespace,
    attribute.wildcardNamespace,
    attribute.attribute,
    attribute.operator,
    attribute.value,
    attribute.modifier,
  ]);
}
