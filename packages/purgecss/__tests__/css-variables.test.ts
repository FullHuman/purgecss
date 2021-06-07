import PurgeCSS from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("purge unused css variables", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}css-variables/variables.html`],
      css: [`${ROOT_TEST_EXAMPLES}css-variables/variables.css`],
      variables: true,
    });
    purgedCSS = resultPurge[0].css;
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
  it("keeps '--color-first:', '--wrong-order'", () => {
    expect(purgedCSS.includes("--color-first:")).toBe(true);
    expect(purgedCSS.includes("--wrong-order:")).toBe(true);
  });
});
