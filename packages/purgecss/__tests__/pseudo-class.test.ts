import PurgeCSS from "./../src/index";

const root = "./packages/purgecss/__tests__/test_examples/";

describe(":not pseudo class", () => {
  let purgedCSS: string;
  beforeAll(async (done) => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}not/not.html`],
      css: [`${root}not/not.css`],
    });
    purgedCSS = resultsPurge[0].css;
    done();
  });

  it("finds foo-bar", () => {
    expect(purgedCSS.includes("foo-bar")).toBe(true);
  });
  it("finds foo", () => {
    expect(purgedCSS.includes(".foo")).toBe(true);
  });
});

describe("pseudo selectors", () => {
  let purgedCSS: string;
  beforeAll(async (done) => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}pseudo_selector/pseudo_selector.html`],
      css: [`${root}pseudo_selector/pseudo_selector.css`],
    });
    purgedCSS = resultsPurge[0].css;
    done();
  });
  it("finds some-item:nth-child(2n)", () => {
    expect(purgedCSS.includes("some-item:nth-child(2n)")).toBe(true);
  });

  it("finds some-item:nth-child(2n + 1)", () => {
    expect(purgedCSS.includes("some-item:nth-child(2n + 1)")).toBe(true);
  });

  it("finds some-item:nth-of-type(n+3)", () => {
    expect(purgedCSS.includes("some-item:nth-of-type(n+3)")).toBe(true);
  });

  it("finds some-item:nth-of-type(-1n+6)", () => {
    expect(purgedCSS.includes("some-item:nth-of-type(-1n+6)")).toBe(true);
  });

  it("finds some-item:nth-of-type(-n+6)", () => {
    expect(purgedCSS.includes("some-item:nth-of-type(-n+6)")).toBe(true);
  });

  it("removes unused:only-child()", () => {
    expect(purgedCSS.includes("unused:only-child()")).toBe(false);
  });

  it("finds used:only-child()", () => {
    expect(purgedCSS.includes("used:only-child()")).toBe(true);
  });

  it("finds odd-item:nth-child(odd)", () => {
    expect(purgedCSS.includes("odd-item:nth-child(odd)")).toBe(true);
  });
});

describe("nth-child", () => {
  let purgedCSS: string;
  beforeAll(async (done) => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}nth_child/nth_child.html`],
      css: [`${root}nth_child/nth_child.css`],
    });
    purgedCSS = resultsPurge[0].css;
    done();
  });
  it("finds some-item:nth-child(2n)", () => {
    expect(purgedCSS.includes("some-item:nth-child(2n)")).toBe(true);
  });
  it("finds some-item:nth-child(2n+1)", () => {
    expect(purgedCSS.includes("some-item:nth-child(2n+1)")).toBe(true);
  });
  it('removes canvas (contains "n")', () => {
    expect(purgedCSS.includes("canvas")).toBe(false);
  });
});

describe("pseudo classes", () => {
  it("finds div:before", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}pseudo_class/pseudo_class.js`],
      css: [`${root}pseudo_class/pseudo_class.css`],
    });
    const purgedCSS = resultsPurge[0].css;
    expect(purgedCSS.includes("div:before")).toBe(true);
  });

  it("removes row:after", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}pseudo_class/pseudo_class.js`],
      css: [`${root}pseudo_class/pseudo_class.css`],
    });
    const purgedCSS = resultsPurge[0].css;
    expect(purgedCSS.includes("row:after")).toBe(false);
  });
});
