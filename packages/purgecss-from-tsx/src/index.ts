import acorn from "acorn";
import * as ts from "typescript";
import purgeFromJsx from "purgecss-from-jsx";

function purgeFromTsx(options?: {
  acornOptions?: acorn.Options,
  tsOptions?: ts.CompilerOptions
}): (content: string) => string[] {
  return (content: string): string[] => {
    return purgeFromJsx(options?.acornOptions)(
      ts.transpileModule(content, {
        compilerOptions: {
          jsx: ts.JsxEmit.Preserve,
          ...options?.tsOptions
        }
      }).outputText
    );
  };
}

export default purgeFromTsx;
