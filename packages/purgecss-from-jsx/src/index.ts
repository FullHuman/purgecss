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
};

extend<NodeState>(walk.base);

/**
 * Create function to extract selectors from jsx code
 *
 * @param options - acorn options
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
      ).parse(content, options || { ecmaVersion: "latest" }),
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

          if (!node.value) {
            return;
          }

          const nameState: NodeState = {};
          callback(node.name, nameState);

          // node.name is id or className
          switch (nameState.text) {
            case "id":
            case "className":
              {
                // Get all the strings in node.value, e.g. both strings of
                // className={active ? "on" : "off"}
                const valueState: NodeState = { strings: [] };
                callback(node.value, valueState);

                for (const text of valueState.strings ?? []) {
                  state.selectors?.push(...text.split(/\s+/).filter(Boolean));
                }
              }
              break;
            default:
              // the value can contain JSX elements, e.g. icon={<Icon />}
              callback(node.value, { selectors: state.selectors });
              break;
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
      } as unknown as walk.RecursiveVisitors<NodeState>,
      { ...walk.base },
    );

    return state.selectors || [];
  };
}

export default purgeFromJsx;
