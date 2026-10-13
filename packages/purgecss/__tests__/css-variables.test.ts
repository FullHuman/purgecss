import { PurgeCSS } from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("purge unused css variables", () => {
  it("keeps variables referenced from an earlier CSS input", async () => {
    const results = await new PurgeCSS().purge({
      content: [],
      variables: true,
      safelist: [/.*/],
      css: [
        { raw: ".input { color: var(--color); }" },
        { raw: ":root { --color: var(--base); --base: red; --unused: blue; }" },
      ],
    });

    expect(results[1].css).toContain("--color:");
    expect(results[1].css).toContain("--base:");
    expect(results[1].css).not.toContain("--unused:");
  });

  it.each(["\u1680", "\ufeff"])(
    "does not trim identifier characters from ordinary variable usages: %j",
    async (suffix) => {
      const [result] = await new PurgeCSS().purge({
        content: [],
        variables: true,
        safelist: [/.*/],
        css: [
          {
            raw: `:root { --color${suffix}: red; } .input { color: var(--color${suffix}); }`,
          },
        ],
      });

      expect(result.css).toContain(`--color${suffix}:`);
    },
  );

  it("handles whitespace in property usages and variable dependencies", async () => {
    const [result] = await new PurgeCSS().purge({
      content: [],
      css: [
        {
          raw: `
            :root {
              --color: var( --base );
              --base: red;
              --unused: blue;
            }
            .text { color: var(
              --color
            ); }
          `,
        },
      ],
      variables: true,
      safelist: [/.*/],
    });

    expect(result.css).toContain("--color:");
    expect(result.css).toContain("--base:");
    expect(result.css).not.toContain("--unused:");
  });

  it.each(["--public", /^--public$/])(
    "preserves cyclic dependencies of safelisted variables: %s",
    async (variable) => {
      const [result] = await new PurgeCSS().purge({
        content: [],
        css: [
          {
            raw: `
              :root {
                --public: var( --private );
                --private: var(--public);
                --unused: blue;
              }
            `,
          },
        ],
        variables: true,
        safelist: { standard: [/.*/], variables: [variable] },
      });

      expect(result.css).toContain("--public:");
      expect(result.css).toContain("--private:");
      expect(result.css).not.toContain("--unused:");
    },
  );

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
  it("keeps '--outline-color'", () => {
    expect(purgedCSS.includes("--outline-color:")).toBe(true);
  });
});
