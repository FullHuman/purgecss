import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import { terser } from "rollup-plugin-terser";

const purgeCSSFromPugBundle: RollupOptions = {
  external: ["pug-lexer"],
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/purgecss-from-pug.esm.js",
      format: "esm",
    },
    {
      exports: "auto",
      file: "./lib/purgecss-from-pug.js",
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

export default purgeCSSFromPugBundle;
