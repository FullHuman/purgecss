import PurgeCSS from "./../src/index";

const root = "./packages/purgecss/__tests__/test_examples/";

describe("purge unused css variables", () => {
  let purgedCSS: string;
  beforeAll(async (done) => {
    const resultPurge = await new PurgeCSS().purge({
      content: [`${root}variables/variables.html`],
      css: [`${root}variables/variables.css`],
      variables: true,
    });
    purgedCSS = resultPurge[0].css;
    done();
  });
  it("keeps '--primary-color'", () => {
    expect(purgedCSS.includes("--primary-color:")).toBe(true);
  });
  it("keeps '--accent-color', '--used-color'", () => {
    expect(purgedCSS.includes("--accent-color:")).toBe(true);
    expect(purgedCSS.includes("--used-color:")).toBe(true);
  });
  it("removes '--tertiary-color', '--unused-color' and '--button-color'", () => {
    expect(purgedCSS.includes("--tertiary-color")).toBe(false);
    expect(purgedCSS.includes("--unused-color")).toBe(false);
    expect(purgedCSS.includes("--button-color")).toBe(false);
  });
});
