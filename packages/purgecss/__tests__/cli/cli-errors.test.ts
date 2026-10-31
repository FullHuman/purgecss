import { spawnSync } from "child_process";
import { promises as asyncFs } from "fs";
import * as path from "path";
import { main } from "../../src/bin";
import { ERROR_CONFIG_FILE_LOADING } from "../../src/constants";
import { CLI_TEST_FOLDER } from "../utils";

describe("PurgeCSS CLI errors", () => {
  const tempFolder = path.resolve(CLI_TEST_FOLDER, ".temp/errors");
  const invalidCSS = path.resolve(tempFolder, "invalid.css");

  beforeAll(async () => {
    await asyncFs.mkdir(tempFolder, { recursive: true });
    await asyncFs.writeFile(invalidCSS, ".hello { color: red;");
    // a file used as a folder, so the output can't be written
    await asyncFs.writeFile(path.resolve(tempFolder, "not-a-folder"), "");
  });

  afterAll(async () => {
    await asyncFs.rm(tempFolder, { recursive: true, force: true });
  });

  it("should log the error and exit with code 1 if the css is invalid", async () => {
    const originalArgv = process.argv;
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const exit = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);
    process.argv = [
      "node",
      "purgecss",
      "--content",
      `${CLI_TEST_FOLDER}/src/content.html`,
      "--css",
      invalidCSS,
    ];
    try {
      await main();
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining("Unclosed block"),
      );
      expect(exit).toHaveBeenCalledWith(1);
    } finally {
      process.argv = originalArgv;
      jest.restoreAllMocks();
    }
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
        expect.stringMatching(/ENOTDIR|ENOENT/),
      ]);
    });
  });
});
