import * as fs from "fs";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import webpack, { Configuration } from "webpack";
import { PurgeCSSPlugin } from "../src";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fixture = require("./css-modules/webpack.config.js");

interface SourceMap {
  sources: string[];
  sourcesContent?: string[];
  mappings: string;
}

const base64Digits =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Decode the mappings of a source map: for each generated line, its segments
 * `[generated column, source, original line, original column]`, with
 * absolute values
 *
 * @param mappings - `mappings` of a source map
 */
function decodeMappings(mappings: string): number[][][] {
  const state = [0, 0, 0, 0];
  return mappings.split(";").map((line) => {
    state[0] = 0;
    return line
      .split(",")
      .filter(Boolean)
      .map((segment) => {
        const values: number[] = [];
        let value = 0;
        let shift = 0;
        for (const char of segment) {
          const digit = base64Digits.indexOf(char);
          value += (digit & 31) << shift;
          if (digit & 32) {
            shift += 5;
          } else {
            values.push(value & 1 ? -(value >> 1) : value >> 1);
            value = 0;
            shift = 0;
          }
        }
        values.forEach((delta, index) => (state[index] += delta));
        return state.slice(0, values.length);
      });
  });
}

/**
 * Zero-based line and column of a text in a file
 *
 * @param content - content of the file
 * @param text - text to find, or a regular expression
 */
function positionOf(
  content: string,
  text: string | RegExp,
): { line: number; column: number } {
  const lines = content.split("\n");
  const line = lines.findIndex((l) =>
    typeof text === "string" ? l.includes(text) : text.test(l),
  );
  expect(line).toBeGreaterThanOrEqual(0);
  const column =
    typeof text === "string"
      ? lines[line].indexOf(text)
      : lines[line].search(text);
  return { line, column };
}

/**
 * Original position of a selector of the css, read from its source map
 *
 * @param output - css and its source map
 * @param selector - regular expression matching the selector in the css
 */
function originalPositionFor(
  output: { css: string; map: SourceMap },
  selector: RegExp,
): { source: string; line: number; column: number } | undefined {
  const { line, column } = positionOf(output.css, selector);
  const segments = decodeMappings(output.map.mappings)[line] ?? [];
  // the last segment starting at or before the column
  const segment = segments.filter((s) => s[0] <= column && s.length >= 4).pop();
  if (!segment) return undefined;
  return {
    source: output.map.sources[segment[1]],
    line: segment[2],
    column: segment[3],
  };
}

function runWebpack(config: Configuration): Promise<void> {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) reject(err);
      else if (stats?.hasErrors()) reject(new Error(stats.toString()));
      else resolve();
    });
  });
}

/**
 * Build the fixture with `devtool: "source-map"`
 *
 * @param name - name of the output directory
 * @param filename - name of the css assets
 * @param withPlugin - whether PurgeCSS purges the css
 */
async function build(
  name: string,
  filename: string,
  withPlugin: boolean,
): Promise<{ css: string; map: SourceMap }> {
  const outputDirectory = path.resolve(__dirname, "js", name);
  await runWebpack({
    mode: "development",
    devtool: "source-map",
    context: fixture.context,
    entry: fixture.entry,
    output: { path: outputDirectory, clean: true },
    module: { rules: fixture.cssRules(MiniCssExtractPlugin.loader) },
    plugins: [
      new MiniCssExtractPlugin({ filename }),
      ...(withPlugin
        ? [new PurgeCSSPlugin({ paths: fixture.contentPaths })]
        : []),
    ],
  });
  const cssPath = path.join(
    outputDirectory,
    filename.replace("[name]", "main"),
  );
  return {
    css: await fs.promises.readFile(cssPath, "utf-8"),
    map: JSON.parse(await fs.promises.readFile(`${cssPath}.map`, "utf-8")),
  };
}

describe.each([
  ["at the root", "[name].css", "source-map"],
  ["in a directory", "css/[name].css", "source-map-directory"],
])("source maps of css %s", (_, filename, name) => {
  let purged: { css: string; map: SourceMap };
  let control: { css: string; map: SourceMap };

  beforeAll(async () => {
    purged = await build(`${name}-purged`, filename, true);
    control = await build(`${name}-control`, filename, false);
  });

  it("keeps the original sources of the css", () => {
    expect(control.map.sources).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/global\.css$/),
        expect.stringMatching(/card\.module\.css$/),
      ]),
    );
    expect(purged.map.sources).toEqual(control.map.sources);
    expect(purged.map.sourcesContent).toEqual(control.map.sourcesContent);
  });

  it("maps the purged css", () => {
    expect(purged.css.length).toBeLessThan(control.css.length);
    expect(purged.map.mappings).not.toBe("");
    expect(purged.map.mappings).not.toBe(control.map.mappings);
  });

  it.each([
    // after the removed `.unused-global` rule
    ["a global class", /\.used-global \{/, "global.css", ".used-global {"],
    // after the removed `.modUnused` rule
    [
      "a class of a CSS module",
      /\.modCrossFile__[\w-]+ \{/,
      "card.module.css",
      ".modCrossFile {",
    ],
  ])(
    "maps %s to its position in the original file",
    async (_, purgedSelector, file, originalSelector) => {
      const original = await fs.promises.readFile(
        path.join(fixture.context, "src", file),
        "utf-8",
      );
      expect(originalPositionFor(purged, purgedSelector)).toEqual({
        source: expect.stringMatching(new RegExp(`/${file}$`)),
        ...positionOf(original, originalSelector),
      });
    },
  );

  it("has a single source map annotation", () => {
    expect(purged.css.match(/sourceMappingURL/g)).toHaveLength(1);
  });
});
