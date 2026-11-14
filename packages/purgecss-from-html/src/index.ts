import * as parse5 from "parse5";
import * as htmlparser2 from "parse5-htmlparser2-tree-adapter";

/**
 * @public
 */
export type ExtractorResultDetailed = {
  attributes: {
    names: string[];
    values: string[];
  };
  classes: string[];
  ids: string[];
  tags: string[];
  undetermined: string[];
};

/**
 * The characters separating the classes of a class list in HTML: space, tab,
 * new line, form feed and carriage return. `\s` matches more than these, e.g.
 * the no-break space, which is part of a class name.
 */
const ASCII_WHITESPACE = /[ \t\n\f\r]+/;

/**
 * Add the selectors of an element and of its descendants to the result
 *
 * @param element - element to get the selectors from
 * @param result - result the selectors are added to
 */
const addSelectorsInElement = (
  element: htmlparser2.Htmlparser2TreeAdapterMap["element"],
  result: ExtractorResultDetailed,
): void => {
  // the descendants are added before the element itself
  addSelectorsInNodes(element, result);

  result.tags.push(element.name);
  for (const [name, value] of Object.entries(element.attribs)) {
    // a class list can be separated by new lines and tabs, not only spaces
    const words = value.split(ASCII_WHITESPACE).filter(Boolean);
    if (name === "class") {
      result.classes.push(...words);
    } else if (name === "id") {
      result.ids.push(...words);
    }
    // always add to attributes, to handle things like [class*=foo]
    result.attributes.names.push(name);
    result.attributes.values.push(...words);
    // also add the whole value when it isn't its only word, i.e. when it is
    // empty or has whitespace, to handle things like [alt=""],
    // [title="hello world"] or [title^="hello wo"]
    if (words.length !== 1 || words[0] !== value) {
      result.attributes.values.push(value);
    }
  }
};

/**
 * Add the selectors of the descendants of a node to the result. Adding them
 * to a single result, instead of merging the results of each child, keeps
 * the extraction linear in the number of elements.
 *
 * @param node - node to get the selectors from
 * @param result - result the selectors are added to
 */
const addSelectorsInNodes = (
  node:
    | htmlparser2.Htmlparser2TreeAdapterMap["document"]
    | htmlparser2.Htmlparser2TreeAdapterMap["element"],
  result: ExtractorResultDetailed,
): void => {
  for (const childNode of node.childNodes) {
    const element = childNode;

    switch (element.type) {
      case "tag":
        addSelectorsInElement(element, result);
        break;
      case "root":
        addSelectorsInNodes(element, result);
        break;
      default:
        break;
    }
  }
};

/**
 * Get the potential selectors from HTML code
 *
 * @param content - HTML code
 * @returns the attributes, classes, ids, and tags from the HTML code
 *
 * @public
 */
const purgecssFromHtml = (content: string): ExtractorResultDetailed => {
  const tree = parse5.parse(content, {
    treeAdapter: htmlparser2.adapter,
  });

  const result: ExtractorResultDetailed = {
    attributes: {
      names: [],
      values: [],
    },
    classes: [],
    ids: [],
    tags: [],
    undetermined: [],
  };
  addSelectorsInNodes(tree, result);
  return result;
};

export default purgecssFromHtml;
