import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import { terser } from "rollup-plugin-terser";

const gulpPurgeCSSBundle: RollupOptions = {
  external: ["through2", "plugin-error", "purgecss", "glob"],
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/gulp-purgecss.esm.js",
      format: "esm",
    },
    {
      exports: "auto",
      file: "./lib/gulp-purgecss.js",
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

export default gulpPurgeCSSBundle;
