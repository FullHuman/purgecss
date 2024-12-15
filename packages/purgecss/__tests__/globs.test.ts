import { PurgeCSS } from "../src/";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("Glob", () => {
  it("glob expressions in content/css work", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}comments/**/*.{js,html,json,svg}`],
      css: [`${ROOT_TEST_EXAMPLES}comments/**/*.css`],
    });

    expect(resultsPurge[0].file).toBe(
      `${ROOT_TEST_EXAMPLES}comments/ignore_comment.css`,
    );
    expect(resultsPurge[0].css.includes("/* purgecss ignore */")).toBe(false);
    expect(resultsPurge[0].css.includes("/* purgecss ignore current */")).toBe(
      false,
    );

    expect(resultsPurge[1].file).toBe(
      `${ROOT_TEST_EXAMPLES}comments/ignore_comment_range.css`,
    );
    expect(resultsPurge[1].css.includes("h4")).toBe(false);
  });
});
