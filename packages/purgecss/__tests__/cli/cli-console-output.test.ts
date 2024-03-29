import { Command } from "commander";
import { parseCommandOptions, run } from "../../src/bin";
import { CLI_TEST_FOLDER } from "../utils";

describe("PurgeCSS CLI console output", () => {
  const program = parseCommandOptions(new Command());

  it("should log the result if output is not specified", async () => {
    const originalConsoleLog = console.log;
    console.log = jest.fn();
    program.parse([
      "purgecss",
      "",
      "--content",
      `${CLI_TEST_FOLDER}/src/content.html`,
      `${CLI_TEST_FOLDER}/src/*.js`,
      "--css",
      `${CLI_TEST_FOLDER}/src/style.css`,
    ]);
    await run(program);
    expect(console.log).toHaveBeenCalledWith(
      `[{"css":".hello {\\n  color: red;\\n}\\n","file":"${CLI_TEST_FOLDER}/src/style.css"}]`,
    );
    console.log = originalConsoleLog;
  });
});
