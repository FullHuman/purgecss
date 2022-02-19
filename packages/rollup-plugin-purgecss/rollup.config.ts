import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import { terser } from "rollup-plugin-terser";

const rollupPluginPurgeCSSBundle: RollupOptions = {
  external: ["fs", "rollup-pluginutils", "purgecss"],
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/rollup-plugin-purgecss.esm.js",
      format: "esm",
    },
    {
      exports: "auto",
      file: "./lib/rollup-plugin-purgecss.js",
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

export default rollupPluginPurgeCSSBundle;
