import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import { terser } from "rollup-plugin-terser";

const purgeCSSWebpackPluginBundle: RollupOptions = {
  external: ["fs", "path", "purgecss", "webpack", "webpack-sources"],
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/purgecss-webpack-plugin.esm.js",
      format: "esm",
    },
    {
      exports: "auto",
      file: "./lib/purgecss-webpack-plugin.js",
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

export default purgeCSSWebpackPluginBundle;
