import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import { terser } from "rollup-plugin-terser";

const purgeCSSFromTSXBundle: RollupOptions = {
  external: ["acorn", "@fullhuman/purgecss-from-jsx", "typescript"],
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/purgecss-from-tsx.esm.js",
      format: "esm",
    },
    {
      exports: "auto",
      file: "./lib/purgecss-from-tsx.js",
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

export default purgeCSSFromTSXBundle;
