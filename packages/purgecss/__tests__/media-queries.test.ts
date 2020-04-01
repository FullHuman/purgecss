import PurgeCSS from "./../src/index";

const root = "./packages/purgecss/__tests__/test_examples/";

describe("media queries", () => {
  let purgecssResult: string;
  beforeAll(async (done) => {
    const purgecss = await new PurgeCSS().purge({
      content: [`${root}media_queries/media_queries.html`],
      css: [`${root}media_queries/media_queries.css`],
    });
    purgecssResult = purgecss[0].css;
    done();
  });
  it("finds .media-class", () => {
    expect(purgecssResult.includes(".media-class")).toBe(true);
  });

  it("finds .alone", () => {
    expect(purgecssResult.includes(".alone")).toBe(true);
  });

  it("finds #id-in-media", () => {
    expect(purgecssResult.includes("#id-in-media")).toBe(true);
  });

  it("finds body", () => {
    expect(purgecssResult.includes("body")).toBe(true);
  });

  it("removes .unused-class", () => {
    expect(purgecssResult.includes(".unused-class")).toBe(false);
  });

  it("removes the empty media query", () => {
    expect(purgecssResult.includes("66666px")).toBe(false);
  });
});
