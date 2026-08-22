import { PurgeCSS, type ResultPurge } from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("media queries variables", () => {
  let purgecssResult: ResultPurge;
  beforeAll(async () => {
    const purgecss = await new PurgeCSS().purge({
      content: [
        `${ROOT_TEST_EXAMPLES}media-queries-variables/media_queries_variables.html`,
      ],
      css: [
        `${ROOT_TEST_EXAMPLES}media-queries-variables/media_queries_variables.css`,
      ],
      variables: true,
      rejected: true,
      rejectedCss: true,
    });
    purgecssResult = purgecss[0];
  });

  it("keeps '--font-size-*'", () => {
    expect(purgecssResult.css).toContain("--font-size-1:");
    expect(purgecssResult.css).toContain("--font-size-2:");
    expect(purgecssResult.css).toContain("--font-size-3:");
  });

  it("removes '--unused-font-size-*'", () => {
    expect(purgecssResult.rejectedCss).toContain("--unused-font-size-1");
    expect(purgecssResult.rejectedCss).toContain("--unused-font-size-2");
    expect(purgecssResult.css).not.toContain("--unused-font-size-1");
    expect(purgecssResult.css).not.toContain("--unused-font-size-2");
  });

  it("finds .used-class-*", () => {
    expect(purgecssResult.css).toContain(".used-class-1");
    expect(purgecssResult.css).toContain(".used-class-2");
  });

  it("removes .unused-class-*", () => {
    expect(purgecssResult.rejected).toContain(".unused-class-1");
    expect(purgecssResult.rejected).toContain(".unused-class-2");
    expect(purgecssResult.css).not.toContain(".unused-class-1");
    expect(purgecssResult.css).not.toContain(".unused-class-2");
  });
});
