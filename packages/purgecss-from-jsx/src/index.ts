import * as acorn from "acorn";
import * as walk from "acorn-walk";
import jsx from "acorn-jsx";
import {extend} from "acorn-jsx-walk";

extend(walk.base);

function purgeFromJsx(options?: acorn.Options) {
  return (content: string): string[] => {
    // Will be filled during walk
    const state = {selectors: []};

    // Parse and walk any JSXElement
    walk.recursive(
      acorn.Parser.extend(jsx()).parse(content, options), 
      state,
      {
        JSXOpeningElement(node: any, state: any, callback) {
          // JSXIdentifier | JSXMemberExpression | JSXNamespacedName
          const nameState: any = {};
          callback(node.name, nameState);
          if (nameState.text) {
            state.selectors.push(nameState.text);
          }

          for (let i = 0; i < node.attributes.length; ++i) {
            callback(node.attributes[i], state);
          }
        },
        JSXAttribute(node: any, state: any, callback) {
          // Literal | JSXExpressionContainer | JSXElement | nil
          if (!node.value) {
            return;
          }

          // JSXIdentifier | JSXNamespacedName
          const nameState: any = {};
          callback(node.name, nameState);

          // node.name is id or className
          switch (nameState.text) {
          case "id":
          case "className":
            {
              // Get text in node.value
              const valueState: any = {};
              callback(node.value, valueState);

              // node.value is not empty
              if (valueState.text) {
                state.selectors.push(...valueState.text.split(" "));
              }
            }
            break;
          default:
            break;
          }
        },
        JSXIdentifier(node: any, state: any) {
          state.text = node.name;
        },
        JSXNamespacedName(node: any, state: any) {
          state.text = node.namespace.name + ":" + node.name.name;
        },
        // Only handle Literal for now, not JSXExpressionContainer | JSXElement
        Literal(node: any, state: any) {
          if (typeof node.value === "string") {
            state.text = node.value;
          }
        }
      },
      {...walk.base}
    );

    return state.selectors;
  };
}

export default purgeFromJsx;
