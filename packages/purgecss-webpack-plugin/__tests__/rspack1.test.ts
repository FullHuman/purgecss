import type { Chunk, Compilation } from "webpack";
import { collectCssModulesExports } from "../src/css-modules";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require("../package.json");

describe("Rspack 1", () => {
  it("is in the range of the @rspack/core peer dependency", () => {
    // npm refuses to install a package whose optional peer dependency is
    // installed in a version out of its range: projects with Rspack 1
    // installed purgecss-webpack-plugin 9.0
    const ranges = packageJson.peerDependencies["@rspack/core"]
      .split("||")
      .map((range: string) => range.trim());
    expect(ranges).toEqual(expect.arrayContaining(["^1.0.0", "^2.0.0"]));
    expect(packageJson.peerDependenciesMeta["@rspack/core"]).toEqual({
      optional: true,
    });
  });

  it("purges the extracted CSS modules without a module graph", () => {
    // the compilation of Rspack 1.0 has no `moduleGraph`: the export map of
    // an extracted CSS module cannot be found, its classes are purged like
    // global classes, as purgecss-webpack-plugin 9.0 did
    const chunk = {} as Chunk;
    const compilation = {
      options: { optimization: {} },
      modules: new Set(),
      chunkGraph: {
        getChunkModulesIterable: () => [{ type: "css/mini-extract" }],
      },
    } as unknown as Compilation;
    expect(collectCssModulesExports(compilation, [chunk])).toEqual({
      exports: [],
      usedClassNames: [],
    });
  });
});
