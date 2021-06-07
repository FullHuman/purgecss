import PurgeCSS from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("media queries", () => {
  let purgecssResult: string;
  beforeAll(async () => {
    const purgecss = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}media-queries/media_queries.html`],
      css: [`${ROOT_TEST_EXAMPLES}media-queries/media_queries.css`],
    });
    purgecssResult = purgecss[0].css;
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
