import {
  buildRollup,
  createRollupConfig,
  extractAPI,
} from "../../scripts/build";
import { promises as asyncFs } from "fs";
import * as path from "path";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import { RollupOptions } from "rollup";

const external = [
  "postcss",
  "postcss-selector-parser",
  "glob",
  "path",
  "fs",
  "util",
];

const cliBundle: RollupOptions = {
  external: [...external, "commander"],
  input: "./src/bin.ts",
  output: {
    banner: "#!/usr/bin/env node",
    file: "./bin/purgecss.js",
    footer: "main();",
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

(async () => {
  await asyncFs.rm(path.resolve(__dirname, "lib"), {
    recursive: true,
    force: true,
  });
  await asyncFs.rm(path.resolve(__dirname, "bin"), {
    recursive: true,
    force: true,
  });
  const rollupConfig = createRollupConfig("purgecss", external);
  await buildRollup(rollupConfig);
  await buildRollup(cliBundle);
  await extractAPI(__dirname);
  await asyncFs.rm(path.resolve(__dirname, "lib", ".temp"), {
    recursive: true,
    force: true,
  });
})();
