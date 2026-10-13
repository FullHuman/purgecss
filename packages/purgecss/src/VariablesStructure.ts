import * as postcss from "postcss";
import { StringRegExpArray } from "./types";

function trimCSSWhitespace(value: string): string {
  return value.replace(/^[\t\n\f\r ]+|[\t\n\f\r ]+$/g, "");
}

/**
 * @public
 */
export class VariableNode {
  public nodes: VariableNode[] = [];
  public value: postcss.Declaration;
  public isUsed = false;

  constructor(declaration: postcss.Declaration) {
    this.value = declaration;
  }
}

/**
 * @public
 */
export class VariablesStructure {
  public nodes: Map<string, VariableNode[]> = new Map();
  public usedVariables: Set<string> = new Set();
  public safelist: StringRegExpArray = [];

  addVariable(declaration: postcss.Declaration): void {
    const { prop } = declaration;
    if (!this.nodes.has(prop)) {
      const node = new VariableNode(declaration);
      this.nodes.set(prop, [node]);
    } else {
      const node = new VariableNode(declaration);
      const variableNodes = this.nodes.get(prop) || [];
      this.nodes.set(prop, [...variableNodes, node]);
    }
  }

  addVariableUsage(
    declaration: postcss.Declaration,
    matchedVariables: IterableIterator<RegExpMatchArray>,
  ): void {
    const { prop } = declaration;
    const nodes = this.nodes.get(prop);
    for (const variableMatch of matchedVariables) {
      // capturing group containing the variable is in index 1
      const variableName = trimCSSWhitespace(variableMatch[1]);
      if (this.nodes.has(variableName)) {
        const usedVariableNodes = this.nodes.get(variableName);
        nodes?.forEach((node) => {
          usedVariableNodes?.forEach((usedVariableNode) =>
            node.nodes.push(usedVariableNode),
          );
        });
      }
    }
  }

  addVariableUsageInProperties(
    matchedVariables: IterableIterator<RegExpMatchArray>,
  ): void {
    for (const variableMatch of matchedVariables) {
      // capturing group containing the variable is in index 1
      const variableName = trimCSSWhitespace(variableMatch[1]);
      this.usedVariables.add(variableName);
    }
  }

  setAsUsed(variableName: string): void {
    const nodes = this.nodes.get(variableName);
    if (nodes) {
      const queue = [...nodes];
      while (queue.length !== 0) {
        const currentNode = queue.pop();
        if (currentNode && !currentNode.isUsed) {
          currentNode.isUsed = true;
          queue.push(...currentNode.nodes);
        }
      }
    }
  }

  removeUnused(): void {
    // Safelisted variables also keep the variables they depend on.
    for (const name of this.nodes.keys()) {
      if (this.isVariablesSafelisted(name)) {
        this.usedVariables.add(name);
      }
    }

    // check unordered usage
    for (const used of this.usedVariables) {
      const usedNodes = this.nodes.get(used);
      if (usedNodes) {
        for (const usedNode of usedNodes) {
          const usedVariablesMatchesInDeclaration =
            usedNode.value.value.matchAll(/var\(([^,)]+)[,)]/g);

          for (const usage of usedVariablesMatchesInDeclaration) {
            const variableName = trimCSSWhitespace(usage[1]);
            if (!this.usedVariables.has(variableName)) {
              this.usedVariables.add(variableName);
            }
          }
        }
      }
    }

    for (const used of this.usedVariables) {
      this.setAsUsed(used);
    }

    for (const [name, declarations] of this.nodes) {
      for (const declaration of declarations) {
        if (!declaration.isUsed && !this.isVariablesSafelisted(name)) {
          declaration.value.remove();
        }
      }
    }
  }

  isVariablesSafelisted(variable: string): boolean {
    return this.safelist.some((safelistItem) => {
      if (typeof safelistItem === "string") {
        return safelistItem === variable;
      }
      // Stateful expressions must not depend on or mutate the caller's lastIndex.
      const expression =
        safelistItem.global || safelistItem.sticky
          ? new RegExp(safelistItem.source, safelistItem.flags)
          : safelistItem;
      return expression.test(variable);
    });
  }
}
