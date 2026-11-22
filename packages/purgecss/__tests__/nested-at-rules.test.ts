import { PurgeCSS } from "./../src/index";

async function purge(
  css: string,
  options: {
    keyframes?: boolean;
    fontFace?: boolean;
    variables?: boolean;
  },
): Promise<string> {
  const [result] = await new PurgeCSS().purge({
    content: [{ raw: '<div class="used"></div>', extension: "html" }],
    css: [{ raw: css }],
    ...options,
  });
  return result.css;
}

// at-rules that can be nested in a rule and hold declarations
const NESTED_AT_RULES = [
  "@media (width > 1px)",
  "@supports (display: grid)",
  "@container (width > 1px)",
  "@layer base",
  "@scope (.used)",
  "@starting-style",
];

// with CSS nesting, an at-rule nested in a rule can hold declarations, e.g.
// `.used { @media (...) { animation: spin 1s; } }`
describe("declarations directly inside an at-rule", () => {
  it.each(NESTED_AT_RULES)(
    "keeps the keyframes used in a nested %s",
    async (atRule) => {
      const css = await purge(
        "@keyframes spin { to { rotate: 1turn; } }\n" +
          "@keyframes unused { to { opacity: 1; } }\n" +
          `.used { ${atRule} { animation: spin 1s; } }`,
        { keyframes: true },
      );
      expect(css).toContain("@keyframes spin");
      expect(css).not.toContain("@keyframes unused");
    },
  );

  it("keeps the font faces used in a nested at-rule", async () => {
    const css = await purge(
      '@font-face { font-family: "Used"; src: url(used.woff2); }\n' +
        '@font-face { font-family: "Unused"; src: url(unused.woff2); }\n' +
        ".used { @container (width > 1px) { font-family: Used, serif; } }",
      { fontFace: true },
    );
    expect(css).toContain('font-family: "Used"');
    expect(css).not.toContain("Unused");
  });

  it("does not keep a font face nested in an at-rule because of its own font-family", async () => {
    const css = await purge(
      '@media print { @font-face { font-family: "Unused"; src: url(unused.woff2); } }\n' +
        ".used { color: red; }",
      { fontFace: true },
    );
    expect(css).toBe(".used { color: red; }");
  });

  it.each(NESTED_AT_RULES)(
    "keeps the variables used in a nested %s",
    async (atRule) => {
      const css = await purge(
        ":root { --used: 1; --unused: 2; }\n" +
          `.used { ${atRule} { opacity: var(--used); } }`,
        { variables: true },
      );
      expect(css).toContain("--used: 1");
      expect(css).not.toContain("--unused");
    },
  );

  it("keeps the variables used in @page", async () => {
    const css = await purge(
      ":root { --margin: 1cm; --unused: 2; }\n@page { margin: var(--margin); }",
      { variables: true },
    );
    expect(css).toContain("--margin: 1cm");
    expect(css).not.toContain("--unused");
  });

  it("removes the variables declared in a nested at-rule when they are unused", async () => {
    const css = await purge(
      ".used { @container (width > 1px) { --unused: 1; --used: 2; color: var(--used); } }",
      { variables: true },
    );
    expect(css).toContain("--used: 2");
    expect(css).not.toContain("--unused");
  });
});
