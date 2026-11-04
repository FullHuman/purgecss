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
  it.each([
    [
      "an at-rule nested in an at-rule",
      "@supports (display: grid) { @media (min-width: 1px) { .unused { color: red; } } }",
    ],
    [
      "an at-rule nested in a cascade layer",
      "@layer base { @media print { .unused { color: red; } } }",
    ],
    [
      "an at-rule nested in a rule",
      ".used { @media (min-width: 1px) { .unused { color: red; } } }",
    ],
  ])("keeps all the ancestors of a rejected rule in %s", async (_, css) => {
    expect.assertions(2);
    const resultsPurge = await new PurgeCSS().purge({
      content: [{ raw: '<div class="used"></div>', extension: "html" }],
      css: [{ raw: css }],
      rejectedCss: true,
    });
    expect(resultsPurge[0].css).toBe("");
    expect(resultsPurge[0].rejectedCss).toBe(css);
  });
  it("only keeps the rejected rules in the ancestors of a rejected rule", async () => {
    expect.assertions(2);
    const resultsPurge = await new PurgeCSS().purge({
      content: [{ raw: '<div class="used"></div>', extension: "html" }],
      css: [
        {
          raw: ".used { color: red; @media print { .unused { color: blue; } .used { color: green; } } }",
        },
      ],
      rejectedCss: true,
    });
    expect(resultsPurge[0].css).toBe(
      ".used { color: red; @media print { .used { color: green; } } }",
    );
    expect(resultsPurge[0].rejectedCss).toBe(
      ".used { @media print { .unused { color: blue; } } }",
    );
  });
  it("does not repeat the rules nested in a rejected rule", async () => {
    expect.assertions(2);
    const css =
      ".unused { color: red; .nested { color: blue; } @media print { .nested { color: green; } } }";
    const resultsPurge = await new PurgeCSS().purge({
      content: [{ raw: '<div class="used"></div>', extension: "html" }],
      css: [{ raw: css }],
      rejectedCss: true,
    });
    expect(resultsPurge[0].css).toBe("");
    expect(resultsPurge[0].rejectedCss).toBe(css);
  });
  it("keeps the rejected rules nested in a rule that is partially rejected", async () => {
    expect.assertions(2);
    const resultsPurge = await new PurgeCSS().purge({
      content: [{ raw: '<div class="used"></div>', extension: "html" }],
      css: [
        {
          raw: ".used, .unused { color: red; @media print { .nested { color: blue; } } }",
        },
      ],
      rejectedCss: true,
    });
    expect(resultsPurge[0].css).toBe(".used { color: red }");
    expect(resultsPurge[0].rejectedCss).toBe(
      ".unused { color: red; @media print { .nested { color: blue; } } }" +
        ".used { @media print { .nested { color: blue; } } }",
    );
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
