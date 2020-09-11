import { promisify } from "util";
import { exec } from "child_process";
import path from "path";

const asyncExec = promisify(exec);

describe("PurgeCSS CLI", () => {
  const purgeCSSExecutable = path.resolve(__dirname, "./../bin/purgecss.js");
  const testFolder = path.resolve(__dirname, "./test_examples/cli/simple/");
  it("should print the correct output", async () => {
    const response = await asyncExec(
      `${purgeCSSExecutable} --content ${testFolder}/src/content.html ${testFolder}/src/*.js --css ${testFolder}/src/style.css`
    );
    const result = JSON.parse(response.stdout);
    expect(result[0].css).toBe(".hello {\n  color: red;\n}\n");
  });
});
