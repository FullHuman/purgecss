import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import { terser } from "rollup-plugin-terser";

const postCSSPurgeCSSBundle: RollupOptions = {
  external: ["postcss", "purgecss"],
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/postcss-purgecss.esm.js",
      format: "esm",
    },
    {
      exports: "auto",
      file: "./lib/postcss-purgecss.js",
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

export default postCSSPurgeCSSBundle;
