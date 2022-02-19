import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import { terser } from "rollup-plugin-terser";

const purgeCSSFromJSXBundle: RollupOptions = {
  external: ["acorn", "acorn-walk", "acorn-jsx", "acorn-jsx-walk"],
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/purgecss-from-jsx.esm.js",
      format: "esm",
    },
    {
      exports: "auto",
      file: "./lib/purgecss-from-jsx.js",
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

export default purgeCSSFromJSXBundle;
