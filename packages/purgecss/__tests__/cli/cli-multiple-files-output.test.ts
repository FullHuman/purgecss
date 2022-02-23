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
      `${CLI_TEST_FOLDER}/src/style2.css`,
      "--output",
      `${CLI_TEST_FOLDER}/.temp`,
    ]);
    await run(program);
    const outputStyle = (
      await asyncFs.readFile(`${CLI_TEST_FOLDER}/.temp/style.css`)
    ).toString();
    const outputStyle2 = (
      await asyncFs.readFile(`${CLI_TEST_FOLDER}/.temp/style2.css`)
    ).toString();
    expect(outputStyle).toBe(".hello {\n  color: red;\n}\n");
    expect(outputStyle2).toBe(".world {\n  color: green;\n}\n");
  });
});
