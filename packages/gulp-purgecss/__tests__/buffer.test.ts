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
