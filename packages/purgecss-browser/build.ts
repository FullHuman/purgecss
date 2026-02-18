import { buildRollup, extractAPI } from "../../scripts/build";
import { promises as asyncFs } from "fs";
import * as path from "path";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { RollupOptions } from "rollup";

// All dependencies are bundled — nothing is marked external so the output
// files work standalone in a browser without any additional imports.
const browserBundle: RollupOptions = {
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/purgecss-browser.esm.js",
      format: "esm",
    },
    {
      exports: "auto",
      file: "./lib/purgecss-browser.js",
      format: "cjs",
    },
  ],
  plugins: [
    resolve({ browser: true, preferBuiltins: false }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: false,
      compilerOptions: {
        declaration: true,
        declarationDir: "./lib/.temp",
        outDir: "./lib",
      },
    }),
  ],
};

(async () => {
  await asyncFs.rm(path.resolve(__dirname, "lib"), {
    recursive: true,
    force: true,
  });
  await buildRollup(browserBundle);
  await extractAPI(__dirname);
  await asyncFs.rm(path.resolve(__dirname, "lib", ".temp"), {
    recursive: true,
    force: true,
  });
})();
