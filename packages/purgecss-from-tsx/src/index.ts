import purgeFromJsx from "@fullhuman/purgecss-from-jsx";
import acorn from "acorn";
import * as ts from "typescript";

/**
 * Create function to extract selectors from tsx code
 *
 * @param options - acorn options
 * @returns the function to extract selectors from tsx code
 *
 * @public
 */
function purgeFromTsx(options?: {
  acornOptions?: acorn.Options;
  tsOptions?: ts.CompilerOptions;
}): (content: string) => string[] {
  return (content: string): string[] => {
    return purgeFromJsx(options?.acornOptions)(
      ts.transpileModule(content, {
        compilerOptions: {
          jsx: ts.JsxEmit.Preserve,
          ...options?.tsOptions,
        },
      }).outputText
    );
  };
}

export default purgeFromTsx;
