import { Command } from "commander";
import { promises as asyncFs } from "fs";
import * as path from "path";
import { parseCommandOptions, run } from "../../src/bin";
import { CLI_TEST_FOLDER } from "../utils";

describe("PurgeCSS CLI file output", () => {
  const program = parseCommandOptions(new Command());

  beforeAll(async () => {
    const tempFolder = path.resolve(CLI_TEST_FOLDER, ".temp");
    try {
      await asyncFs.access(tempFolder);
    } catch {
      await asyncFs.mkdir(tempFolder, { recursive: true });
    }
  });

  it("should output the result into a file if there's one result", async () => {
    program.parse([
      "purgecss",
      "",
      "--content",
      `${CLI_TEST_FOLDER}/src/content.html`,
      `${CLI_TEST_FOLDER}/src/*.js`,
      "--css",
      `${CLI_TEST_FOLDER}/src/style.css`,
      "--output",
      `${CLI_TEST_FOLDER}/.temp/output-style.css`,
    ]);
    await run(program);
    const actual = (
      await asyncFs.readFile(`${CLI_TEST_FOLDER}/.temp/output-style.css`)
    ).toString();
    expect(actual).toBe(".hello {\n  color: red;\n}\n");
  });
});
