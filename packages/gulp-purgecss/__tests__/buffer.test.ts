import gulpPurgecss from "../src/";
import PluginError from "plugin-error";
import File from "vinyl";
import internal from "stream";

describe("gulp-purgecss with buffer", () => {
  let myGulpPurgecss: internal.Transform;
  let fileTest: File.BufferFile;
  beforeEach(() => {
    fileTest = new File({
      contents: Buffer.from(".unused, .used, a { color: blue; }", "utf-8"),
    });

    myGulpPurgecss = gulpPurgecss({
      content: ["./__tests__/test.html"],
    });
  });

  it("returns a buffer", (done) => {
    myGulpPurgecss.write(fileTest);
    myGulpPurgecss.once("data", (file) => {
      expect(file.isBuffer()).toBe(true);
      done();
    });
  });

  it("returns a purified css buffer", (done) => {
    myGulpPurgecss.write(fileTest);
    myGulpPurgecss.once("data", (file) => {
      const result = file.contents.toString("utf8");
      expect(result.includes("used")).toBe(true);
      expect(result.includes("unused")).toBe(false);
      expect(result.includes("a")).toBe(true);
      done();
    });
  });
});

describe("gulp-purgecss with buffer and the rejected option", () => {
  it("returns the rejected selectors instead of the purified css", (done) => {
    const fileTest = new File({
      contents: Buffer.from(
        ".unused { color: blue; } .used { color: red; } .also-unused { color: green; }",
        "utf-8",
      ),
    });
    const myGulpPurgecss = gulpPurgecss({
      content: ["./__tests__/test.html"],
      rejected: true,
    });

    myGulpPurgecss.write(fileTest);
    myGulpPurgecss.once("data", (file) => {
      const result = file.contents.toString("utf8");
      expect(result).toBe(".unused {}\n.also-unused {}");
      done();
    });
  });
});

describe("gulp-purgecss with buffer and invalid css", () => {
  it("emits a gulp-purgecss plugin error", (done) => {
    const fileTest = new File({
      contents: Buffer.from(".used { color: blue;", "utf-8"),
    });
    const myGulpPurgecss = gulpPurgecss({
      content: ["./__tests__/test.html"],
    });

    myGulpPurgecss.once("error", (error: PluginError) => {
      expect(error.plugin).toBe("gulp-purgecss");
      expect(error.message).toContain("Unclosed block");
      done();
    });
    myGulpPurgecss.write(fileTest);
  });
});

describe("gulp-purgecss with buffer and source maps", () => {
  const css = ".unused { color: blue; }\n.used { color: red; }\n";

  function createFile(sourceMap: object): File.BufferFile {
    const fileTest = new File({
      cwd: "/project",
      base: "/project/src",
      path: "/project/src/css/style.css",
      contents: Buffer.from(css, "utf-8"),
    }) as File.BufferFile;
    fileTest.sourceMap = sourceMap;
    return fileTest;
  }

  it("applies the source map of the purged css", (done) => {
    // source map as initialized by gulp-sourcemaps
    const fileTest = createFile({
      version: 3,
      file: "css/style.css",
      names: [],
      mappings: "",
      sources: ["css/style.css"],
      sourcesContent: [css],
    });
    const myGulpPurgecss = gulpPurgecss({
      content: ["./__tests__/test.html"],
    });

    myGulpPurgecss.once("error", done);
    myGulpPurgecss.once("data", (file: File.BufferFile) => {
      expect(file.contents.toString("utf8")).toBe(".used { color: red; }\n");
      expect(file.sourceMap.file).toBe("css/style.css");
      expect(file.sourceMap.sources).toEqual(["css/style.css"]);
      // the first line of the purged css comes from the second line
      expect(file.sourceMap.mappings).toMatch(/^AACA/);
      done();
    });
    myGulpPurgecss.write(fileTest);
  });

  it("chains the source map with the previous one", (done) => {
    // previous step mapped the second line of the css to the fifth line of
    // the scss file
    const fileTest = createFile({
      version: 3,
      file: "css/style.css",
      names: [],
      mappings: "AAAA;AAIA",
      sources: ["scss/style.scss"],
    });
    const myGulpPurgecss = gulpPurgecss({
      content: ["./__tests__/test.html"],
    });

    myGulpPurgecss.once("error", done);
    myGulpPurgecss.once("data", (file: File.BufferFile) => {
      expect(file.sourceMap.sources).toEqual(["scss/style.scss"]);
      // the first line of the purged css comes from the fifth line of the scss
      expect(file.sourceMap.mappings).toMatch(/^AAIA/);
      done();
    });
    myGulpPurgecss.write(fileTest);
  });
});
