import * as fs from "fs";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as os from "os";
import * as path from "path";
import webpack, { Compiler } from "webpack";
import { PurgeCSSPlugin } from "../src";

const fixtureDirectory = path.resolve(__dirname, "content");
const outputDirectory = path.resolve(__dirname, "js", "content");

function run(compiler: Compiler): Promise<void> {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      else if (stats?.hasErrors()) reject(new Error(stats.toString()));
      else resolve();
    });
  });
}

describe("content extraction", () => {
  // files the extractor was called for
  const extractedFiles: string[] = [];
  let compiler: Compiler;
  // the content is written to a temporary directory, as a test modifies it
  let contentDirectory: string;
  let contentFile: string;

  /**
   * Write the content file, and wait until it is old enough to be cached:
   * content modified or changed less than 2 seconds before being read is not
   * cached. The change time (`ctime`) cannot be set to the past.
   *
   * @param html - content
   */
  async function writeContent(html: string): Promise<void> {
    await fs.promises.writeFile(contentFile, html);
    const { mtimeMs, ctimeMs } = await fs.promises.stat(contentFile);
    const wait = Math.max(mtimeMs, ctimeMs) + 2_100 - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  }

  beforeAll(async () => {
    contentDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "purgecss-webpack-plugin-content-"),
    );
    contentFile = path.join(contentDirectory, "index.html");
    await writeContent('<div class="kept"></div>\n');
    compiler = webpack({
      mode: "development",
      devtool: false,
      context: fixtureDirectory,
      entry: { a: "./src/a.js", b: "./src/b.js" },
      output: { path: outputDirectory },
      module: {
        rules: [
          { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin(),
        new PurgeCSSPlugin({
          paths: [contentFile],
          extractors: [
            {
              extensions: ["html"],
              extractor: (content: string) => {
                extractedFiles.push(content);
                return content.match(/[\w-]+/g) ?? [];
              },
            },
          ],
        }),
      ],
    });
  }, 30_000);

  afterAll(async () => {
    await new Promise<void>((resolve) => compiler.close(() => resolve()));
    await fs.promises.rm(contentDirectory, { recursive: true, force: true });
  });

  async function readCss(name: string): Promise<string> {
    return fs.promises.readFile(path.join(outputDirectory, name), "utf-8");
  }

  it("extracts the content once for all the css assets", async () => {
    await run(compiler);
    expect(extractedFiles).toHaveLength(1);
    for (const name of ["a.css", "b.css"]) {
      const css = await readCss(name);
      expect(css).toMatch(/\.kept \{/);
      expect(css).not.toMatch(/removed/);
    }
  });

  it("does not extract the unchanged content again on the next build", async () => {
    await run(compiler);
    expect(extractedFiles).toHaveLength(1);
    expect(await readCss("a.css")).toMatch(/\.kept \{/);
  });

  it("extracts the content again once it changed", async () => {
    await writeContent(
      '<div class="removed-a"></div><div class="removed-b"></div>\n',
    );
    await run(compiler);
    expect(extractedFiles).toHaveLength(2);
    // the css follows the new content
    const a = await readCss("a.css");
    const b = await readCss("b.css");
    expect(a).not.toMatch(/\.kept/);
    expect(b).not.toMatch(/\.kept/);
    expect(a).toMatch(/\.removed-a \{/);
    expect(b).toMatch(/\.removed-b \{/);
  }, 30_000);
});

describe("watch mode", () => {
  const watchOutputDirectory = path.resolve(__dirname, "js", "content-watch");
  let contentDirectory: string;
  let contentFile: string;
  let watching: ReturnType<Compiler["watch"]> | undefined;
  // resolved by the next build
  let nextBuild: Promise<void>;
  let onBuild: (err?: Error) => void;

  function waitForNextBuild(): void {
    nextBuild = new Promise((resolve, reject) => {
      onBuild = (err) => (err ? reject(err) : resolve());
    });
  }

  beforeAll(async () => {
    contentDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "purgecss-webpack-plugin-watch-"),
    );
    contentFile = path.join(contentDirectory, "index.html");
    await fs.promises.writeFile(contentFile, '<div class="kept"></div>\n');
    const compiler = webpack({
      mode: "development",
      devtool: false,
      context: fixtureDirectory,
      entry: { a: "./src/a.js" },
      output: { path: watchOutputDirectory },
      module: {
        rules: [
          { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin(),
        new PurgeCSSPlugin({ paths: [contentFile] }),
      ],
    });
    waitForNextBuild();
    watching = compiler.watch({ aggregateTimeout: 50 }, (err, stats) => {
      if (err) onBuild(err);
      else if (stats?.hasErrors()) onBuild(new Error(stats.toString()));
      else onBuild();
    });
    await nextBuild;
  }, 30_000);

  afterAll(async () => {
    await new Promise<void>((resolve) =>
      watching ? watching.close(() => resolve()) : resolve(),
    );
    await fs.promises.rm(contentDirectory, { recursive: true, force: true });
  });

  it("purges the css again when a content file changes", async () => {
    const css = path.join(watchOutputDirectory, "a.css");
    expect(await fs.promises.readFile(css, "utf-8")).not.toMatch(/removed-a/);

    waitForNextBuild();
    // the content file is not part of the module graph
    await fs.promises.writeFile(
      contentFile,
      '<div class="kept removed-a"></div>\n',
    );
    await nextBuild;
    expect(await fs.promises.readFile(css, "utf-8")).toMatch(/\.removed-a \{/);
  }, 30_000);
});

/**
 * Build the fixture in watch mode, purging with `paths` as the content
 *
 * @param name - name of the output directory
 * @param paths - content files
 * @returns a function waiting for the result of the next build, the purged
 * css or the errors of the compilation, and a function stopping the watcher
 */
function watchFixture(
  name: string,
  paths: string[],
): {
  nextBuild: () => Promise<{ css: string; errors: string[] }>;
  close: () => Promise<void>;
} {
  const outputDirectory = path.resolve(__dirname, "js", name);
  const compiler = webpack({
    mode: "development",
    devtool: false,
    context: fixtureDirectory,
    entry: { a: "./src/a.js" },
    output: { path: outputDirectory, clean: true },
    module: {
      rules: [
        { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
      ],
    },
    plugins: [new MiniCssExtractPlugin(), new PurgeCSSPlugin({ paths })],
  });
  const results: { css: string; errors: string[] }[] = [];
  const waiting: ((result: { css: string; errors: string[] }) => void)[] = [];
  const watching = compiler.watch({ aggregateTimeout: 50 }, (err, stats) => {
    const errors = err
      ? [err.message]
      : (stats?.compilation.errors ?? []).map((error) => error.message);
    const cssFile = path.join(outputDirectory, "a.css");
    const css = fs.existsSync(cssFile) ? fs.readFileSync(cssFile, "utf-8") : "";
    const resolve = waiting.shift();
    if (resolve) resolve({ css, errors });
    else results.push({ css, errors });
  });
  return {
    nextBuild: () => {
      const result = results.shift();
      return result
        ? Promise.resolve(result)
        : new Promise((resolve) => waiting.push(resolve));
    },
    close: () =>
      new Promise((resolve) =>
        watching ? watching.close(() => resolve()) : resolve(),
      ),
  };
}

describe("watch mode with a symbolic link as content file", () => {
  let contentDirectory: string;
  let target: string;
  let watcher: ReturnType<typeof watchFixture>;

  beforeAll(async () => {
    contentDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "purgecss-webpack-plugin-link-"),
    );
    // e.g. a file of a workspace package linked in node_modules: the link
    // and its target are in different directories
    for (const directory of ["package", "site"]) {
      await fs.promises.mkdir(path.join(contentDirectory, directory));
    }
    target = path.join(contentDirectory, "package", "index.html");
    await fs.promises.writeFile(target, '<div class="kept"></div>\n');
    const link = path.join(contentDirectory, "site", "index.html");
    await fs.promises.symlink(target, link);
    watcher = watchFixture("content-watch-link", [link]);
  });

  afterAll(async () => {
    await watcher.close();
    await fs.promises.rm(contentDirectory, { recursive: true, force: true });
  });

  it("purges the css again when the target of the link changes", async () => {
    const first = await watcher.nextBuild();
    expect(first.errors).toEqual([]);
    expect(first.css).not.toMatch(/removed-a/);

    // the watcher does not follow the link (`watchOptions.followSymlinks`)
    await fs.promises.writeFile(target, '<div class="kept removed-a"></div>\n');
    const second = await watcher.nextBuild();
    expect(second.errors).toEqual([]);
    expect(second.css).toMatch(/\.removed-a \{/);
  }, 30_000);
});

describe("watch mode with a missing content file", () => {
  let contentDirectory: string;
  let contentFile: string;
  let watcher: ReturnType<typeof watchFixture>;

  beforeAll(async () => {
    contentDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "purgecss-webpack-plugin-missing-"),
    );
    contentFile = path.join(contentDirectory, "index.html");
    await fs.promises.writeFile(contentFile, '<div class="kept"></div>\n');
    watcher = watchFixture("content-watch-missing", [contentFile]);
  });

  afterAll(async () => {
    await watcher.close();
    await fs.promises.rm(contentDirectory, { recursive: true, force: true });
  });

  it("reports the missing file and purges once it is created again", async () => {
    expect((await watcher.nextBuild()).errors).toEqual([]);

    await fs.promises.rm(contentFile);
    const failed = await watcher.nextBuild();
    expect(failed.errors).toEqual([`Path ${contentFile} does not exist.`]);

    // e.g. a branch switch, or an editor saving by delete and write
    await fs.promises.writeFile(
      contentFile,
      '<div class="kept removed-a"></div>\n',
    );
    const restored = await watcher.nextBuild();
    expect(restored.errors).toEqual([]);
    expect(restored.css).toMatch(/\.removed-a \{/);
  }, 30_000);
});

describe("processAssets stage", () => {
  const stageOutputDirectory = path.resolve(__dirname, "js", "content-stage");

  // a plugin deriving an asset from the CSS, e.g. a right-to-left copy
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
            if (asset) compilation.emitAsset("a.rtl.css", asset.source);
          },
        );
      });
    },
  };

  it("purges the css before the assets derived from it", async () => {
    const contentDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "purgecss-webpack-plugin-stage-"),
    );
    const contentFile = path.join(contentDirectory, "index.html");
    await fs.promises.writeFile(contentFile, '<div class="kept"></div>\n');
    const compiler = webpack({
      mode: "development",
      devtool: false,
      context: fixtureDirectory,
      entry: { a: "./src/a.js" },
      output: { path: stageOutputDirectory, clean: true },
      module: {
        rules: [
          { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin(),
        new PurgeCSSPlugin({ paths: [contentFile] }),
        derivedAssetPlugin,
      ],
    });
    await run(compiler);
    await new Promise<void>((resolve) => compiler.close(() => resolve()));
    await fs.promises.rm(contentDirectory, { recursive: true, force: true });
    const derived = await fs.promises.readFile(
      path.join(stageOutputDirectory, "a.rtl.css"),
      "utf-8",
    );
    expect(derived).toMatch(/\.kept \{/);
    expect(derived).not.toMatch(/removed-a/);
  });
});
