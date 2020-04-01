import { execSync } from "child_process";
import fs from "fs";

describe("Purgecss grunt plugin", () => {
  const cwd = process.cwd();

  beforeAll(() => {
    process.chdir(__dirname);
    execSync("npx grunt");
  });

  afterAll(() => {
    process.chdir(cwd);
  });

  const files = ["simple.css"];
  for (const file of files) {
    it(`remove unused css successfully: ${file}`, () => {
      const actual = fs.readFileSync(`${__dirname}/tmp/${file}`).toString();
      const expected = fs
        .readFileSync(`${__dirname}/fixtures/expected/${file}`)
        .toString();
      expect(actual).toBe(expected);
    });
  }
});
