import es from 'event-stream';
import internal, { PassThrough } from "stream";
import File from "vinyl";
import gulpPurgecss from "../src/";

describe("gulp-purgecss with stream", () => {
  let myGulpPurgecss: internal.Transform;
  let fileTest: File.StreamFile;
  let fakeStream: internal.PassThrough;

  beforeEach(() => {
    fakeStream = new PassThrough();
    fakeStream.write(Buffer.from(".unused, .used,"));
    fakeStream.write(Buffer.from(" a { color:"));
    fakeStream.write(Buffer.from(" blue; }"));
    fakeStream.end();
    fileTest = new File({
      contents: fakeStream,
    });
    myGulpPurgecss = gulpPurgecss({
      content: ["./packages/gulp-purgecss/__tests__/test.html"],
    });
  });

//   it("returns a stream", (done) => {
//     expect.assertions(1);
//     myGulpPurgecss.write(fileTest);
//     myGulpPurgecss.once("data", (file) => {
//       expect(file.isStream()).toBe(true);
//       done();
//     });
//   });

  it("returns a purged css stream", (done) => {
    expect.assertions(3);
    myGulpPurgecss.write(fileTest);
    myGulpPurgecss.on("data", (file: File.StreamFile) => {
      file.contents.pipe(
        es.wait((_err: any, data: string) => {
          expect(data.includes("used")).toBe(true);
          expect(data.includes("unused")).toBe(false);
          expect(data.includes("a")).toBe(true);
          done();
        })
      );
    });
    // myGulpPurgecss.on("end", done);
  });

});
