import { Command } from "commander";
import { promises as asyncFs } from "fs";
import * as path from "path";
import { Readable } from "stream";
import { parseCommandOptions, run } from "../../src/bin";
import { CLI_TEST_FOLDER } from "../utils";

describe("PurgeCSS CLI stdin", () => {
  const tempFolder = path.resolve(CLI_TEST_FOLDER, ".temp/stdin");
  const unnamedRawCSSConfig = path.resolve(tempFolder, "unnamed.config.cjs");
  const namedRawCSSConfig = path.resolve(tempFolder, "named.config.cjs");

  beforeAll(async () => {
    await asyncFs.mkdir(tempFolder, { recursive: true });
    const content = JSON.stringify(`${CLI_TEST_FOLDER}/src/content.html`);
    await asyncFs.writeFile(
      unnamedRawCSSConfig,
      `module.exports = {
        content: [${content}],
        css: [{ raw: ".hello { color: red; } .unused { color: blue; }" }],
      };`,
    );
    await asyncFs.writeFile(
      namedRawCSSConfig,
      `module.exports = {
        content: [${content}],
        css: [{ raw: ".hello { color: red; } .unused { color: blue; }", name: "named.css" }],
      };`,
    );
  });

  afterAll(async () => {
    await asyncFs.rm(tempFolder, { recursive: true, force: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Run the CLI with the given arguments and standard input
   */
  async function runWithStdin(args: string[], stdin = "") {
    jest
      .spyOn(process, "stdin", "get")
      .mockReturnValue(
        Readable.from([Buffer.from(stdin)]) as unknown as typeof process.stdin,
      );
    // a new program for each run, commander keeps the options of a parse
    const program = parseCommandOptions(new Command());
    program.parse(["purgecss", "", ...args]);
    await run(program);
  }

  it("should read the content from stdin", async () => {
    const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
    await runWithStdin(
      ["--content", "-", "--css", `${CLI_TEST_FOLDER}/src/style.css`],
      '<div class="safelisted"></div>',
    );
    expect(consoleLog).toHaveBeenCalledWith(
      `[{"css":".safelisted {\\n  color: green;\\n}\\n","file":"${CLI_TEST_FOLDER}/src/style.css"}]`,
    );
  });

  it("should read the css from stdin", async () => {
    const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
    await runWithStdin(
      ["--content", `${CLI_TEST_FOLDER}/src/content.html`, "--css", "-"],
      ".hello { color: red; } .unused { color: blue; }",
    );
    expect(consoleLog).toHaveBeenCalledWith(
      `[{"css":".hello { color: red; }"}]`,
    );
  });

  it("should write the css read from stdin to an output file", async () => {
    const outputFile = path.resolve(tempFolder, "output.css");
    await runWithStdin(
      [
        "--content",
        `${CLI_TEST_FOLDER}/src/content.html`,
        "--css",
        "-",
        "--output",
        outputFile,
      ],
      ".hello { color: red; } .unused { color: blue; }",
    );
    expect(await asyncFs.readFile(outputFile, "utf-8")).toBe(
      ".hello { color: red; }",
    );
  });

  it("should not write the css read from stdin to an output folder", async () => {
    const outputFolder = path.resolve(tempFolder, "stdin-output");
    await expect(
      runWithStdin(
        [
          "--content",
          `${CLI_TEST_FOLDER}/src/content.html`,
          "--css",
          "-",
          "--output",
          outputFolder,
        ],
        ".hello { color: red; }",
      ),
    ).rejects.toThrow(
      `Cannot write the purged CSS to the folder "${outputFolder}"`,
    );
    // no file named "undefined" is written
    await expect(asyncFs.readdir(outputFolder)).rejects.toThrow("ENOENT");
  });

  it("should not write a raw css without a name to an output folder", async () => {
    const outputFolder = path.resolve(tempFolder, "unnamed-output");
    await expect(
      runWithStdin([
        "--config",
        unnamedRawCSSConfig,
        "--output",
        outputFolder,
        "--preserve-paths",
      ]),
    ).rejects.toThrow("give the raw CSS a name");
    await expect(asyncFs.readdir(outputFolder)).rejects.toThrow("ENOENT");
  });

  it("should write a raw css with a name to an output folder", async () => {
    const outputFolder = path.resolve(tempFolder, "named-output");
    await runWithStdin([
      "--config",
      namedRawCSSConfig,
      "--output",
      outputFolder,
    ]);
    expect(
      await asyncFs.readFile(path.resolve(outputFolder, "named.css"), "utf-8"),
    ).toBe(".hello { color: red; }");
  });
});
