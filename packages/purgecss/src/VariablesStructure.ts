import * as postcss from "postcss";
import { StringRegExpArray } from "./types";

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
    matchedVariables: IterableIterator<RegExpMatchArray>
  ): void {
    const { prop } = declaration;
    const nodes = this.nodes.get(prop);
    for (const variableMatch of matchedVariables) {
      // capturing group containing the variable is in index 1
      const variableName = variableMatch[1];
      if (this.nodes.has(variableName)) {
        const usedVariableNodes = this.nodes.get(variableName);
        nodes?.forEach((node) => {
          usedVariableNodes?.forEach((usedVariableNode) =>
            node.nodes.push(usedVariableNode)
          );
        });
      }
    }
  }

  addVariableUsageInProperties(
    matchedVariables: IterableIterator<RegExpMatchArray>
  ): void {
    for (const variableMatch of matchedVariables) {
      // capturing group containing the variable is in index 1
      const variableName = variableMatch[1];
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
    // check unordered usage
    for (const used of this.usedVariables) {
      const usedNodes = this.nodes.get(used);
      if (usedNodes) {
        for (const usedNode of usedNodes) {
          const usedVariablesMatchesInDeclaration =
            usedNode.value.value.matchAll(/var\((.+?)[,)]/g);

          for (const usage of usedVariablesMatchesInDeclaration) {
            if (!this.usedVariables.has(usage[1])) {
              this.usedVariables.add(usage[1]);
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
      return typeof safelistItem === "string"
        ? safelistItem === variable
        : safelistItem.test(variable);
    });
  }
}
