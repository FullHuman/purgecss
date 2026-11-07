/**
 * Build the content fixture with Rspack in watch mode, change the content
 * file once built and print the purged CSS of both builds as JSON, in its
 * own process: @rspack/core is an ES module, which Jest only loads on
 * Node.js 24.9 and above.
 *
 * Usage: node watch.cjs
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

require("ts-node").register({
  transpileOnly: true,
  project: path.resolve(__dirname, "..", "..", "tsconfig.json"),
  compilerOptions: { module: "commonjs" },
});

const { rspack } = require("@rspack/core");
const { PurgeCSSPlugin } = require("../../src");

(async () => {
  const contentDirectory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "purgecss-webpack-plugin-rspack-watch-"),
  );
  const contentFile = path.join(contentDirectory, "index.html");
  await fs.promises.writeFile(contentFile, '<div class="kept"></div>\n');
  const outputDirectory = path.resolve(__dirname, "..", "js", "rspack-watch");
  const compiler = rspack({
    mode: "development",
    devtool: false,
    context: path.resolve(__dirname, "..", "content"),
    entry: { a: "./src/a.js" },
    output: { path: outputDirectory, clean: true },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [rspack.CssExtractRspackPlugin.loader, "css-loader"],
          type: "javascript/auto",
        },
      ],
    },
    plugins: [
      new rspack.CssExtractRspackPlugin(),
      new PurgeCSSPlugin({ paths: [contentFile] }),
    ],
  });

  const builds = [];
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`${builds.length} build(s) in 20 s`)),
      20_000,
    );
    const watching = compiler.watch({ aggregateTimeout: 50 }, (err, stats) => {
      if (err || stats.hasErrors()) {
        clearTimeout(timeout);
        watching.close(() => reject(err ?? new Error(stats.toString())));
        return;
      }
      builds.push(
        fs.readFileSync(path.join(outputDirectory, "a.css"), "utf-8"),
      );
      if (builds.length === 1) {
        // the content file is not part of the module graph
        fs.writeFileSync(contentFile, '<div class="kept removed-a"></div>\n');
      } else {
        clearTimeout(timeout);
        watching.close(() => resolve());
      }
    });
  });
  await fs.promises.rm(contentDirectory, { recursive: true, force: true });
  process.stdout.write(JSON.stringify(builds));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
