import * as fs from "fs";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import webpack from "webpack";
import { PurgeCSSPlugin } from "../src";

const fixturesDirectory = path.resolve(__dirname, "config-file");

async function buildCss(configDirectory: string): Promise<string> {
  const outputDirectory = path.resolve(
    __dirname,
    "js",
    `config-file-${configDirectory}`,
  );
  const compiler = webpack({
    mode: "development",
    context: fixturesDirectory,
    entry: "./src/index.js",
    output: { path: outputDirectory },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new PurgeCSSPlugin({
        paths: [path.resolve(fixturesDirectory, "src", "index.html")],
      }),
    ],
  });

  const cwd = process.cwd();
  // the plugin looks for purgecss.config.js in the working directory
  process.chdir(path.resolve(fixturesDirectory, configDirectory));
  try {
    await new Promise<void>((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) reject(err);
        else if (stats?.hasErrors()) reject(new Error(stats.toString()));
        else resolve();
      });
    });
  } finally {
    process.chdir(cwd);
  }

  return fs.promises.readFile(
    path.resolve(outputDirectory, "main.css"),
    "utf-8",
  );
}

describe("PurgeCSSPlugin config file", () => {
  it.each([
    ["module.exports", "module-exports"],
    ["export default", "export-default"],
    ["named exports", "named-exports"],
  ])(
    "uses the options of a purgecss config file written with %s",
    async (_, configDirectory) => {
      const css = await buildCss(configDirectory);

      expect(css).toContain(".used");
      expect(css).toContain(".from-config");
      expect(css).not.toContain(".unused");
    },
  );

  it("reports a purgecss config file that fails to load", async () => {
    await expect(buildCss("invalid")).rejects.toThrow(
      "Error loading the config file",
    );
  });
});
