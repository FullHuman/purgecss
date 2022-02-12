import { PurgeCSS } from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("pseudo elements", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-elements/pseudo-elements.html`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-elements/pseudo-elements.css`],
    });
    purgedCSS = resultsPurge[0].css;
  });
  it("finds root pseudo-elements", () => {
    expect(purgedCSS.includes("::-webkit-file-upload-button")).toBe(true);
    expect(purgedCSS.includes("::grammar-error")).toBe(true);
    expect(purgedCSS.includes("::-webkit-datetime-edit-fields-wrapper")).toBe(
      true
    );
    expect(purgedCSS.includes("::-moz-focus-inner")).toBe(true);
    expect(purgedCSS.includes("::file-selector-button")).toBe(true);
  });

  it("finds pseudo-elements on used class", () => {
    expect(purgedCSS.includes(".used::grammar-error")).toBe(true);
  });

  it("removes pseudo-elements on unused class", () => {
    expect(purgedCSS.includes(".unused::grammar-error")).toBe(false);
  });
});
