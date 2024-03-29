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

    expect(resultsPurge[0].sourceMap).toContain(
      'sources":["__tests__/test_examples/others/remove_unused.css"]',
    );
  });
});
