import PurgeCSS from "./../src/index";
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
