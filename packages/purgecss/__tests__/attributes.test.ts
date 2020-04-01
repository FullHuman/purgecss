import PurgeCSS from "./../src/index";

const root = "./packages/purgecss/__tests__/test_examples/";

describe("attributes", () => {
  let purgedCSS: string;

  beforeAll(async (done) => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}attribute_selector/attribute_selector.html`],
      css: [`${root}attribute_selector/attribute_selector.css`],
    });
    purgedCSS = resultsPurge[0].css;
    done();
  });

  it("always keep attribute when attribute is 'value'", () => {
    expect(purgedCSS.includes('input[value=""]')).toBe(true);
  });

  it("handles [attribute]", () => {
    // keep used css
    expect(purgedCSS.includes("a[target]")).toBe(true);
    expect(purgedCSS.includes("input[checked]")).toBe(true);
    // remove unused css
    expect(purgedCSS.includes("a[invented]")).toBe(false);
  });

  it("handles [attribute=value]", () => {
    // keep used css
    expect(purgedCSS.includes('a[target="_blank"]')).toBe(true);
    // remove unused css
    expect(purgedCSS.includes('a[target="no_blank"]')).toBe(false);
  });

  it("handles [attribute~=value]", () => {
    // keep used css
    expect(purgedCSS.includes('input[title~="flower"]')).toBe(true);
    // remove unused css
    expect(purgedCSS.includes('input[title~="grass]')).toBe(false);
  });

  it("handles [attribute|=value]", () => {
    // keep used css
    expect(purgedCSS.includes('html[lang|="en"]')).toBe(true);
    // remove unused css
    expect(purgedCSS.includes('html[lang|="fr"]')).toBe(false);
  });

  it("handles [attribute^=value]", () => {
    // keep used css
    expect(purgedCSS.includes('a[href^="http"]')).toBe(true);
    // remove unused css
    expect(purgedCSS.includes('a[href^="ssl"]')).toBe(false);
  });

  it("handles [attribute$=value]", () => {
    // keep used css
    expect(purgedCSS.includes('a[href$="pdf"]')).toBe(true);
    // remove unused css
    expect(purgedCSS.includes('a[href$="jpg"]')).toBe(false);
    expect(purgedCSS.includes('a[href$="http"]')).toBe(false);
  });

  it("handles [attribute*=value]", () => {
    // keep used css
    expect(purgedCSS.includes('a[title~="thin"]')).toBe(true);
    // remove unused css
    expect(purgedCSS.includes('a[title~="fat"]')).toBe(false);
  });
});
