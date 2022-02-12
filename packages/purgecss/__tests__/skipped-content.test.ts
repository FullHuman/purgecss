import { PurgeCSS } from "./../src/index";

import { ROOT_TEST_EXAMPLES } from "./utils";

describe("skipped-content", () => {
  let purgedCSS: string;

  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}skipped-content/**/*.html`],
      css: [`${ROOT_TEST_EXAMPLES}skipped-content/simple.css`],
      skippedContentGlobs: [
        `${ROOT_TEST_EXAMPLES}skipped-content/skippedFolder/**`,
      ],
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("purges appropriate CSS rules when skippedContentGlobs is set", () => {
    expect(purgedCSS.includes(".red")).toBe(true);
    expect(purgedCSS.includes(".black")).toBe(true);
    expect(purgedCSS.includes(".green")).toBe(false);
  });
});
