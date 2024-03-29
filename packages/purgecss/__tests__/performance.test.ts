import { PurgeCSS } from "../src/index";

describe("performance", () => {
  it("should not suffer from tons of content and css", function () {
    const start = Date.now();
    return new PurgeCSS()
      .purge({
        // Use all of the .js files in node_modules to purge all of the .css
        // files in __tests__/test_examples, including tailwind.css, which is
        // a whopping 908KB of CSS before purging.
        content: ["./node_modules/**/*.js"],
        css: ["./__tests__/test_examples/*/*.css"],
      })
      .then((results) => {
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(
          results.some((result) => {
            return result.file && result.file.endsWith("/tailwind.css");
          }),
        ).toBe(true);
        results.forEach((result) => expect(typeof result.css).toBe("string"));
        console.log("performance test took", Date.now() - start, "ms");
      });
  });
});
