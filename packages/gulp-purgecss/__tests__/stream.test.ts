import es from "event-stream";
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
      content: ["./__tests__/test.html"],
    });
  });

  it("returns a stream", (done) => {
    expect.assertions(1);
    myGulpPurgecss.write(fileTest);
    myGulpPurgecss.once("data", (file) => {
      expect(file.isStream()).toBe(true);
      done();
    });
  });

  it("returns a purged css stream", (done) => {
    expect.assertions(3);
    myGulpPurgecss.write(fileTest);
    myGulpPurgecss.on("data", (file: File.StreamFile) => {
      file.contents.pipe(
        es.wait((_err: unknown, data: string) => {
          expect(data.includes("used")).toBe(true);
          expect(data.includes("unused")).toBe(false);
          expect(data.includes("a")).toBe(true);
          done();
        }),
      );
    });
  });
});

/**
 * Contents of a file read by gulp 5 with `buffer: false`: vinyl-fs 4 reads it
 * with a streamx stream, which does not end the destination when it is piped
 * after it has ended
 */
class StreamxLikePassThrough extends PassThrough {
  pipe<T extends NodeJS.WritableStream>(destination: T): T {
    if (this.readableEnded) return destination;
    return super.pipe(destination);
  }
}

describe("gulp-purgecss with a stream that has ended", () => {
  it("ends the purged css stream", (done) => {
    const contents = new StreamxLikePassThrough();
    contents.end(
      Buffer.from(".unused { color: red; }\n.used { color: blue; }\n"),
    );
    const myGulpPurgecss = gulpPurgecss({
      content: ["./__tests__/test.html"],
    });

    myGulpPurgecss.once("error", done);
    myGulpPurgecss.once("data", (file: File.StreamFile) => {
      file.contents.pipe(
        es.wait((_err: unknown, data: Buffer) => {
          expect(data.toString()).toBe(".used { color: blue; }\n");
          done();
        }),
      );
    });
    myGulpPurgecss.write(new File({ contents }));
  });
});
