import { spawnSync } from "child_process";
import { promises as asyncFs } from "fs";
import * as path from "path";
import { setOptions } from "../../src";
import { main } from "../../src/bin";
import { ERROR_CONFIG_FILE_LOADING } from "../../src/constants";
import { CLI_TEST_FOLDER } from "../utils";

describe("PurgeCSS CLI errors", () => {
  const tempFolder = path.resolve(CLI_TEST_FOLDER, ".temp/errors");
  const invalidCSS = path.resolve(tempFolder, "invalid.css");
  const throwingConfig = path.resolve(tempFolder, "throwing.config.cjs");
  const throwingExtractorConfig = path.resolve(
    tempFolder,
    "throwing-extractor.config.cjs",
  );

  beforeAll(async () => {
    await asyncFs.mkdir(tempFolder, { recursive: true });
    await asyncFs.writeFile(invalidCSS, ".hello { color: red;");
    // config files throwing values that are not errors
    await asyncFs.writeFile(throwingConfig, 'throw "oops";');
    await asyncFs.writeFile(
      throwingExtractorConfig,
      `module.exports = {
        content: [${JSON.stringify(`${CLI_TEST_FOLDER}/src/content.html`)}],
        css: [${JSON.stringify(`${CLI_TEST_FOLDER}/src/style.css`)}],
        extractors: [
          {
            extensions: ["html"],
            extractor: () => {
              throw "extractor failed";
            },
          },
        ],
      };`,
    );
    // a file used as a folder, so the output can't be written
    await asyncFs.writeFile(path.resolve(tempFolder, "not-a-folder"), "");
  });

  afterAll(async () => {
    await asyncFs.rm(tempFolder, { recursive: true, force: true });
  });

  /**
   * Run the CLI in the current process, and return what it printed on stderr
   * and the exit codes it was called with
   */
  async function runMain(args: string[]) {
    const originalArgv = process.argv;
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const exit = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);
    process.argv = ["node", "purgecss", ...args];
    try {
      await main();
      return {
        errors: consoleError.mock.calls,
        exitCodes: exit.mock.calls.map(([code]) => code),
      };
    } finally {
      process.argv = originalArgv;
      jest.restoreAllMocks();
    }
  }

  it("should log the error and exit with code 1 if the css is invalid", async () => {
    expect.assertions(3);
    const { errors, exitCodes } = await runMain([
      "--content",
      `${CLI_TEST_FOLDER}/src/content.html`,
      "--css",
      invalidCSS,
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0][0]).toContain("Unclosed block");
    expect(exitCodes).toEqual([1]);
  });

  it("should log the value thrown by a config file if it is not an error", async () => {
    expect.assertions(2);
    const { errors, exitCodes } = await runMain(["--config", throwingConfig]);
    expect(errors).toEqual([[`${ERROR_CONFIG_FILE_LOADING} oops`]]);
    expect(exitCodes).toEqual([1]);
  });

  it("should log the value thrown by an extractor if it is not an error", async () => {
    expect.assertions(2);
    const { errors, exitCodes } = await runMain([
      "--config",
      throwingExtractorConfig,
    ]);
    expect(errors).toEqual([["extractor failed"]]);
    expect(exitCodes).toEqual([1]);
  });

  it("should keep the value thrown by a config file as the cause of the error", async () => {
    expect.assertions(1);
    await expect(setOptions(throwingConfig)).rejects.toMatchObject({
      message: `${ERROR_CONFIG_FILE_LOADING} oops`,
      cause: "oops",
    });
  });

  // Uses the built CLI: errors thrown by Node.js (missing module, file system)
  // come from another realm than Jest's, so they are not `instanceof Error`
  // in the tests.
  describe("built CLI", () => {
    const binPath = path.join(__dirname, "../../bin/purgecss.js");

    function runCLI(args: string[]) {
      return spawnSync(process.execPath, [binPath, ...args], {
        encoding: "utf8",
      });
    }

    it("should print only the error message if the config file can't be loaded", () => {
      const result = runCLI([
        "--config",
        path.resolve(tempFolder, "missing.config.js"),
      ]);
      expect(result.status).toBe(1);
      expect(result.stderr.trim().split("\n")).toEqual([
        expect.stringContaining(ERROR_CONFIG_FILE_LOADING),
      ]);
    });

    it("should exit with code 1 if the output file can't be written", () => {
      const result = runCLI([
        "--content",
        `${CLI_TEST_FOLDER}/src/content.html`,
        "--css",
        `${CLI_TEST_FOLDER}/src/style.css`,
        "--output",
        path.resolve(tempFolder, "not-a-folder/output-style.css"),
      ]);
      expect(result.status).toBe(1);
      expect(result.stderr.trim().split("\n")).toEqual([
        expect.stringMatching(/EEXIST|ENOTDIR|ENOENT/),
      ]);
    });
  });
});
