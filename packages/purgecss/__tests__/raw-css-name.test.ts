import { PurgeCSS } from "../src/index";

describe("Raw CSS optional filename", () => {
  it("Should return the `name` in the result's `file` property when provided for raw CSS option", async () => {
    return new PurgeCSS()
      .purge({
        content: [
          { raw: "<html><body><h1></h1></body></html>", extension: "html" },
        ],
        css: [
          { raw: "body{margin:0;}", name: "test.css" },
          { raw: "h1{margin:1;}" },
        ],
      })
      .then((results) => {
        expect(results.length).toBe(2);
        expect(
          results.some((result) => {
            return result.file && result.file.endsWith("test.css");
          })
        ).toBe(true);
        results.forEach((result) => expect(typeof result.css).toBe("string"));
      });
  });
  it("Should NOT return the `name` in the result's `file` property when NOT provided for raw CSS option", async () => {
    return new PurgeCSS()
      .purge({
        content: [
          { raw: "<html><body><h1></h1></body></html>", extension: "html" },
        ],
        css: [{ raw: "body{margin:0;}" }],
      })
      .then((results) => {
        expect(results.length).toBe(1);
        expect(results[0].file).toBe(undefined);
        results.forEach((result) => expect(typeof result.css).toBe("string"));
      });
  });
});
