import PurgeCSS from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("rejectedCss", () => {
  it("returns the rejected css as part of the result", async () => {
    expect.assertions(1);
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}rejectedCss/simple.js`],
      css: [`${ROOT_TEST_EXAMPLES}rejectedCss/simple.css`],
      rejectedCss: true,
    });
    const expected = `
.rejected {
    color: blue;
}`;
    expect(resultsPurge[0].rejectedCss?.trim()).toBe(expected.trim());
  });
  it("contains the rejected selectors as part of the rejected css", async () => {
    expect.assertions(1);
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}rejectedCss/simple.js`],
      css: [`${ROOT_TEST_EXAMPLES}rejectedCss/simple.css`],
      rejected: true,
      rejectedCss: true,
    });
    expect(resultsPurge[0].rejectedCss?.trim()).toContain(resultsPurge[0].rejected?.[0]);
  });
});
