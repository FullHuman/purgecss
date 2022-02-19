import parse5 from "parse5";
import * as htmlparser2 from "parse5-htmlparser2-tree-adapter";

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

const mergedExtractorResults = (
  resultLeft: ExtractorResultDetailed,
  resultRight: ExtractorResultDetailed
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
  element: htmlparser2.Element
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
    if (name === "class") {
      result.classes.push(...value.split(" "));
    } else if (name === "id") {
      result.ids.push(...value.split(" "));
    } else {
      result.attributes.names.push(name);
      result.attributes.values.push(...value.split(" "));
    }
  }

  return mergedExtractorResults(getSelectorsInNodes(element), result);
};

const getSelectorsInNodes = (
  node: htmlparser2.Document | htmlparser2.Element
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

  for (const childNode of node.children) {
    const element = childNode as htmlparser2.Element;

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

const purgecssFromHtml = (content: string): ExtractorResultDetailed => {
  const tree = parse5.parse(content, {
    treeAdapter: htmlparser2,
  }) as htmlparser2.Document;

  return getSelectorsInNodes(tree);
};

export default purgecssFromHtml;
