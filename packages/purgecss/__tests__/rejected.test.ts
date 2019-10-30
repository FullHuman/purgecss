import PurgeCSS from "./../src/index";

const root = "./packages/purgecss/__tests__/test_examples/";

describe("rejected", () => {
  it("does not return the rejected selectors if rejected set to false", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}simple/simple.js`],
      css: [`${root}simple/simple.css`]
    });
    expect(resultsPurge[0].rejected).toBe(undefined);
  });

  it("returns an empty array if no selectors are rejected", async () => {
    let purgecssResult = await new PurgeCSS().purge({
      content: [`${root}simple/simple.js`],
      css: [`${root}simple/simple.css`],
      rejected: true
    });
    expect(purgecssResult[0].rejected).toEqual([]);
  });

  it("returns the list of rejected selectors", async () => {
    let purgecssResult = await new PurgeCSS().purge({
      content: [`${root}remove_unused/remove_unused.js`],
      css: [`${root}remove_unused/remove_unused.css`],
      rejected: true
    });
    expect(purgecssResult[0].rejected).toEqual([
      ".unused-class",
      ".another-one-not-found"
    ]);
  });

  it("returns the list of rejected selectors with chaining rules", async () => {
    let purgecssResult = await new PurgeCSS().purge({
      content: [`${root}chaining_rules/index.html`],
      css: [`${root}chaining_rules/index.css`],
      rejected: true
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
      ".parent3.def1"
    ]);
  });
});
