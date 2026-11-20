import * as fs from "fs";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import webpack from "webpack";
import { PurgeCSSPlugin } from "../src";

const fixtureDirectory = path.resolve(__dirname, "options");
const outputDirectory = path.resolve(__dirname, "js", "options");

/**
 * Compile the fixture with the plugin, and return the purged css
 *
 * @param plugin - plugin instance
 * @param filename - `filename` option of mini-css-extract-plugin
 */
function compile(
  plugin: PurgeCSSPlugin,
  filename = "[name].css",
): Promise<string> {
  const compiler = webpack({
    mode: "development",
    devtool: false,
    context: fixtureDirectory,
    entry: { main: "./src/index.js" },
    output: { path: outputDirectory },
    module: {
      rules: [
        { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
      ],
    },
    plugins: [new MiniCssExtractPlugin({ filename }), plugin],
  });
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      compiler.close(() => undefined);
      if (err) return reject(err);
      if (!stats || stats.hasErrors()) {
        return reject(new Error(stats?.toString()));
      }
      // the file written for an asset name with a query, e.g. a content hash
      const file = path.join(outputDirectory, "main.css");
      resolve(fs.promises.readFile(file, "utf-8"));
    });
  });
}

describe("PurgeCSSPlugin options", () => {
  // ts-jest type-checks this file, so a required option makes it fail to compile
  it("only requires the paths option", () => {
    const plugin = new PurgeCSSPlugin({ paths: ["index.html"] });
    expect(plugin.options).toEqual({ paths: ["index.html"] });
  });

  it("accepts the documented options", () => {
    const options = {
      paths: () => ["index.html"],
      only: ["bundle"],
      safelist: () => ({ standard: ["safelisted"] }),
      dynamicAttributes: ["aria-selected"],
      rejected: true,
    };
    expect(new PurgeCSSPlugin(options).options).toEqual(options);
  });
});

describe("PurgeCSSPlugin options in a compilation", () => {
  const paths = [path.join(fixtureDirectory, "index.html")];

  it("stores the removed selectors of each css asset in purgedStats with rejected", async () => {
    const plugin = new PurgeCSSPlugin({ paths, rejected: true });
    const css = await compile(plugin);
    expect(css).toMatch(/\.used \{/);
    expect(css).not.toMatch(/\.unused/);
    expect(plugin.purgedStats).toEqual({ "main.css": [".unused"] });
  }, 30_000);

  it("does not store the removed selectors without rejected", async () => {
    const plugin = new PurgeCSSPlugin({ paths });
    const css = await compile(plugin);
    expect(css).not.toMatch(/\.unused/);
    expect(plugin.purgedStats).toEqual({});
  }, 30_000);

  it("removes the selectors returned by a blocklist function", async () => {
    const plugin = new PurgeCSSPlugin({
      paths,
      blocklist: () => ["blocklisted"],
    });
    const css = await compile(plugin);
    expect(css).toMatch(/\.used \{/);
    expect(css).not.toMatch(/\.blocklisted/);
  }, 30_000);

  it("purges the css assets whose name has a query", async () => {
    const plugin = new PurgeCSSPlugin({ paths, rejected: true });
    const css = await compile(plugin, "[name].css?[contenthash]");
    expect(css).toMatch(/\.used \{/);
    expect(css).not.toMatch(/\.unused/);
    // the stats are stored under the name of the asset, with its query
    const names = Object.keys(plugin.purgedStats);
    expect(names).toHaveLength(1);
    expect(names[0]).toMatch(/^main\.css\?[0-9a-f]+$/);
    expect(plugin.purgedStats[names[0]]).toEqual([".unused"]);
  }, 30_000);
});
