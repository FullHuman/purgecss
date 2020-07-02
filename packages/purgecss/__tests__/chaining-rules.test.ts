import PurgeCSS from "./../src/index";

import { ROOT_TEST_EXAMPLES, notFindInCSS } from "./utils";

describe("chaining rules", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}chaining-rules/index.html`],
      css: [`${ROOT_TEST_EXAMPLES}chaining-rules/index.css`],
    });
    purgedCSS = resultsPurge[0].css;
  });
  it("keeps parent1 selector", () => {
    expect(purgedCSS.includes("parent1")).toBe(true);
  });
  it("removes parent3, d33ef1, .parent2", () => {
    notFindInCSS(expect, ["parent3", "d33ef1", "parent2"], purgedCSS);
  });
});
