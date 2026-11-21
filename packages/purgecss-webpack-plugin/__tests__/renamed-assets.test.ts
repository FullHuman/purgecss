import * as fs from "fs";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as os from "os";
import * as path from "path";
import webpack, { Compiler, Configuration, Stats } from "webpack";
import { PurgeCSSPlugin, PurgedStats } from "../src";

const fixtureDirectory = path.resolve(__dirname, "content");

/**
 * Build the fixture, whose css is extracted to assets named `filename`
 *
 * @param name - name of the output directory
 * @param filename - name of the css assets
 * @param configuration - other options of webpack, and the other plugins
 * @returns the stats of the compilation
 */
async function build(
  name: string,
  filename: string,
  configuration: Configuration,
): Promise<Stats> {
  const compiler = webpack({
    devtool: false,
    context: fixtureDirectory,
    entry: { a: "./src/a.js", b: "./src/b.js" },
    module: {
      rules: [
        { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
      ],
    },
    ...configuration,
    output: { path: path.resolve(__dirname, "js", name), clean: true },
    plugins: [
      new MiniCssExtractPlugin({ filename }),
      ...(configuration.plugins ?? []),
    ],
  });
  const stats = await new Promise<Stats>((resolve, reject) => {
    compiler.run((err, result) => {
      if (err || !result) reject(err);
      else if (result.hasErrors()) reject(new Error(result.toString()));
      else resolve(result);
    });
  });
  await new Promise<void>((resolve) => compiler.close(() => resolve()));
  return stats;
}

function getCssAssets(stats: Stats): string[] {
  return Object.keys(stats.compilation.assets)
    .filter((name) => name.endsWith(".css"))
    .sort();
}

describe("purgedStats of the assets renamed after they are purged", () => {
  let contentDirectory: string;
  let contentFile: string;

  beforeAll(async () => {
    contentDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "purgecss-webpack-plugin-renamed-"),
    );
    contentFile = path.join(contentDirectory, "index.html");
    await fs.promises.writeFile(contentFile, '<div class="kept"></div>\n');
  });

  afterAll(async () => {
    await fs.promises.rm(contentDirectory, { recursive: true, force: true });
  });

  // `optimization.realContentHash`, enabled in production mode: the content
  // hash in the name of an asset is replaced with the hash of its final
  // content, once purged and minimized
  it.each([
    ["in production mode", { mode: "production" }],
    [
      "with source maps",
      {
        mode: "development",
        devtool: "source-map",
        optimization: { realContentHash: true },
      },
    ],
  ] as [string, Configuration][])(
    "has the names of the assets with their real content hash as keys %s",
    async (_, configuration) => {
      const plugin = new PurgeCSSPlugin({
        paths: [contentFile],
        rejected: true,
      });
      const stats = await build(
        "renamed-assets-content-hash",
        "[name].[contenthash].css",
        { ...configuration, plugins: [plugin] },
      );

      // in production mode, both assets have the same hash: they have the
      // same content once purged
      const cssAssets = getCssAssets(stats);
      expect(cssAssets).toEqual([
        expect.stringMatching(/^a\.\w+\.css$/),
        expect.stringMatching(/^b\.\w+\.css$/),
      ]);
      expect(Object.keys(plugin.purgedStats).sort()).toEqual(cssAssets);
      expect(plugin.purgedStats[cssAssets[0]]).toEqual([".removed-a"]);
      expect(plugin.purgedStats[cssAssets[1]]).toEqual([".removed-b"]);
    },
    30_000,
  );

  it("keeps the names of the assets that are not renamed as keys", async () => {
    // a plugin deriving an asset from the css with the info of the css
    const derivedAssetPlugin = {
      apply(compiler: Compiler): void {
        compiler.hooks.compilation.tap("DerivedAsset", (compilation) => {
          compilation.hooks.processAssets.tap(
            {
              name: "DerivedAsset",
              stage: webpack.Compilation.PROCESS_ASSETS_STAGE_DERIVED,
            },
            () => {
              const asset = compilation.getAsset("a.css");
              if (asset) {
                compilation.emitAsset("a.rtl.css", asset.source, asset.info);
              }
            },
          );
        });
      },
    };
    const plugin = new PurgeCSSPlugin({ paths: [contentFile], rejected: true });
    const stats = await build("renamed-assets-derived", "[name].css", {
      mode: "production",
      plugins: [plugin, derivedAssetPlugin],
    });

    expect(getCssAssets(stats)).toEqual(["a.css", "a.rtl.css", "b.css"]);
    expect(plugin.purgedStats).toEqual({
      "a.css": [".removed-a"],
      "b.css": [".removed-b"],
    });
  }, 30_000);

  it("keeps the assets of the same name another compiler added", async () => {
    const plugin = new PurgeCSSPlugin({ paths: [contentFile], rejected: true });
    // a compiler that does not rename its assets, compiled while the assets
    // of the other compiler are processed, once they are purged: its assets
    // have the names the assets of the other compiler were purged under
    let unrenamed: Stats | undefined;
    const nestedBuildPlugin = {
      apply(compiler: Compiler): void {
        compiler.hooks.compilation.tap("NestedBuild", (compilation) => {
          compilation.hooks.processAssets.tapPromise(
            {
              name: "NestedBuild",
              stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
            },
            async () => {
              unrenamed = await build(
                "renamed-assets-shared-unrenamed",
                "[name].[contenthash].css",
                {
                  mode: "development",
                  optimization: { realContentHash: false },
                  plugins: [plugin],
                },
              );
            },
          );
        });
      },
    };
    const renamed = await build(
      "renamed-assets-shared",
      "[name].[contenthash].css",
      {
        mode: "development",
        optimization: { realContentHash: true },
        plugins: [plugin, nestedBuildPlugin],
      },
    );

    const [a, b] = unrenamed ? getCssAssets(unrenamed) : [];
    const [renamedA, renamedB] = getCssAssets(renamed);
    expect(a).toMatch(/^a\.\w+\.css$/);
    expect(renamedA).toMatch(/^a\.\w+\.css$/);
    expect(renamedA).not.toBe(a);
    expect(plugin.purgedStats).toEqual({
      [a]: [".removed-a"],
      [b]: [".removed-b"],
      [renamedA]: [".removed-a"],
      [renamedB]: [".removed-b"],
    });
  }, 30_000);
});

