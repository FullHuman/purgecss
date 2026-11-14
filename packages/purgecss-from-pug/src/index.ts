/**
 * Pug extractor for PurgeCSS
 *
 * A PurgeCSS extractor for PUG files that automatically generates a list of
 * used CSS selectors. This extractor can be used with PurgeCSS to eliminate
 * unused CSS and reduce the size of your production builds.
 *
 * @packageDocumentation
 */

import * as acorn from "acorn";
import * as walk from "acorn-walk";
import lex from "pug-lexer";
import type { ExtractorResultDetailed } from "purgecss";

/**
 * The characters separating the classes of a class list in HTML: space, tab,
 * new line, form feed and carriage return. `\s` matches more than these, e.g.
 * the no-break space, which is part of a class name.
 */
const ASCII_WHITESPACE = /[ \t\n\f\r]+/;

const ACORN_OPTIONS: acorn.Options = { ecmaVersion: "latest" };

/**
 * Get the name of a property of an object
 *
 * @param property - property of an object expression
 * @returns the name written in the object, undefined when it is computed
 */
const getPropertyName = ({
  computed,
  key,
}: Pick<acorn.Property, "computed" | "key">): string | undefined => {
  if (!computed && key.type === "Identifier") {
    return key.name;
  }
  if (!computed && key.type === "Literal") {
    return String(key.value);
  }
};

/**
 * Get the static strings of an attribute value
 *
 * The value of an attribute is a JavaScript expression: usually a string, but
 * also a class array, a class object, a condition, a concatenation, etc. Only
 * the strings and numbers written in the expression are returned, not the
 * values computed at runtime, e.g. the content of a variable.
 *
 * @param expression - value of the attribute, parsed by acorn
 * @param isClass - true for a class attribute, to find the keys of class objects
 * @returns the strings found in the value of the attribute
 */
const getExpressionStrings = (
  expression: acorn.Node,
  isClass: boolean,
): string[] => {
  const strings: string[] = [];
  walk.ancestor(expression, {
    Literal(node, _state, ancestors) {
      if (typeof node.value === "string") {
        strings.push(node.value);
      } else if (typeof node.value === "number") {
        // e.g. colspan=2 or tabindex=-1
        const parent = ancestors[ancestors.length - 2];
        const isNegative =
          parent?.type === "UnaryExpression" && parent.operator === "-";
        strings.push(`${isNegative ? "-" : ""}${node.value}`);
      }
    },
    TemplateLiteral(node) {
      for (const { value } of node.quasis) {
        // the static parts of a template literal, e.g. `btn btn-${size}`,
        // without the empty ones around its expressions
        if (value.cooked || (value.cooked === "" && node.quasis.length === 1)) {
          strings.push(value.cooked);
        }
      }
    },
    // the keys of a class object, e.g. class={active: isActive, "is-open": isOpen}
    Property(node) {
      // a computed key is an expression, walked like the rest of the value
      const name = isClass ? getPropertyName(node) : undefined;
      if (name !== undefined) {
        strings.push(name);
      }
    },
  });
  return strings;
};

/**
 * Get the attributes of the object of `&attributes`
 *
 * Only the attributes written in an object are returned, e.g. `class` and
 * `title` of `&attributes({class: 'foo', title: 'bar'})`. The attributes of
 * an object known at runtime are not, e.g. `&attributes(attributes)`, a spread
 * object or a computed name.
 *
 * @param source - JavaScript expression given to `&attributes`
 * @returns the name and the value of each attribute
 */
const getAndAttributes = (source: string): [string, acorn.Node][] => {
  let expression: acorn.Expression;
  try {
    expression = acorn.parseExpressionAt(source, 0, ACORN_OPTIONS);
  } catch {
    // pug-lexer only checks its brackets, not that it is an expression
    return [];
  }
  const attributes: [string, acorn.Node][] = [];
  if (expression.type === "ObjectExpression") {
    for (const property of expression.properties) {
      // not a spread object
      if (property.type === "Property") {
        const name = getPropertyName(property);
        if (name !== undefined) {
          attributes.push([name, property.value]);
        }
      }
    }
  }
  return attributes;
};

