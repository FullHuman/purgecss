import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import { terser } from "rollup-plugin-terser";

const external = [
  "postcss",
  "postcss-selector-parser",
  "glob",
  "path",
  "fs",
  "util",
];

const purgeCSSBundle: RollupOptions = {
  external,
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/purgecss.esm.js",
      format: "esm",
    },
    {
      exports: "auto",
      file: "./lib/purgecss.js",
      format: "cjs",
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: false,
      outputToFilesystem: false,
    }),
    terser(),
  ],
};

const cliBundle: RollupOptions = {
  external: [...external, "commander"],
  input: "./src/bin.ts",
  output: {
    banner: "#!/usr/bin/env node",
    file: "./bin/purgecss.js",
    format: "cjs",
  },
  plugins: [
    json(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      declarationDir: undefined,
      composite: false,
      sourceMap: false,
    }),
    terser(),
  ],
};

export default [purgeCSSBundle, cliBundle];
