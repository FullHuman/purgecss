import * as path from "path";
import fs from "fs";
import webpack, { Configuration, Stats } from "webpack";

function runWebpack(options: Configuration) {
  const compiler = webpack(options);
  return new Promise((resolve, reject) => {
    compiler.run((err: Error, stats: Stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(new Error(stats.toString()));
      resolve(stats);
    });
  });
}

describe("Webpack integration", () => {
  const cwd = process.cwd();
  afterAll(() => {
    process.chdir(cwd);
  });

  const cases: string[] = [
    "path-and-whitelist-functions",
    "simple",
    "simple-with-exclusion"
  ];

  for (const testCase of cases) {
    it(`works with ${testCase} configuration`, async () => {
      const testDirectory = path.resolve(__dirname, "cases", testCase);
      const outputDirectory = path.resolve(__dirname, "js", testCase);
      const expectedDirectory = path.resolve(testDirectory, "expected");

      process.chdir(testDirectory);
      const webpackConfig = require(`${testDirectory}/webpack.config.js`);

      // @ts-ignore
      await runWebpack({
        ...webpackConfig,
        output: {
          path: outputDirectory
        }
      });

      const files = await fs.promises.readdir(expectedDirectory);

      for (const file of files) {
        const filePath = path.join(expectedDirectory, file);
        const actualPath = path.join(outputDirectory, file);

        const actualFile = await readFileOrEmpty(actualPath);
        const expectedFile = await readFileOrEmpty(filePath);

        expect(actualFile).toBe(expectedFile);
      }
    });
  }
});

async function readFileOrEmpty(path: string) {
  let result = "";
  try {
    result = await fs.promises.readFile(path, "utf-8");
  } catch (e) {}
  return result;
}
