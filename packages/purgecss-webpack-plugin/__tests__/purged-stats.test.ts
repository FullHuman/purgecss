import * as fs from "fs";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as os from "os";
import * as path from "path";
import webpack, { Compiler, Configuration, MultiCompiler } from "webpack";
import { PurgeCSSPlugin, PurgedStats } from "../src";

const fixtureDirectory = path.resolve(__dirname, "content");

function run(compiler: Compiler | MultiCompiler): Promise<void> {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      else if (stats?.hasErrors()) reject(new Error(stats.toString()));
      else resolve();
    });
  });
}

describe("purgedStats in watch mode with hashed asset names", () => {
  const outputDirectory = path.resolve(__dirname, "js", "purged-stats-watch");
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
      path.join(os.tmpdir(), "purgecss-webpack-plugin-stats-"),
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
        // the name of the asset changes with the css
        new MiniCssExtractPlugin({ filename: "[name].css?[contenthash]" }),
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
        cssAssets: Object.keys(stats?.compilation.assets ?? {}).filter((name) =>
          name.includes(".css"),
        ),
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
    expect(first.cssAssets).toHaveLength(1);
    expect(first.cssAssets[0]).toMatch(/^a\.css\?\w+$/);
    expect(first.purgedStats).toEqual({
      [first.cssAssets[0]]: [".removed-a"],
    });

    await fs.promises.appendFile(
      cssFile,
      "\n.removed-again {\n  color: green;\n}\n",
    );
    // a build may run again before the css is modified
    let second: Build;
    do {
      second = await nextBuild();
    } while (second.cssAssets[0] === first.cssAssets[0]);

    expect(second.cssAssets).toHaveLength(1);
    // the asset of the first build no longer exists
    expect(second.purgedStats).toEqual({
      [second.cssAssets[0]]: [".removed-a", ".removed-again"],
    });
  }, 30_000);
});

describe("purgedStats of a plugin instance shared by several compilers", () => {
  let contentDirectory: string;
  let plugin: PurgeCSSPlugin;
  let compiler: MultiCompiler;

  beforeAll(async () => {
    contentDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "purgecss-webpack-plugin-stats-multi-"),
    );
    const contentFile = path.join(contentDirectory, "index.html");
    await fs.promises.writeFile(contentFile, '<div class="kept"></div>\n');

    plugin = new PurgeCSSPlugin({ paths: [contentFile], rejected: true });
    const configuration = (name: string): Configuration => ({
      name,
      mode: "development",
      devtool: false,
      context: fixtureDirectory,
      entry: { [name]: `./src/${name}.js` },
      output: {
        path: path.resolve(__dirname, "js", "purged-stats-multi", name),
        clean: true,
      },
      module: {
        rules: [
          { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
        ],
      },
      plugins: [new MiniCssExtractPlugin(), plugin],
    });
    compiler = webpack([
      configuration("a"),
      // compiled once the compilation of `a` is done
      { ...configuration("b"), dependencies: ["a"] },
    ]);
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => compiler.close(() => resolve()));
    await fs.promises.rm(contentDirectory, { recursive: true, force: true });
  });

  it("holds the assets of every compiler", async () => {
    await run(compiler);
    expect(plugin.purgedStats).toEqual({
      "a.css": [".removed-a"],
      "b.css": [".removed-b"],
    });
  }, 30_000);

  it("keeps the assets of the other compilers when one compiles again", async () => {
    // e.g. in watch mode, where a change only invalidates the compilers
    // that depend on the changed file
    await run(compiler.compilers[0]);
    expect(plugin.purgedStats).toEqual({
      "a.css": [".removed-a"],
      "b.css": [".removed-b"],
    });
  }, 30_000);
});
