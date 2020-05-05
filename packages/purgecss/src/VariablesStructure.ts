import postcss from "postcss";

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
      // catpuring group containing the variable is in index 1
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
      // catpuring group containing the variable is in index 1
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
    for (const [, declaration] of this.nodes) {
      if (!declaration.isUsed) {
        declaration.value.remove();
      }
    }
  }
}

export default VariablesStructure;
