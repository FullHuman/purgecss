import {
  buildRollup,
  createRollupConfig,
  extractAPI,
} from "../../scripts/build";
import { promises as asyncFs } from "fs";
import * as path from "path";

(async () => {
  await asyncFs.rm(path.resolve(__dirname, "lib"), {
    recursive: true,
    force: true,
  });
  const rollupConfig = createRollupConfig("purgecss-from-html", [
    "parse5",
    "parse5-htmlparser2-tree-adapter",
  ]);
  await buildRollup(rollupConfig);
  await extractAPI(__dirname);
  await asyncFs.rm(path.resolve(__dirname, "lib", ".temp"), {
    recursive: true,
    force: true,
  });
})();