describe("purgedStats of the renamed assets in watch mode", () => {
  const outputDirectory = path.resolve(__dirname, "js", "renamed-assets-watch");
  // the sources are copied to a temporary directory, as the test modifies them
  let directory: string;
  let cssFile: string;
  let plugin: PurgeCSSPlugin;
  let watching: ReturnType<Compiler["watch"]> | undefined;

  type Build = { cssAssets: string[]; purgedStats: PurgedStats };
  const builds: Build[] = [];
  const waiting: {
    resolve: (build: Build) => void;
    reject: (err: Error) => void;
  }[] = [];

  function nextBuild(): Promise<Build> {
    const build = builds.shift();
    return build
      ? Promise.resolve(build)
      : new Promise((resolve, reject) => waiting.push({ resolve, reject }));
  }

  beforeAll(async () => {
    directory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "purgecss-webpack-plugin-renamed-watch-"),
    );
    await fs.promises.cp(
      path.join(fixtureDirectory, "src"),
      path.join(directory, "src"),
      { recursive: true },
    );
    cssFile = path.join(directory, "src", "a.css");
    const contentFile = path.join(directory, "index.html");
    await fs.promises.writeFile(contentFile, '<div class="kept"></div>\n');

    plugin = new PurgeCSSPlugin({ paths: [contentFile], rejected: true });
    const compiler = webpack({
      mode: "development",
      devtool: false,
      context: directory,
      entry: { a: "./src/a.js" },
      output: { path: outputDirectory, clean: true },
      optimization: { realContentHash: true },
      module: {
        rules: [
          {
            test: /\.css$/,
            // the loaders are not installed in the temporary directory
            use: [MiniCssExtractPlugin.loader, require.resolve("css-loader")],
          },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),
        plugin,
      ],
    });
    watching = compiler.watch({ aggregateTimeout: 50 }, (err, stats) => {
      const error = err
        ? err
        : !stats || stats.hasErrors()
          ? new Error(stats?.toString())
          : undefined;
      const next = waiting.shift();
      if (error) {
        if (next) next.reject(error);
        return;
      }
      const build = {
        cssAssets: stats ? getCssAssets(stats) : [],
        // the stats when the build ends: the plugin instance is the same for
        // every build
        purgedStats: { ...plugin.purgedStats },
      };
      if (next) next.resolve(build);
      else builds.push(build);
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) =>
      watching ? watching.close(() => resolve()) : resolve(),
    );
    await fs.promises.rm(directory, { recursive: true, force: true });
  });

  it("only holds the assets of the last compilation", async () => {
    const first = await nextBuild();
    expect(first.cssAssets).toEqual([expect.stringMatching(/^a\.\w+\.css$/)]);
    expect(first.purgedStats).toEqual({
      [first.cssAssets[0]]: [".removed-a"],
    });

    // a rule that is kept: the content of the purged css changes, and its
    // real content hash with it
    await fs.promises.appendFile(
      cssFile,
      "\n.kept {\n  margin: 0;\n}\n\n.removed-again {\n  color: green;\n}\n",
    );
    // a build may run again before the css is modified
    let second: Build;
    do {
      second = await nextBuild();
    } while (second.cssAssets[0] === first.cssAssets[0]);

    expect(second.cssAssets).toHaveLength(1);
    // the asset of the first build, renamed since it was purged, no longer
    // exists
    expect(second.purgedStats).toEqual({
      [second.cssAssets[0]]: [".removed-a", ".removed-again"],
    });
  }, 30_000);
});
