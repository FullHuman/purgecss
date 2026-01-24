import { Command } from "commander";
import { promises as asyncFs } from "fs";
import * as path from "path";
import { parseCommandOptions, run } from "../../src/bin";

const CLI_TEST_FOLDER = path.resolve(__dirname, "../test_examples/cli/nested/");

describe("PurgeCSS CLI preserve paths", () => {
  const tempFolder = path.resolve(CLI_TEST_FOLDER, ".temp");

  beforeAll(async () => {
    try {
      await asyncFs.access(tempFolder);
      // Clean up temp folder if it exists
      await asyncFs.rm(tempFolder, { recursive: true });
    } catch {
      // Folder doesn't exist, that's fine
    }
    await asyncFs.mkdir(tempFolder, { recursive: true });
  });

  afterAll(async () => {
    try {
      await asyncFs.rm(tempFolder, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should flatten folder hierarchy by default", async () => {
    const program = parseCommandOptions(new Command());
    program.parse([
      "purgecss",
      "",
      "--content",
      `${CLI_TEST_FOLDER}/src/content.html`,
      "--css",
      `${CLI_TEST_FOLDER}/src/root.css`,
      `${CLI_TEST_FOLDER}/src/level1/middle.css`,
      `${CLI_TEST_FOLDER}/src/level1/level2/nested.css`,
      "--output",
      `${tempFolder}/flattened`,
    ]);
    await run(program);

    // All files should be in the same directory (flattened)
    const rootCss = (
      await asyncFs.readFile(`${tempFolder}/flattened/root.css`)
    ).toString();
    const middleCss = (
      await asyncFs.readFile(`${tempFolder}/flattened/middle.css`)
    ).toString();
    const nestedCss = (
      await asyncFs.readFile(`${tempFolder}/flattened/nested.css`)
    ).toString();

    expect(rootCss).toContain(".root-class");
    expect(rootCss).not.toContain(".unused-root");
    expect(middleCss).toContain(".middle-class");
    expect(middleCss).not.toContain(".unused-middle");
    expect(nestedCss).toContain(".nested-class");
    expect(nestedCss).not.toContain(".unused-nested");
  });

  it("should preserve folder hierarchy when --preserve-paths is used", async () => {
    const program = parseCommandOptions(new Command());
    program.parse([
      "purgecss",
      "",
      "--content",
      `${CLI_TEST_FOLDER}/src/content.html`,
      "--css",
      `${CLI_TEST_FOLDER}/src/root.css`,
      `${CLI_TEST_FOLDER}/src/level1/middle.css`,
      `${CLI_TEST_FOLDER}/src/level1/level2/nested.css`,
      "--output",
      `${tempFolder}/preserved`,
      "--preserve-paths",
    ]);
    await run(program);

    // Files should preserve their original path structure
    const rootCss = (
      await asyncFs.readFile(
        `${tempFolder}/preserved/${CLI_TEST_FOLDER}/src/root.css`,
      )
    ).toString();
    const middleCss = (
      await asyncFs.readFile(
        `${tempFolder}/preserved/${CLI_TEST_FOLDER}/src/level1/middle.css`,
      )
    ).toString();
    const nestedCss = (
      await asyncFs.readFile(
        `${tempFolder}/preserved/${CLI_TEST_FOLDER}/src/level1/level2/nested.css`,
      )
    ).toString();

    expect(rootCss).toContain(".root-class");
    expect(rootCss).not.toContain(".unused-root");
    expect(middleCss).toContain(".middle-class");
    expect(middleCss).not.toContain(".unused-middle");
    expect(nestedCss).toContain(".nested-class");
    expect(nestedCss).not.toContain(".unused-nested");
  });
});
