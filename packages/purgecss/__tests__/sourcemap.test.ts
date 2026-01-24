import { PurgeCSS } from "../src/";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("source map option", () => {
  it("contains the source map inlined in the CSS file", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}others/remove_unused.js`],
      css: [`${ROOT_TEST_EXAMPLES}others/remove_unused.css`],
      sourceMap: true,
    });

    expect(resultsPurge[0].css).toContain(
      "sourceMappingURL=data:application/json;base64",
    );
  });

  it("contains the source map separately when setting inline to false", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}others/remove_unused.js`],
      css: [`${ROOT_TEST_EXAMPLES}others/remove_unused.css`],
      sourceMap: {
        inline: false,
      },
    });

    // When from and to are the same file (no explicit to), the source is just the filename
    expect(resultsPurge[0].sourceMap).toContain(
      'sources":["remove_unused.css"]',
    );
    expect(resultsPurge[0].sourceMap).toContain('"file":"remove_unused.css"');
  });

  it("uses correct file field when 'to' option is specified", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}others/remove_unused.js`],
      css: [`${ROOT_TEST_EXAMPLES}others/remove_unused.css`],
      sourceMap: {
        inline: false,
        to: "output.css",
      },
    });

    // When 'to' is specified, the file field should match
    expect(resultsPurge[0].sourceMap).toContain('"file":"output.css"');
  });

  it("preserves relative source paths from preprocessor source maps", async () => {
    // This test simulates a CSS file compiled from Stylus with an inline source map
    // The source map has a relative path "../stylus/styles.styl"
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}sourcemap/content.html`],
      css: [`${ROOT_TEST_EXAMPLES}sourcemap/css/styles.css`],
      sourceMap: true,
    });

    // Decode the inline source map from the output
    const css = resultsPurge[0].css;
    const match = css.match(
      /sourceMappingURL=data:application\/json;base64,([A-Za-z0-9+/=]+)/,
    );
    expect(match).not.toBeNull();

    const sourceMap = JSON.parse(Buffer.from(match![1], "base64").toString());

    // The relative path "../stylus/styles.styl" should be preserved exactly
    expect(sourceMap.sources).toContain("../stylus/styles.styl");
  });

  it("preserves relative source paths with inline: false", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}sourcemap/content.html`],
      css: [`${ROOT_TEST_EXAMPLES}sourcemap/css/styles.css`],
      sourceMap: {
        inline: false,
      },
    });

    const sourceMap = JSON.parse(resultsPurge[0].sourceMap!);

    // The relative path "../stylus/styles.styl" should be preserved exactly
    expect(sourceMap.sources).toContain("../stylus/styles.styl");
  });
});
