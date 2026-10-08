import { PurgeCSS } from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe.each([
  {
    content: [`${ROOT_TEST_EXAMPLES}css-variables/variables.html`],
    css: [`${ROOT_TEST_EXAMPLES}css-variables/variables.css`],
    variables: true,
  },
  {
    content: [`${ROOT_TEST_EXAMPLES}css-variables/variables-with-spaces.html`],
    css: [`${ROOT_TEST_EXAMPLES}css-variables/variables-with-spaces.css`],
    variables: true,
  },
])("purge unused css variables", (options) => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultPurge = await new PurgeCSS().purge(options);
    purgedCSS = resultPurge[0].css;
  });
  it("keeps '--primary-color'", () => {
    expect(purgedCSS).toContain("--primary-color:");
  });
  it("keeps '--accent-color', '--used-color'", () => {
    expect(purgedCSS).toContain("--accent-color:");
    expect(purgedCSS).toContain("--used-color:");
  });
  it("removes '--tertiary-color', '--unused-color' and '--button-color'", () => {
    expect(purgedCSS).not.toContain("--tertiary-color");
    expect(purgedCSS).not.toContain("--unused-color");
    expect(purgedCSS).not.toContain("--button-color");
  });
  it("keeps '--color-first:', '--wrong-order'", () => {
    expect(purgedCSS).toContain("--color-first:");
    expect(purgedCSS).toContain("--wrong-order:");
  });
  it("keeps '--outline-color'", () => {
    expect(purgedCSS).toContain("--outline-color:");
  });
});
