import {
  Parser,
  defaultTreeAdapter,
  type DefaultTreeAdapterMap,
  type DefaultTreeAdapterTypes,
  type Token,
} from "parse5";

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
const ASCII_TRIM = /^[ \t\n\f\r]+|[ \t\n\f\r]+$/g;
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const HTML_SCRIPT_TYPES = new Set(["text/html", "text/x-template"]);

/**
 * Keep parse5's internal parser integration here, covered by behavior tests and
 * an exact dependency version. A tree alone loses start tags discarded during
 * HTML recovery, including table fragments and repeated document elements.
 */
class SelectorParser extends Parser<DefaultTreeAdapterMap> {
  public hasNoscript = false;

  constructor(
    private readonly collectElement: (
      tagName: string,
      attributes: Token.Attribute[],
    ) => void,
    scriptingEnabled: boolean,
  ) {
    super({ scriptingEnabled });
  }

  override onStartTag(token: Token.TagToken): void {
    // Tree construction normalizes SVG/MathML names and namespace attributes.
    super.onStartTag(token);
    this.collectElement(token.tagName, token.attrs);
    if (token.tagName === "noscript") {
      this.hasNoscript = true;
    }
  }

  public parseContent(content: string): DefaultTreeAdapterTypes.Document {
    this.tokenizer.write(content, true);
    return this.document;
  }
}

const getAttribute = (
  element: DefaultTreeAdapterTypes.Element,
  name: string,
): string | undefined =>
  element.attrs.find((attr) => attr.name === name && !attr.namespace)?.value;

const getEmbeddedHtml = (
  element: DefaultTreeAdapterTypes.Element,
): string | undefined => {
  if (element.namespaceURI !== HTML_NAMESPACE) return;

  if (element.tagName === "iframe") {
    // parse5 already decoded the attribute for this HTML document.
    return getAttribute(element, "srcdoc");
  }

  if (element.tagName === "script") {
    const type = (getAttribute(element, "type") ?? "")
      .split(";", 1)[0]
      .replace(ASCII_TRIM, "")
      .replace(/[A-Z]/g, (character) => character.toLowerCase());
    if (HTML_SCRIPT_TYPES.has(type)) {
      return element.childNodes
        .filter(defaultTreeAdapter.isTextNode)
        .map((node) => node.value)
        .join("");
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
  const attributeNames = new Set<string>();
  const attributeValues = new Set<string>();
  const classes = new Set<string>();
  const ids = new Set<string>();
  const tags = new Set<string>();
  const pending: string[] = [];
  const seenContent = new Set<string>();

  const enqueue = (html: string): void => {
    if (!seenContent.has(html)) {
      seenContent.add(html);
      pending.push(html);
    }
  };

  const collectElement = (
    tagName: string,
    attributes: Token.Attribute[],
  ): void => {
    tags.add(tagName);
    for (const { name, value, prefix, namespace } of attributes) {
      attributeNames.add(name);
      if (prefix) attributeNames.add(`${prefix}:${name}`);
      attributeValues.add(value);

      if (!prefix && !namespace) {
        if (name === "class") {
          for (const className of value.split(ASCII_WHITESPACE)) {
            if (className) classes.add(className);
          }
        } else if (name === "id" && value !== "") {
          ids.add(value);
        }
      }
    }
  };

  const collectDocument = (
    html: string,
    scriptingEnabled: boolean,
  ): boolean => {
    const parser = new SelectorParser(collectElement, scriptingEnabled);
    const stack: DefaultTreeAdapterTypes.Node[] = [parser.parseContent(html)];

    while (stack.length > 0) {
      const node = stack.pop()!;
      if (defaultTreeAdapter.isElementNode(node)) {
        collectElement(node.tagName, node.attrs);
        const embedded = getEmbeddedHtml(node);
        if (embedded !== undefined) enqueue(embedded);

        if (
          node.tagName === "template" &&
          node.namespaceURI === HTML_NAMESPACE
        ) {
          stack.push(
            defaultTreeAdapter.getTemplateContent(
              node as DefaultTreeAdapterTypes.Template,
            ),
          );
        }
      }
      if ("childNodes" in node) {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          stack.push(node.childNodes[i]);
        }
      }
    }
    return parser.hasNoscript;
  };

  enqueue(content);
  for (let i = 0; i < pending.length; i++) {
    if (collectDocument(pending[i], false)) {
      // A malformed fallback can hide later markup in only one interpretation.
      collectDocument(pending[i], true);
    }
  }

  return {
    attributes: {
      names: [...attributeNames],
      values: [...attributeValues],
    },
    classes: [...classes],
    ids: [...ids],
    tags: [...tags],
    undetermined: [],
  };
};

export default purgecssFromHtml;
