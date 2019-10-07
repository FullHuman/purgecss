import purgeCSS from "./../src/index";

const root = "./packages/purgecss/__tests__/test_examples/";

describe(":not pseudo class", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await purgeCSS({
      content: [`${root}not/not.html`],
      css: [`${root}not/not.css`]
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
