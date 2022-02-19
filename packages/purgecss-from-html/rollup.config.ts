import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import { terser } from "rollup-plugin-terser";

const purgeCSSFromHTMLBundle: RollupOptions = {
  external: ["parse5", "parse5-htmlparser2-tree-adapter"],
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/purgecss-from-html.esm.js",
      format: "esm",
    },
    {
      exports: "auto",
      file: "./lib/purgecss-from-html.js",
      format: "cjs",
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: false,
    }),
    terser(),
  ],
};

export default purgeCSSFromHTMLBundle;
