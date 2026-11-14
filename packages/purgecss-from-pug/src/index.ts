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

/**
 * Get the static strings of an attribute value
 *
 * The value of an attribute is a JavaScript expression: usually a string, but
 * also a class array, a class object, a condition, a concatenation, etc. Only
 * the strings and numbers written in the expression are returned, not the
 * values computed at runtime, e.g. the content of a variable.
 *
 * @param token - attribute token of pug-lexer
 * @returns the strings found in the value of the attribute
 */
const getAttributeTokenStrings = (token: lex.AttributeToken): string[] => {
  // a boolean attribute, e.g. `input(disabled)`, has the value `true`
  if (typeof token.val !== "string") {
    return [];
  }
  const strings: string[] = [];
  // pug-lexer only accepts a value that is a valid expression
  const expression = acorn.parseExpressionAt(token.val, 0, {
    ecmaVersion: "latest",
  });
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
      if (token.name !== "class" || node.computed) {
        // a computed key is an expression, walked like the rest of the value
        return;
      }
      if (node.key.type === "Identifier") {
        strings.push(node.key.name);
      } else if (node.key.type === "Literal") {
        strings.push(String(node.key.value));
      }
    },
  });
  return strings;
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
      if (token.name !== "class" && token.name !== "id") {
        extractorResult.attributes.names.push(token.name);
      }
      for (const value of getAttributeTokenStrings(token)) {
        // a class list can be separated by new lines and tabs, not only spaces
        const words = value.split(ASCII_WHITESPACE).filter(Boolean);
        if (token.name === "class") {
          extractorResult.classes.push(...words);
        } else if (token.name === "id") {
          extractorResult.ids.push(...words);
        }
        extractorResult.attributes.values.push(...words);
        // also add the whole value when it isn't its only word, i.e. when it
        // is empty or has whitespace, to handle things like [alt=""],
        // [title="hello world"] or [title^="hello wo"]
        if (words.length !== 1 || words[0] !== value) {
          extractorResult.attributes.values.push(value);
        }
      }
    }
  }
  return extractorResult;
};
