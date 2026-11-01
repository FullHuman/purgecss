import { PurgeCSS } from "./../src/index";
import { findInCSS, notFindInCSS, ROOT_TEST_EXAMPLES } from "./utils";

describe("rejectedCss", () => {
  it("returns the rejected css as part of the result", async () => {
    expect.assertions(1);
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}rejectedCss/simple.js`],
      css: [`${ROOT_TEST_EXAMPLES}rejectedCss/simple.css`],
      rejectedCss: true,
    });
    const expected = `.rejected {\n  color: blue;\n}`;
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
    expect(resultsPurge[0].rejectedCss?.trim()).toContain(
      resultsPurge[0].rejected?.[0],
    );
  });
  /**
   * https://github.com/FullHuman/purgecss/pull/763#discussion_r754618902
   */
  it("preserves the node correctly", async () => {
    expect.assertions(2);
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}rejectedCss/empty-parent-node.js`],
      css: [`${ROOT_TEST_EXAMPLES}rejectedCss/empty-parent-node.css`],
      rejectedCss: true,
    });
    const expectedRejectedCss = `@media (max-width: 66666px) {\n  .unused-class {\n    color: black;\n  }\n}`;
    const expectedPurgedCss = `@media (max-width: 66666px) {\n  .used-class {\n    color: black;\n  }\n}`;
    expect(resultsPurge[0].rejectedCss?.trim()).toEqual(expectedRejectedCss);
    expect(resultsPurge[0].css.trim()).toEqual(expectedPurgedCss);
  });
  it("does not keep the whitespace after the comma before a rejected selector", async () => {
    expect.assertions(1);
    const resultsPurge = await new PurgeCSS().purge({
      content: [{ raw: "<em>Italic</em>", extension: "html" }],
      css: [{ raw: "em,\nstrong {\n  font-size: 2em;\n}" }],
      rejectedCss: true,
    });
    expect(resultsPurge[0].rejectedCss).toBe("strong {\n  font-size: 2em;\n}");
  });
  it("returns only the rules rejected from each css file", async () => {
    expect.assertions(9);
    const resultsPurge = await new PurgeCSS().purge({
      content: [{ raw: '<div class="used"></div>', extension: "html" }],
      css: [
        {
          raw: ".unused-a { color: red; }\n@media (min-width: 1px) { .unused-media-a { color: red; } }",
          name: "a.css",
        },
        {
          raw: "@media (min-width: 1px) { .unused-media-b { color: red; } }\n.unused-b { color: red; }",
          name: "b.css",
        },
        { raw: ".used { color: red; }", name: "c.css" },
      ],
      rejectedCss: true,
    });
    const [rejectedCssA, rejectedCssB, rejectedCssC] = resultsPurge.map(
      (result) => result.rejectedCss,
    );
    findInCSS(expect, [".unused-a", ".unused-media-a"], rejectedCssA ?? "");
    notFindInCSS(expect, [".unused-b", ".unused-media-b"], rejectedCssA ?? "");
    findInCSS(expect, [".unused-b", ".unused-media-b"], rejectedCssB ?? "");
    notFindInCSS(expect, [".unused-a", ".unused-media-a"], rejectedCssB ?? "");
    expect(rejectedCssC).toBe("");
  });
});
