import { PurgeCSS } from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("rejected", () => {
  it("does not return the rejected selectors if rejected set to false", async () => {
    expect.assertions(1);
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}rejected/simple.js`],
      css: [`${ROOT_TEST_EXAMPLES}rejected/simple.css`],
    });
    expect(resultsPurge[0].rejected).toBe(undefined);
  });

  it("returns an empty array if no selectors are rejected", async () => {
    expect.assertions(1);
    const purgecssResult = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}rejected/simple.js`],
      css: [`${ROOT_TEST_EXAMPLES}rejected/simple.css`],
      rejected: true,
    });
    expect(purgecssResult[0].rejected).toEqual([]);
  });

  it("returns the list of rejected selectors", async () => {
    expect.assertions(1);
    const purgecssResult = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}others/remove_unused.js`],
      css: [`${ROOT_TEST_EXAMPLES}others/remove_unused.css`],
      rejected: true,
    });
    expect(purgecssResult[0].rejected).toEqual([
      ".unused-class",
      ".another-one-not-found",
    ]);
  });

  it("returns the list of rejected selectors with chaining rules", async () => {
    expect.assertions(1);
    const purgecssResult = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}chaining-rules/index.html`],
      css: [`${ROOT_TEST_EXAMPLES}chaining-rules/index.css`],
      rejected: true,
    });
    expect(purgecssResult[0].rejected).toEqual([
      ".parent1 p",
      ".parent1 h1",
      ".parent1.d22222ef",
      ".parent1.d222222222222222222ef",
      ".parent.def1",
      ".parent.def2",
      ".parent.de1",
      ".parent.d3ef1",
      ".parent.d33ef1",
      ".parent2.def",
      ".parent3.def1",
      "[href^='#']",
    ]);
  });
});
