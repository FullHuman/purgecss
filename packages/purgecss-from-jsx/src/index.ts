import * as acorn from "acorn";
import jsx, {
  JSXAttribute,
  JSXIdentifier,
  JSXNamespacedName,
  JSXOpeningElement,
  Literal,
  TemplateElement,
} from "acorn-jsx";
import { extend } from "acorn-jsx-walk";
import * as walk from "acorn-walk";

type NodeState = {
  selectors?: string[];
  text?: string;
  strings?: string[];
  // the keys of the objects are class names, e.g. clsx({ active: isActive })
  objectKeys?: boolean;
};

extend<NodeState>(walk.base);

/**
 * Attributes whose words are selectors: the class names of `className` and
 * `class` (Preact, Solid) and the id of `id`
 */
const SELECTOR_ATTRIBUTES = new Set(["className", "class", "id"]);

/**
 * Attributes that React names differently from HTML
 */
const HTML_ATTRIBUTE_NAMES = new Map([
  ["className", "class"],
  ["htmlFor", "for"],
]);

/**
 * Get the names of an attribute in the HTML, for the attribute selectors
 *
 * The names of the attributes of HTML are case-insensitive, e.g. `tabIndex`
 * is `tabindex`, but the ones of SVG are not, e.g. `viewBox`, so the name is
 * returned as written and in lower case.
 *
 * @param name - name of the attribute in JSX
 * @returns the names of the attribute in the HTML
 */
const getAttributeNames = (name: string): string[] => {
  const htmlName = HTML_ATTRIBUTE_NAMES.get(name) ?? name;
  return [...new Set([htmlName, htmlName.toLowerCase()])];
};

/**
 * JSX files are usually ES modules, with `import`, `export` and top-level
 * `await`, but can be scripts, e.g. with `require` or sloppy mode code. They
 * are parsed as scripts that can have the syntax of modules, so that both are
 * parsed.
 */
const DEFAULT_ACORN_OPTIONS: acorn.Options = {
  ecmaVersion: "latest",
  sourceType: "script",
  allowImportExportEverywhere: true,
  allowAwaitOutsideFunction: true,
};

/**
 * Create function to extract selectors from jsx code
 *
 * @param options - acorn options, parsing ES modules and scripts by default
 * @returns function to extract selectors from jsx code
 *
 * @public
 */
function purgeFromJsx(options?: acorn.Options) {
  return (content: string): string[] => {
    // Will be filled during walk
    const state: NodeState = { selectors: [] };

    // Parse and walk any JSXElement
    walk.recursive<NodeState>(
      acorn.Parser.extend(
        jsx() as (BaseParser: typeof acorn.Parser) => typeof acorn.Parser,
      ).parse(content, options || DEFAULT_ACORN_OPTIONS),
      state,
      {
        JSXOpeningElement(
          acornNode: acorn.Node,
          state: NodeState,
          callback: (node: acorn.Node, state: NodeState) => void,
        ) {
          const node = acornNode as JSXOpeningElement;
          const nameState: NodeState = {};

          callback(node.name, nameState);
          if (nameState.text) {
            state.selectors?.push(nameState.text);
          }

          for (let i = 0; i < node.attributes.length; ++i) {
            callback(node.attributes[i], state);
          }
        },
        JSXAttribute(
          acornNode: acorn.Node,
          state: NodeState,
          callback: (node: acorn.Node, state: NodeState) => void,
        ) {
          const node = acornNode as JSXAttribute;

          const nameState: NodeState = {};
          callback(node.name, nameState);
          // a JSXIdentifier or a JSXNamespacedName, both set the text
          const name = nameState.text as string;
          // for the attribute selectors, e.g. [data-state] or [class^="icon-"]
          state.selectors?.push(...getAttributeNames(name));

          if (!node.value) {
            return;
          }

          const isSelectorAttribute = SELECTOR_ATTRIBUTES.has(name);
          // Get all the strings in node.value, e.g. both strings of
          // className={active ? "on" : "off"}. The value can also contain JSX
          // elements, e.g. icon={<Icon />}, whose selectors are added
          const valueState: NodeState = {
            selectors: state.selectors,
            strings: [],
            objectKeys: isSelectorAttribute,
          };
          callback(node.value, valueState);

          for (const text of valueState.strings ?? []) {
            const words = isSelectorAttribute
              ? text.split(/\s+/).filter(Boolean)
              : [];
            state.selectors?.push(...words);
            // the whole value when it isn't its only word, to handle things
            // like [type="checkbox"], [title="hello world"] or [alt=""]
            if (words.length !== 1 || words[0] !== text) {
              state.selectors?.push(text);
            }
          }
        },
        JSXIdentifier(acornNode: acorn.Node, state: NodeState) {
          const node = acornNode as JSXIdentifier;
          state.text = node.name;
        },
        JSXNamespacedName(acornNode: acorn.Node, state: NodeState) {
          const node = acornNode as JSXNamespacedName;
          state.text = node.namespace.name + ":" + node.name.name;
        },
        // Only static strings are collected, not values computed at runtime
        Literal(acornNode: acorn.Node, state: NodeState) {
          const node = acornNode as Literal;
          if (typeof node.value === "string") {
            state.strings?.push(node.value);
          }
        },
        // static parts of a template literal, e.g. `btn btn-${size}`
        TemplateElement(acornNode: acorn.Node, state: NodeState) {
          const node = acornNode as TemplateElement;
          if (node.value.cooked) {
            state.strings?.push(node.value.cooked);
          }
        },
        // keys of the objects in a className or id expression, e.g.
        // clsx({ active: isActive, "is-open": isOpen })
        Property(
          acornNode: acorn.Node,
          state: NodeState,
          callback: (node: acorn.Node, state: NodeState) => void,
        ) {
          const node = acornNode as acorn.Property;
          if (
            state.objectKeys &&
            !node.computed &&
            node.key.type === "Identifier"
          ) {
            state.strings?.push(node.key.name);
          } else {
            // a string key is a Literal, a computed key any expression
            callback(node.key, state);
          }
          callback(node.value, state);
        },
      } as unknown as walk.RecursiveVisitors<NodeState>,
      { ...walk.base },
    );

    // without duplicates, e.g. the `class` of every className
    return [...new Set(state.selectors)];
  };
}

export default purgeFromJsx;
