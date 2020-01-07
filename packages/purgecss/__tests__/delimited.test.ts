import PurgeCSS from "./../src/index";

const root = "./packages/purgecss/__tests__/test_examples/";

describe("delimited", () => {
  let purgedCSS: string;
  beforeAll(async done => {
    const resultPurge = await new PurgeCSS().purge({
      content: [`${root}delimited/delimited.html`],
      css: [`${root}delimited/delimited.css`]
    });
    purgedCSS = resultPurge[0].css;
    done();
  });
  it("removes the extra comma", () => {
    const commaCount = purgedCSS
      .split("")
      .reduce((total, chr) => (chr === "," ? total + 1 : total), 0);

    expect(commaCount).toBe(0);
  });

  it("finds h1", () => {
    expect(purgedCSS.includes("h1")).toBe(true);
  });

  it("removes p", () => {
    expect(purgedCSS.includes("p")).toBe(false);
  });

  it("removes .unused-class-name", () => {
    expect(purgedCSS.includes(".unused-class-name")).toBe(false);
  });
});
