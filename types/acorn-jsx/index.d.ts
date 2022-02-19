declare module "acorn-jsx" {
  import { Node, Parser } from "acorn";
  export interface JSXAttribute extends Node {
    type: "JSXAttribute";
    elements?: Expression[];
    expression?: null | Expression;
    name: JSXIdentifier;
    value: Expression;
  }

  export interface JSXOpeningElement extends Node {
    type: "JSXOpeningElement";
    attributes: JSXAttribute[];
    name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
    selfClosing: boolean;
  }

  export interface JSXAttributeExpression extends Node {
    type: "JSXAttributeExpression";
    argument?: Expression;
  }

  export interface JSXFragment {
    children: JSXElement[];
    end: number;
    openingFragment: OpeningElement;
    start: number;
    type: "JSXFragment";
  }

  export interface OpeningElement extends JSXElement {
    attributes: JSXAttribute[];
  }

  export interface JSXElement extends Node {
    type: "JSXElement";
    children: JSXElement[];
    openingElement: OpeningElement;
    name: JSXIdentifier | JSXMemberExpression;
  }

  export interface JSXExpressionContainer extends Node {
    type: "JSXExpressionContainer";
    expression: Expression;
  }

  export interface JSXIdentifier extends Node {
    type: "JSXIdentifier";
    name: string;
  }

  export interface JSXMemberExpression extends Node {
    type: "JSXMemberExpression";
    object: JSXIdentifier | JSXMemberExpression;
    property: JSXIdentifier | JSXMemberExpression;
  }

  export interface JSXSpreadAttribute extends Node {
    type: "JSXSpreadAttribute";
    argument: Identifier;
  }

  export interface JSXText extends Node {
    type: "JSXText";
    value: string;
  }

  export interface JSXNamespacedName extends Node {
    type: "JSXNamespacedName";
    namespace: JSXIdentifier;
    name: JSXIdentifier;
  }

  export interface ArrayExpression extends Node {
    type: "ArrayExpression";
    elements: Expression[];
  }

  export interface BinaryExpression extends Node {
    type: "BinaryExpression";
    left: Expression;
    operator: string;
    right: Expression;
  }

  export interface CallExpression extends Node {
    type: "CallExpression";
    arguments: Expression[];
    callee: Expression;
  }

  export interface ConditionalExpression extends Node {
    type: "ConditionalExpression";
    alternate: Expression;
    consequent: Expression;
    test: Expression;
  }

  export interface ExpressionStatement extends Node {
    type: "ExpressionStatement";
    expression: Expression;
  }

  export interface Identifier extends Node {
    type: "Identifier";
    name: string;
  }

  export interface Literal extends Node {
    type: "Literal";
    value: string;
  }

  export interface LogicalExpression extends Node {
    type: "LogicalExpression";
    left: Expression;
    operator: string;
    right: Expression;
  }

  export interface MemberExpression extends Node {
    type: "MemberExpression";
    computed: boolean;
    name?: string;
    object: Literal | MemberExpression;
    property?: MemberExpression;
    raw?: string;
  }

  export interface ObjectExpression extends Node {
    type: "ObjectExpression";
    properties: [
      {
        key: { name?: string; value?: string };
        value: Expression;
      }
    ];
  }

  export interface TemplateElement extends Node {
    type: "TemplateElement";
    value: { cooked: string };
  }

  export interface TemplateLiteral extends Node {
    type: "TemplateLiteral";
    expressions: Expression[];
    quasis: Expression[];
  }

  export interface UnaryExpression extends Node {
    type: "UnaryExpression";
    operator: string;
    argument: { value: unknown };
  }

  export type Expression =
    | JSXAttribute
    | JSXAttributeExpression
    | JSXElement
    | JSXExpressionContainer
    | JSXSpreadAttribute
    | JSXFragment
    | JSXText
    | JSXNamespacedName
    | ArrayExpression
    | BinaryExpression
    | CallExpression
    | ConditionalExpression
    | ExpressionStatement
    | Identifier
    | Literal
    | LogicalExpression
    | MemberExpression
    | ObjectExpression
    | TemplateElement
    | TemplateLiteral
    | UnaryExpression;

  interface PluginOptions {
    allowNamespacedObjects?: boolean;
    allowNamespaces?: boolean;
    autoCloseVoidElements?: boolean;
  }
  export default function (
    options?: PluginOptions
  ): (BaseParser: typeof Parser) => typeof Parser;
}
/* eslint-enable no-use-before-define */
