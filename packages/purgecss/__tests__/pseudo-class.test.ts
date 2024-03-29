import { PurgeCSS } from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe(":not pseudo class", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/not.html`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/not.css`],
    });
    purgedCSS = resultsPurge[0].css;
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
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_selector.html`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_selector.css`],
    });
    purgedCSS = resultsPurge[0].css;
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
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/nth_child.html`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/nth_child.css`],
    });
    purgedCSS = resultsPurge[0].css;
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
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_class.js`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_class.css`],
    });
    const purgedCSS = resultsPurge[0].css;
    expect(purgedCSS.includes("div:before")).toBe(true);
  });

  it("removes row:after", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_class.js`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_class.css`],
    });
    const purgedCSS = resultsPurge[0].css;
    expect(purgedCSS.includes("row:after")).toBe(false);
  });
});

describe(":where pseudo class", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/where.html`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/where.css`],
      safelist: {
        standard: ["[&:where(.a)]:text-black"],
      },
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("removes unused selectors", () => {
    expect(purgedCSS.includes(".unused")).toBe(false);
    expect(purgedCSS.includes(".root :where(.a) .c {")).toBe(true);
    expect(purgedCSS.includes(".root:where(.a) .c {")).toBe(true);
    expect(
      purgedCSS.includes(
        ".\\[\\&\\:where\\(\\.a\\)\\]\\:text-black:where(.a) {",
      ),
    ).toBe(true);
  });
});

describe(":is pseudo class", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/is.html`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/is.css`],
      safelist: {
        standard: ["[&:is(.a)]:text-black"],
      },
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("removes unused selectors", () => {
    expect(purgedCSS.includes(".unused")).toBe(false);
    expect(purgedCSS.includes(".root :is(.a) .c {")).toBe(true);
    expect(purgedCSS.includes(".root:is(.a) .c {")).toBe(true);
    expect(
      purgedCSS.includes(".\\[\\&\\:is\\(\\.a\\)\\]\\:text-black:is(.a) {"),
    ).toBe(true);
  });
});
