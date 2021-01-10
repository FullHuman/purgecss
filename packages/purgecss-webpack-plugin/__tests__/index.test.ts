import * as path from "path";
import fs from "fs";
import { promisify } from "util";
import webpack, { Configuration } from "webpack";

const asyncFs = {
  readdir: promisify(fs.readdir),
};

function runWebpack(
  options: Configuration
): Promise<webpack.Stats | undefined> {
  const compiler = webpack(options);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats?.hasErrors()) reject(new Error(stats.toString()));
      resolve(stats);
    });
  });
}

async function readFileOrEmpty(path: string): Promise<string> {
  try {
    return await fs.promises.readFile(path, "utf-8");
    // eslint-disable-next-line no-empty
  } catch (e) {
    return "";
  }
}

describe("Webpack integration", () => {
  const cwd = process.cwd();
  afterAll(() => {
    process.chdir(cwd);
  });

  const cases: string[] = [
    "path-and-safelist-functions",
    "simple",
    "simple-with-exclusion",
  ];

  for (const testCase of cases) {
    it(`works with ${testCase} configuration`, async () => {
      const testDirectory = path.resolve(__dirname, "cases", testCase);
      const outputDirectory = path.resolve(__dirname, "js", testCase);
      const expectedDirectory = path.resolve(testDirectory, "expected");

      process.chdir(testDirectory);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const webpackConfig = require(`${testDirectory}/webpack.config.js`);

      await runWebpack({
        ...webpackConfig,
        output: {
          path: outputDirectory,
        },
      });

      const files = await asyncFs.readdir(expectedDirectory);

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
