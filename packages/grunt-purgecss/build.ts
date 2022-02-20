import {
  buildRollup,
  createRollupConfig,
} from "../../scripts/build";
import { promises as asyncFs } from "fs";
import * as path from "path";
import { RollupOptions } from "rollup";

(async () => {
  await asyncFs.rm(path.resolve(__dirname, "tasks"), {
    recursive: true,
    force: true,
  });
  const rollupConfig: RollupOptions = {
    ...createRollupConfig("grunt-purgecss", ["purgecss"]),
    output: [
      {
        exports: "auto",
        file: "./tasks/purgecss.js",
        format: "cjs",
      },
    ],
  }
  await buildRollup(rollupConfig);
})();