/**
 * Get the static strings of code
 *
 * The code is read token by token and not parsed: a line of unbuffered code
 * doesn't have to be a whole statement, e.g. `- if (isOpen) {` and `- }`
 * around a block.
 *
 * @param code - JavaScript code
 * @returns the strings and the static parts of the template literals
 */
const getCodeStrings = (code: string): string[] => {
  // acorn gives the value of a token, but doesn't declare it in its types
  const tokens: (acorn.Token & { value?: unknown })[] = [];
  try {
    for (const token of acorn.tokenizer(code, ACORN_OPTIONS)) {
      tokens.push(token);
    }
  } catch {
    // pug-lexer doesn't check unbuffered code: keep the strings found before
    // the code that can't be read, e.g. a string that isn't closed
  }
  const strings: string[] = [];
  tokens.forEach(({ type, value }, index) => {
    if (typeof value !== "string") {
      return;
    }
    if (type === acorn.tokTypes.string) {
      strings.push(value);
    } else if (type === acorn.tokTypes.template) {
      // the static parts of a template literal, without the empty ones around
      // its expressions, as in the value of an attribute
      const isWhole =
        tokens[index - 1]?.type === acorn.tokTypes.backQuote &&
        tokens[index + 1]?.type === acorn.tokTypes.backQuote;
      if (value || isWhole) {
        strings.push(value);
      }
    }
  });
  return strings;
};

/**
 * Add the words of a string to a list of selectors
 *
 * @param value - string found in a template, e.g. the value of an attribute
 * @param values - list getting the words of the string, and the string itself
 * @param names - list getting only the words, e.g. the classes
 */
const addWords = (value: string, values: string[], names?: string[]): void => {
  // a class list can be separated by new lines and tabs, not only spaces
  const words = value.split(ASCII_WHITESPACE).filter(Boolean);
  names?.push(...words);
  values.push(...words);
  // also add the whole value when it isn't its only word, i.e. when it is
  // empty or has whitespace, to handle things like [alt=""],
  // [title="hello world"] or [title^="hello wo"]
  if (words.length !== 1 || words[0] !== value) {
    values.push(value);
  }
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
  const addAttribute = (name: string, value?: acorn.Node): void => {
    if (name !== "class" && name !== "id") {
      extractorResult.attributes.names.push(name);
    }
    if (!value) {
      return;
    }
    for (const string of getExpressionStrings(value, name === "class")) {
      addWords(
        string,
        extractorResult.attributes.values,
        name === "class"
          ? extractorResult.classes
          : name === "id"
            ? extractorResult.ids
            : undefined,
      );
    }
  };
  // the strings of code can be anything, e.g. the classes of
  // `- var classes = ['foo', 'bar']` used by `div(class=classes)`
  const addCode = (code: string): void => {
    for (const string of getCodeStrings(code)) {
      addWords(string, extractorResult.undetermined);
    }
  };
  for (const [index, token] of tokens.entries()) {
    if (token.type === "tag") {
      extractorResult.tags.push(token.val);
    } else if (token.type === "class") {
      extractorResult.classes.push(...token.val.split(" "));
      extractorResult.attributes.values.push(...token.val.split(" "));
    } else if (token.type === "id") {
      extractorResult.ids.push(token.val);
      extractorResult.attributes.values.push(token.val);
    } else if (token.type === "attribute") {
      addAttribute(
        token.name,
        // a boolean attribute, e.g. `input(disabled)`, has the value `true`.
        // pug-lexer only accepts a value that is a valid expression
        typeof token.val === "string"
          ? acorn.parseExpressionAt(token.val, 0, ACORN_OPTIONS)
          : undefined,
      );
    } else if (token.type === "&attributes") {
      for (const [name, value] of getAndAttributes(token.val)) {
        addAttribute(name, value);
      }
    } else if (token.type === "code") {
      addCode(token.val);
    } else if (
      token.type === "blockcode" &&
      tokens[index + 1]?.type === "start-pipeless-text"
    ) {
      // the lines of block code are text tokens, up to the end of the block
      const end = tokens.findIndex(
        ({ type }, i) => i > index && type === "end-pipeless-text",
      );
      addCode(
        tokens
          .slice(index + 2, end)
          .map((line) => (line.type === "text" ? line.val : "\n"))
          .join(""),
      );
    }
  }
  return extractorResult;
};
