import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import { terser } from "rollup-plugin-terser";

const gruntPurgeCSSBundle: RollupOptions = {
  external: ["purgecss"],
  input: "./src/index.ts",
  output: [
    {
      exports: "auto",
      file: "./tasks/purgecss.js",
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

export default gruntPurgeCSSBundle;
