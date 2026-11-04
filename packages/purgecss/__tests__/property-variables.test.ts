import { PurgeCSS, type ResultPurge } from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("@property rules of css variables", () => {
  let purgecssResult: ResultPurge;
  beforeAll(async () => {
    const purgecss = await new PurgeCSS().purge({
      content: [
        `${ROOT_TEST_EXAMPLES}property-variables/property_variables.html`,
      ],
      css: [`${ROOT_TEST_EXAMPLES}property-variables/property_variables.css`],
      variables: true,
      safelist: {
        variables: ["--safelisted-color"],
      },
    });
    purgecssResult = purgecss[0];
  });

  it("keeps @property of used variables", () => {
    expect(purgecssResult.css).toContain("@property --used-angle");
    expect(purgecssResult.css).toContain("--used-angle: 45deg");
  });

  it("keeps @property of variables only read through var()", () => {
    expect(purgecssResult.css).toContain("@property --initial-only");
  });

  it("keeps @property of variables used by other used variables", () => {
    expect(purgecssResult.css).toContain("@property --nested-color");
  });

  it("keeps @property of safelisted variables", () => {
    expect(purgecssResult.css).toContain("@property --safelisted-color");
  });

  it("removes @property of unused variables", () => {
    expect(purgecssResult.css).not.toContain("--unused-angle");
    expect(purgecssResult.css).not.toContain("--unused-initial-only");
    expect(purgecssResult.css).not.toContain("--layered-unused");
  });

  it("keeps @property rules when the variables option is disabled", async () => {
    const [result] = await new PurgeCSS().purge({
      content: [
        `${ROOT_TEST_EXAMPLES}property-variables/property_variables.html`,
      ],
      css: [`${ROOT_TEST_EXAMPLES}property-variables/property_variables.css`],
    });
    expect(result.css).toContain("@property --unused-angle");
    expect(result.css).toContain("@property --layered-unused");
  });
});
