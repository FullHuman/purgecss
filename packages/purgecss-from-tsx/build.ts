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
  const rollupConfig = createRollupConfig("purgecss-from-tsx", ["acorn", "@fullhuman/purgecss-from-jsx", "typescript"]);
  await buildRollup(rollupConfig);
  await extractAPI(__dirname);
  await asyncFs.rm(path.resolve(__dirname, "lib", ".temp"), {
    recursive: true,
    force: true,
  });
})();
