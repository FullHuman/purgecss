import { PurgeCSS } from "./../src/index";
import { findInCSS, ROOT_TEST_EXAMPLES } from "./utils";

describe("ignore comment", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}comments/ignore_comment.html`],
      css: [`${ROOT_TEST_EXAMPLES}comments/ignore_comment.css`],
    });
    purgedCSS = resultsPurge[0].css;
  });
  it("ignores h1 h2", () => {
    expect(purgedCSS.includes("h1")).toBe(true);
    expect(purgedCSS.includes("h3")).toBe(true);
  });

  it("removes the comment", () => {
    expect(purgedCSS.includes("/* purgecss ignore */")).toBe(false);
    expect(purgedCSS.includes("/* purgecss ignore current */")).toBe(false);
  });
});

describe("ignore comment range", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}comments/ignore_comment_range.html`],
      css: [`${ROOT_TEST_EXAMPLES}comments/ignore_comment_range.css`],
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("ignores h1, h3, h5, h6", () => {
    findInCSS(expect, ["h1", "h3", "h5", "h6"], purgedCSS);
  });

  it("removes h4", () => {
    expect(purgedCSS.includes("h4")).toBe(false);
  });

  it("removes the comments", () => {
    expect(purgedCSS.includes("/* purgecss start ignore */")).toBe(false);
    expect(purgedCSS.includes("/* purgecss end ignore */")).toBe(false);
  });
});

describe("ignore comment with at-rules", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [
        `${ROOT_TEST_EXAMPLES}comments-at-rules/ignore_comment_at_rules.html`,
      ],
      css: [
        `${ROOT_TEST_EXAMPLES}comments-at-rules/ignore_comment_at_rules.css`,
      ],
      variables: true,
      keyframes: true,
      fontFace: true,
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("keeps the at-rules inside an ignore range", () => {
    expect(purgedCSS).toContain("@property --range-property");
    expect(purgedCSS).toContain("@keyframes range-keyframes");
    expect(purgedCSS).toContain('src: url("range.woff2")');
  });

  it("keeps the at-rules after an ignore comment", () => {
    expect(purgedCSS).toContain("@property --next-property");
    expect(purgedCSS).toContain("@keyframes next-keyframes");
  });

  it("keeps the at-rules used by ignored rules", () => {
    findInCSS(
      expect,
      [
        "@property --range-used",
        "@property --next-used",
        "@property --current-used",
        "@keyframes range-animation",
        "@keyframes current-animation",
        'src: url("range-used.woff2")',
      ],
      purgedCSS,
    );
  });

  it("keeps the variables declared and used by ignored rules", () => {
    expect(purgedCSS).toContain("--range-declared: var(--range-chained)");
    expect(purgedCSS).toContain("--range-chained: 2px");
  });

  it("removes the unused at-rules", () => {
    expect(purgedCSS).not.toContain("--unused-property");
    expect(purgedCSS).not.toContain("unused-keyframes");
    expect(purgedCSS).not.toContain("unused.woff2");
  });

  it("removes the comments", () => {
    expect(purgedCSS).not.toContain("purgecss");
  });
});

describe("ignore comment range starting in a purged media query", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [{ raw: "<div></div>", extension: "html" }],
      css: [
        {
          raw: `@media (max-width: 600px) {
  .unused { color: black; }
  /* purgecss start ignore */
}
.ignored { color: black; }
/* purgecss end ignore */`,
        },
      ],
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("still applies the ignore comment", () => {
    expect(purgedCSS.includes(".ignored")).toBe(true);
    expect(purgedCSS.includes(".unused")).toBe(false);
  });
});
