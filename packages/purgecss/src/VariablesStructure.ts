import * as postcss from "postcss";
import { StringRegExpArray } from "./types";
import { matchesPattern } from "./utils";

/**
 * @public
 */
export class VariableNode {
  /**
   * @deprecated The dependencies between declarations are no longer
   * recorded, so this list is always empty. The variables used by a used
   * variable are found by name in `VariablesStructure.removeUnused`. It will
   * be removed in the next major version.
   */
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
  public properties: Map<string, postcss.AtRule[]> = new Map();
  public usedVariables: Set<string> = new Set();
  public safelist: StringRegExpArray = [];

  addVariable(declaration: postcss.Declaration): void {
    const { prop } = declaration;
    const node = new VariableNode(declaration);
    // push in place, copying the list on each redefinition would be quadratic
    const variableNodes = this.nodes.get(prop);
    if (variableNodes) {
      variableNodes.push(node);
    } else {
      this.nodes.set(prop, [node]);
    }
  }

  /**
   * Register an `@property` at-rule so it can be removed along with the
   * declarations of the variable it defines
   *
   * @param atRule - `@property` at-rule
   */
  addProperty(atRule: postcss.AtRule): void {
    const name = atRule.params.trim();
    const properties = this.properties.get(name) || [];
    this.properties.set(name, [...properties, atRule]);
  }

  /**
   * @deprecated The variables used by a custom property are found by name in
   * `removeUnused`, so the dependencies between declarations are no longer
   * recorded and this method does nothing. It will be removed in the next
   * major version.
   */
  addVariableUsage(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    declaration: postcss.Declaration,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    matchedVariables: IterableIterator<RegExpMatchArray>,
  ): void {
    // nothing to record
  }

  addVariableUsageInProperties(
    matchedVariables: IterableIterator<RegExpMatchArray>,
  ): void {
    for (const variableMatch of matchedVariables) {
      // capturing group containing the variable is in index 1
      const variableName = variableMatch[1];
      this.usedVariables.add(variableName);
    }
  }

  /**
   * Mark every declaration of the variable as used. The variables it uses are
   * not marked, `removeUnused` adds them to the used variables first.
   *
   * @param variableName - name of the variable, e.g. `--color`
   */
  setAsUsed(variableName: string): void {
    for (const node of this.nodes.get(variableName) ?? []) {
      node.isUsed = true;
    }
  }

  removeUnused(): void {
    // add the variables used by the used variables, by reading every
    // declaration of each used variable. The set also iterates over the
    // variables added during the loop, so variables used through other
    // variables are found too, whatever the order of the declarations
    for (const used of this.usedVariables) {
      const usedNodes = this.nodes.get(used);
      if (usedNodes) {
        for (const usedNode of usedNodes) {
          const usedVariablesMatchesInDeclaration =
            usedNode.value.value.matchAll(/\bvar\(\s*(.+?)\s*[,)]/g);

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

    for (const [name, properties] of this.properties) {
      if (!this.usedVariables.has(name) && !this.isVariablesSafelisted(name)) {
        for (const property of properties) {
          property.remove();
        }
      }
    }
  }

  isVariablesSafelisted(variable: string): boolean {
    return this.safelist.some((safelistItem) =>
      matchesPattern(safelistItem, variable),
    );
  }
}
