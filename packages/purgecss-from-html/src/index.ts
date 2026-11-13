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

const mergedExtractorResults = (
  resultLeft: ExtractorResultDetailed,
  resultRight: ExtractorResultDetailed,
): ExtractorResultDetailed => {
  return {
    attributes: {
      names: [...resultLeft.attributes.names, ...resultRight.attributes.names],
      values: [
        ...resultLeft.attributes.values,
        ...resultRight.attributes.values,
      ],
    },
    classes: [...resultLeft.classes, ...resultRight.classes],
    ids: [...resultLeft.ids, ...resultRight.ids],
    tags: [...resultLeft.tags, ...resultRight.tags],
    undetermined: [],
  };
};

const getSelectorsInElement = (
  element: htmlparser2.Htmlparser2TreeAdapterMap["element"],
): ExtractorResultDetailed => {
  const result: ExtractorResultDetailed = {
    attributes: {
      names: [],
      values: [],
    },
    classes: [],
    ids: [],
    tags: [element.name],
    undetermined: [],
  };

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
    // an empty value has no word: keep it, to handle things like [alt=""]
    if (value === "") {
      result.attributes.values.push("");
    }
  }

  return mergedExtractorResults(getSelectorsInNodes(element), result);
};

const getSelectorsInNodes = (
  node:
    | htmlparser2.Htmlparser2TreeAdapterMap["document"]
    | htmlparser2.Htmlparser2TreeAdapterMap["element"],
): ExtractorResultDetailed => {
  let result: ExtractorResultDetailed = {
    attributes: {
      names: [],
      values: [],
    },
    classes: [],
    ids: [],
    tags: [],
    undetermined: [],
  };

  for (const childNode of node.childNodes) {
    const element = childNode;

    switch (element.type) {
      case "tag":
        result = mergedExtractorResults(result, getSelectorsInElement(element));
        break;
      case "root":
        result = mergedExtractorResults(result, getSelectorsInNodes(element));
        break;
      default:
        break;
    }
  }
  return result;
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

  return getSelectorsInNodes(tree);
};

export default purgecssFromHtml;
