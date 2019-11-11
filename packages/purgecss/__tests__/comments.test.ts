import PurgeCSS from "./../src/index";

const root = "./packages/purgecss/__tests__/test_examples/";

describe("ignore comment", () => {
  let purgedCSS: string;
  beforeAll(async done => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}ignore_comment/ignore_comment.html`],
      css: [`${root}ignore_comment/ignore_comment.css`]
    });
    purgedCSS = resultsPurge[0].css;
    done();
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
      content: [`${root}ignore_comment_range/index.html`],
      css: [`${root}ignore_comment_range/index.css`]
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("ignores h1, h3, h5, h6", () => {
    ["h1", "h3", "h5", "h6"].forEach(selector => {
      expect(purgedCSS.includes(selector)).toBe(true);
    });
  });

  it("removes h4", () => {
    expect(purgedCSS.includes("h4")).toBe(false);
  });

  it("removes the comments", () => {
    expect(purgedCSS.includes("/* purgecss start ignore */")).toBe(false);
    expect(purgedCSS.includes("/* purgecss end ignore */")).toBe(false);
  });
});
