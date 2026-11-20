import { promises as fs } from "fs";
import gulp from "gulp";
import * as os from "os";
import * as path from "path";
import PluginError from "plugin-error";
import { pipeline } from "stream/promises";
import gulpPurgecss from "../src/";

/**
 * The task of the "Errors" section of the documentation, run by gulp
 */
function runTask(
  css: string,
  output: string,
  srcOptions?: { buffer: boolean },
): Promise<void> {
  const task = () => {
    return pipeline(
      // a glob is written with forward slashes, also on Windows
      gulp.src(css.split(path.sep).join("/"), srcOptions),
      gulpPurgecss({
        content: ["./__tests__/test.html"],
      }),
      gulp.dest(output),
    );
  };
  return new Promise((resolve, reject) => {
    gulp.series(task)((error) => (error ? reject(error) : resolve()));
  });
}

describe("gulp-purgecss in a gulp task written with pipeline", () => {
  let directory: string;
  let output: string;
  // gulp emits the error of a failed task, as an EventEmitter that throws the
  // errors that have no listener; the gulp CLI listens to them to log them
  const onTaskError = () => undefined;

  beforeAll(() => {
    gulp.on("error", onTaskError);
  });

  afterAll(() => {
    gulp.off("error", onTaskError);
  });

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "gulp-purgecss-"));
    output = path.join(directory, "build");
    await fs.writeFile(
      path.join(directory, "style.css"),
      ".unused { color: red; }\n.used { color: blue; }\n",
    );
    await fs.writeFile(path.join(directory, "invalid.css"), ".used { color:");
  });

  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  it.each([
    ["buffered files", { buffer: true }],
    ["streamed files", { buffer: false }],
  ])("writes the purged css with %s", async (_mode, srcOptions) => {
    await runTask(path.join(directory, "style.css"), output, srcOptions);

    const result = await fs.readFile(path.join(output, "style.css"), "utf-8");
    expect(result).toBe(".used { color: blue; }\n");
  });

  it.each([
    ["buffered files", { buffer: true }],
    ["streamed files", { buffer: false }],
  ])(
    "fails the task with the plugin error with %s",
    async (_mode, srcOptions) => {
      const error: PluginError = await runTask(
        path.join(directory, "invalid.css"),
        output,
        srcOptions,
      ).then(
        () => {
          throw new Error("the task did not fail");
        },
        (e) => e,
      );

      expect(error.plugin).toBe("gulp-purgecss");
      expect(error.message).toContain("Unclosed block");
    },
  );
});
