import * as postcss from "postcss";
import { StringRegExpArray } from "./types";

class VariableNode {
  public nodes: VariableNode[] = [];
  public value: postcss.Declaration;
  public isUsed = false;

  constructor(declaration: postcss.Declaration) {
    this.value = declaration;
  }
}

class VariablesStructure {
  public nodes: Map<string, VariableNode> = new Map();
  public usedVariables: Set<string> = new Set();
  public safelist: StringRegExpArray = [];

  addVariable(declaration: postcss.Declaration): void {
    const { prop } = declaration;
    if (!this.nodes.has(prop)) {
      const node = new VariableNode(declaration);
      this.nodes.set(prop, node);
    }
  }

  addVariableUsage(
    declaration: postcss.Declaration,
    matchedVariables: RegExpMatchArray[]
  ): void {
    const { prop } = declaration;
    const node = this.nodes.get(prop);
    for (const variableMatch of matchedVariables) {
      // capturing group containing the variable is in index 1
      const variableName = variableMatch[1];
      if (this.nodes.has(variableName)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const usedVariableNode = this.nodes.get(variableName)!;
        node?.nodes.push(usedVariableNode);
      }
    }
  }

  addVariableUsageInProperties(matchedVariables: RegExpMatchArray[]): void {
    for (const variableMatch of matchedVariables) {
      // capturing group containing the variable is in index 1
      const variableName = variableMatch[1];
      this.usedVariables.add(variableName);
    }
  }

  setAsUsed(variableName: string): void {
    const node = this.nodes.get(variableName);
    const queue = [node];
    while (queue.length !== 0) {
      const currentNode = queue.pop();
      if (currentNode && !currentNode.isUsed) {
        currentNode.isUsed = true;
        queue.push(...currentNode.nodes);
      }
    }
  }

  removeUnused(): void {
    for (const used of this.usedVariables) {
      this.setAsUsed(used);
    }
    for (const [name, declaration] of this.nodes) {
      if (!declaration.isUsed && !this.isVariablesSafelisted(name)) {
        declaration.value.remove();
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

export default VariablesStructure;
