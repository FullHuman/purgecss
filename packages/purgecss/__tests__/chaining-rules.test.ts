import PurgeCSS from "./../src/index";

const root = "./packages/purgecss/__tests__/test_examples/";

describe("chaining rules", () => {
  let purgedCSS: string;
  beforeAll(async done => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}chaining_rules/index.html`],
      css: [`${root}chaining_rules/index.css`]
    });
    purgedCSS = resultsPurge[0].css;
    done();
  });
  it("keeps parent1 selector", () => {
    expect(purgedCSS.includes("parent1")).toBe(true);
  });
  it("removes parent3 selector", () => {
    expect(purgedCSS.includes("parent3")).toBe(false);
  });
  it("removes d33ef1 selector", () => {
    expect(purgedCSS.includes("d33ef1")).toBe(false);
  });
  it("removes .parent2", () => {
    expect(purgedCSS.includes("parent2")).toBe(false);
  });
});
