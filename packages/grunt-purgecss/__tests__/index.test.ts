import { execSync } from "child_process";
import fs from "fs";
import path from "path";

describe("Purgecss grunt plugin", () => {
  const cwd = process.cwd();

  beforeAll(() => {
    process.chdir(__dirname);
    execSync("npx grunt");
  });

  function emptyFolder(directory: string) {
    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err;
        });
      }
    });
  }

  afterAll(() => {
    emptyFolder(`${__dirname}/tmp`);
    process.chdir(cwd);
  });

  const files = ["simple.css", "footer.css", "menu.css", "profile.css"];
  for (const file of files) {
    it(`remove unused css successfully: ${file}`, () => {
      const actual = fs.readFileSync(`${__dirname}/tmp/${file}`).toString();
      const expected = fs
        .readFileSync(`${__dirname}/fixtures/expected/${file}`)
        .toString();
      expect(actual.replace(/\s/g, "")).toBe(expected.replace(/\s/g, ""));
    });
  }
});
