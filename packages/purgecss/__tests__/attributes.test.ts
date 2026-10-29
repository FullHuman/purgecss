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
      extractors,
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

describe("dynamicAttributes with regular expressions", () => {
  let purgedCSS: string;

  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}attributes/dynamic_attributes.html`],
      css: [`${ROOT_TEST_EXAMPLES}attributes/dynamic_attributes.css`],
      dynamicAttributes: [/^data-/, "aria-selected"],
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("keeps attribute selectors matching a regular expression", () => {
    expect(purgedCSS.includes(".menu-item[data-highlighted]")).toBe(true);
    expect(purgedCSS.includes('.popover[data-side="top"]')).toBe(true);
    expect(purgedCSS.includes('html[data-theme="dark"] .menu-item')).toBe(true);
  });

  it("keeps attribute selectors matching a string", () => {
    expect(purgedCSS.includes('.option[aria-selected="true"]')).toBe(true);
  });

  it("removes selectors with an unused class", () => {
    expect(purgedCSS.includes(".unused-item[data-highlighted]")).toBe(false);
  });

  it("removes attribute selectors that are not matched", () => {
    expect(purgedCSS.includes(".menu-item[aria-invented]")).toBe(false);
  });

  it("only applies to attributes", () => {
    expect(purgedCSS.includes(".data-table")).toBe(false);
  });

  it("always keeps the built-in dynamic attributes", () => {
    expect(purgedCSS.includes('.option[value="1"]')).toBe(true);
    expect(purgedCSS.includes(".option[checked]")).toBe(true);
    expect(purgedCSS.includes(".option[selected]")).toBe(true);
    expect(purgedCSS.includes(".popover[open]")).toBe(true);
  });

  it("handles regular expressions with the global flag", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}attributes/dynamic_attributes.html`],
      css: [`${ROOT_TEST_EXAMPLES}attributes/dynamic_attributes.css`],
      dynamicAttributes: [/^data-/g],
    });
    const css = resultsPurge[0].css;
    expect(css.includes(".menu-item[data-highlighted]")).toBe(true);
    expect(css.includes('.popover[data-side="top"]')).toBe(true);
    expect(css.includes('html[data-theme="dark"] .menu-item')).toBe(true);
  });
});
