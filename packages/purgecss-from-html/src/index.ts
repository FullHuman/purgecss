import parse5 from "parse5";
import * as htmlparser2 from "parse5-htmlparser2-tree-adapter";

const getSelectorsInElement = (element: htmlparser2.Element): string[] => {
  const selectors: string[] = [];
  const tagName = element.name;

  // add class names
  if (element.attribs.class) {
    selectors.push(...element.attribs.class.split(" "));
  }

  // add ids
  if (element.attribs.id) {
    selectors.push(...element.attribs.id.split(" "));
  }

  return [...getSelectorsInNodes(element), ...selectors, tagName];
};

const getSelectorsInNodes = (
  node: htmlparser2.Document | htmlparser2.Element
): string[] => {
  const selectors: string[] = [];
  for (const childNode of node.children) {
    const element = childNode as htmlparser2.Element;

    switch (element.type) {
      case "tag":
        selectors.push(...getSelectorsInElement(element));
        break;
      case "root":
        selectors.push(...getSelectorsInNodes(element));
        break;
      default:
        break;
    }
  }
  return selectors;
};

const purgecssFromHtml = (content: string): string[] => {
  const tree = parse5.parse(content, {
    treeAdapter: htmlparser2
  }) as htmlparser2.Document;

  return getSelectorsInNodes(tree);
};

export default purgecssFromHtml;
