import gulpPurgecss from "../src/";
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
