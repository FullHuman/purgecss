import { PurgeCSS } from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";
import purgecssFromHtml from "purgecss-from-html";

// we run this  suite against both the default and HTML extractors, as the HTML
// extractor's more granular attribute handling can cause bugs
describe.each([
  [[]],
  [
    [
      {
        extensions: ["html"],
        extractor: purgecssFromHtml,
      },
    ],
  ],
])("attributes", (extractors) => {
  let purgedCSS: string;

  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}attributes/attribute_selector.html`],
      css: [`${ROOT_TEST_EXAMPLES}attributes/attribute_selector.css`],
      dynamicAttributes: ["aria-selected"],
      extractors
    });
    purgedCSS = resultsPurge[0].css;
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
    expect(purgedCSS.includes('a[title*="thin"]')).toBe(true);
    // remove unused css
    expect(purgedCSS.includes('a[title*="fat"]')).toBe(false);
  });

  it("handles spaces in attribute selector", () => {
    expect(purgedCSS.includes('[class*=" class2"]')).toBe(true);
    expect(purgedCSS.includes('[class*="class1 class2 "]')).toBe(true);
  });

  it("keeps dynamic attributes", () => {
    expect(purgedCSS.includes("[aria-selected]")).toBe(true);
  });
});
