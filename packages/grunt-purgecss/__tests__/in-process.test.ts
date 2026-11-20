import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import grunt from "grunt";
import gruntPurgeCSS from "../src/index";

// `index.test.ts` runs the built `tasks/purgecss.js` in a child process, which
// jest cannot instrument. These tests register the task from `src/` and run it
// with grunt inside the jest process, so that the source is covered.

// `grunt.tasks` and `grunt.log.muted` are missing from `@types/grunt`
type GruntLib = IGrunt & {
  tasks(
    tasks: string[],
    options: Record<string, unknown>,
    done: () => void,
  ): void;
  log: { muted: boolean };
};
const gruntLib = grunt as GruntLib;

const fixtures = "__tests__/fixtures";
const simpleOptions = { content: [`./${fixtures}/src/simple/**/*.html`] };
const multiOptions = { content: [`./${fixtures}/src/multi/*.html`] };
const missingSource = `${fixtures}/src/does-not-exist.css`;

function withoutSpaces(css: string): string {
  return css.replace(/\s/g, "");
}

function expected(file: string): string {
  return withoutSpaces(
    fs.readFileSync(`${fixtures}/expected/${file}`).toString(),
  );
}

describe("Purgecss grunt plugin, task loaded from src", () => {
  // `index.test.ts` empties `__tests__/tmp` when it ends and jest can run both
  // files at the same time, so the files of these tests go somewhere else
  let tmp: string;
  let failWarn: jest.SpyInstance;
  let logError: jest.SpyInstance;
  let logWarn: jest.SpyInstance;
  let fileWrite: jest.SpyInstance;

  function dest(file: string): string {
    return path.join(tmp, file);
  }

  function actual(file: string): string {
    return withoutSpaces(fs.readFileSync(dest(file)).toString());
  }

  /**
   * Run one target of the purgecss task. The config is replaced on every run
   * and no Gruntfile is loaded, so a run doesn't depend on the previous ones.
   */
  function run(target: Record<string, unknown>): Promise<void> {
    grunt.initConfig({ purgecss: { target } });
    return new Promise((resolve) => {
      gruntLib.tasks(["purgecss:target"], { gruntfile: false }, resolve);
    });
  }

  function expectTaskToSucceed(): void {
    expect(failWarn).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  }

  function expectTaskToFailWith(message: string): void {
    expect(logError).toHaveBeenCalledWith(message);
    expect(failWarn).toHaveBeenCalledTimes(1);
    expect(failWarn).toHaveBeenCalledWith(
      new Error('Task "purgecss:target" failed.'),
      expect.any(Number),
    );
  }

  beforeAll(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "grunt-purgecss-"));
    gruntPurgeCSS(grunt);
  });

  afterAll(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  beforeEach(() => {
    gruntLib.log.muted = true;
    // grunt exits the process on a warning, unless it runs with --force
    failWarn = jest
      .spyOn(grunt.fail, "warn")
      .mockImplementation(() => undefined);
    logError = jest.spyOn(grunt.log, "error");
    logWarn = jest.spyOn(grunt.log, "warn");
    fileWrite = jest.spyOn(grunt.file, "write");
  });

  afterEach(() => {
    jest.restoreAllMocks();
    gruntLib.log.muted = false;
  });

  it("writes one purged file per destination", async () => {
    const files = ["menu.css", "profile.css", "footer.css"];
    await run({
      options: simpleOptions,
      files: {
        ...Object.fromEntries(
          files.map((file) => [dest(file), [`${fixtures}/src/${file}`]]),
        ),
        [dest("simple.css")]: [`${fixtures}/src/simple/simple.css`],
      },
    });

    expectTaskToSucceed();
    for (const file of [...files, "simple.css"]) {
      expect(actual(file)).toBe(expected(file));
    }
  });

  it("joins the purged css of several source files", async () => {
    await run({
      options: multiOptions,
      files: {
        [dest("multi.css")]: [
          `${fixtures}/src/multi/a.css`,
          `${fixtures}/src/multi/b.css`,
        ],
      },
    });

    expectTaskToSucceed();
    expect(actual("multi.css")).toBe(expected("multi.css"));
  });

  it("fails when none of the source files exists", async () => {
    await run({
      options: multiOptions,
      files: { [dest("missing.css")]: [missingSource] },
    });

    expectTaskToFailWith(`No source files found for "${dest("missing.css")}".`);
    expect(fileWrite).not.toHaveBeenCalled();
    expect(fs.existsSync(dest("missing.css"))).toBe(false);
  });

  it("fails when a file entry has no source", async () => {
    await run({
      options: multiOptions,
      files: [{ dest: dest("no-source.css") }],
    });

    expectTaskToFailWith(
      `No source files found for "${dest("no-source.css")}".`,
    );
    expect(fileWrite).not.toHaveBeenCalled();
    expect(fs.existsSync(dest("no-source.css"))).toBe(false);
  });

  it("warns about a missing source file and purges the other ones", async () => {
    await run({
      options: simpleOptions,
      files: [
        {
          src: [`${fixtures}/src/simple/simple.css`, missingSource],
          dest: dest("partial.css"),
          // without nonull, grunt drops the missing file before the task runs
          nonull: true,
        },
      ],
    });

    expectTaskToSucceed();
    expect(logWarn).toHaveBeenCalledTimes(1);
    expect(logWarn).toHaveBeenCalledWith(
      `Source file "${missingSource}" not found.`,
    );
    expect(actual("partial.css")).toBe(expected("simple.css"));
  });

  it("fails when a file entry has no destination", async () => {
    await run({
      options: simpleOptions,
      files: [{ src: [`${fixtures}/src/simple/simple.css`] }],
    });

    expectTaskToFailWith("Destination file not found");
    expect(fileWrite).not.toHaveBeenCalled();
  });
});
