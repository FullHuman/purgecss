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

  it("should not suffer from css variables redefined in many rules", async () => {
    // every rule redefines `--x`, which depends on `--y`, also redefined.
    // Linking the declarations to each other made this quadratic (or worse)
    // and it took seconds and gigabytes of memory for this many rules
    const classes = Array.from({ length: 20000 }, (_, i) => `c${i}`);
    const css = classes
      .map(
        (name, i) =>
          `.${name} { --y: ${i}px; --x: var(--y); color: var(--x); }`,
      )
      .join("\n");
    const [result] = await new PurgeCSS().purge({
      content: [{ raw: classes.join(" "), extension: "html" }],
      css: [{ raw: `${css}\n:root { --unused: 0; }` }],
      variables: true,
    });
    expect(result.css).toContain(".c19999 { --y: 19999px; --x: var(--y);");
    expect(result.css).not.toContain("--unused");
  });
});
