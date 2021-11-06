import * as acorn from "acorn";
import jsx, {
  JSXAttribute,
  JSXIdentifier,
  JSXNamespacedName,
  JSXOpeningElement,
  Literal
} from "acorn-jsx";
import { extend } from "acorn-jsx-walk";
import * as walk from "acorn-walk";

type NodeState = {
  selectors?: string[];
  text?: string;
};

extend<NodeState>(walk.base);

function purgeFromJsx(options?: acorn.Options) {
  return (content: string): string[] => {
    // Will be filled during walk
    const state: NodeState = { selectors: [] };

    // Parse and walk any JSXElement
    walk.recursive<NodeState>(
      acorn.Parser.extend(jsx() as (BaseParser: typeof acorn.Parser) => typeof acorn.Parser).parse(content, options),
      state,
      {
        JSXOpeningElement(acornNode, state, callback) {
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
        JSXAttribute(acornNode, state, callback) {
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
                // Get text in node.value
                const valueState: NodeState = {};
                callback(node.value, valueState);

                // node.value is not empty
                if (valueState.text) {
                  state.selectors?.push(...valueState.text.split(" "));
                }
              }
              break;
            default:
              break;
          }
        },
        JSXIdentifier(acornNode, state) {
          const node = acornNode as JSXIdentifier;
          state.text = node.name;
        },
        JSXNamespacedName(acornNode, state) {
          const node = acornNode as JSXNamespacedName;
          state.text = node.namespace.name + ":" + node.name.name;
        },
        // Only handle Literal for now, not JSXExpressionContainer | JSXElement
        Literal(acornNode, state) {
          const node = acornNode as Literal;
          if (typeof node.value === "string") {
            state.text = node.value;
          }
        },
      },
      { ...walk.base }
    );

    return state.selectors || [];
  };
}

export default purgeFromJsx;
