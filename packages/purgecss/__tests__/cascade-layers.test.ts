import { PurgeCSS } from "./../src/index";

async function purge(
  css: string,
  options: {
    keyframes?: boolean;
    fontFace?: boolean;
    variables?: boolean;
  } = {},
): Promise<string> {
  const [result] = await new PurgeCSS().purge({
    content: [{ raw: '<div class="used"></div>', extension: "html" }],
    css: [{ raw: css }],
    ...options,
  });
  return result.css;
}

// the order of the cascade layers is the order in which their names first
// appear: an empty named layer still declares its layer
describe("cascade layers left empty", () => {
  it("keeps a named layer left empty by a removed rule", async () => {
    // without the first block, `reset` would come after `base` and
    // `.used` would be blue instead of green
    const css = await purge(
      "@layer reset { .unused { color: red; } }\n" +
        "@layer base { .used { color: green; } }\n" +
        "@layer reset { .used { color: blue; } }",
    );
    expect(css).toBe(
      "@layer reset { }\n" +
        "@layer base { .used { color: green; } }\n" +
        "@layer reset { .used { color: blue; } }",
    );
  });

  it.each([
    [
      "keyframes",
      "@layer reset { @keyframes unused { to { opacity: 1; } } }",
      { keyframes: true },
    ],
    [
      "a font face",
      '@layer reset { @font-face { font-family: "Unused"; src: url(unused.woff2); } }',
      { fontFace: true },
    ],
    [
      "an @property rule",
      '@layer reset { @property --unused { syntax: "<color>"; inherits: false; initial-value: red; } }',
      { variables: true },
    ],
  ])(
    "keeps a named layer left empty by removed %s",
    async (_, css, options) => {
      expect(await purge(`${css}\n.used { color: red; }`, options)).toBe(
        "@layer reset { }\n.used { color: red; }",
      );
    },
  );

  it("keeps a named layer with a nested name", async () => {
    expect(
      await purge("@layer framework.reset { .unused { color: red; } }"),
    ).toBe("@layer framework.reset { }");
  });

  it("removes the at-rules left empty inside a named layer", async () => {
    expect(
      await purge("@layer reset { @media print { .unused { color: red; } } }"),
    ).toBe("@layer reset { }");
  });

  it("keeps the parents of a named layer left empty", async () => {
    expect(
      await purge("@media print { @layer reset { .unused { color: red; } } }"),
    ).toBe("@media print { @layer reset { } }");
  });

  it("removes an anonymous layer left empty", async () => {
    expect(
      await purge("@layer { .unused { color: red; } }\n.used { color: red; }"),
    ).toBe(".used { color: red; }");
  });

  it("keeps the statements declaring the order of the layers", async () => {
    expect(
      await purge(
        "@layer reset, base;\n@layer reset { .unused { color: red; } }",
      ),
    ).toBe("@layer reset, base;\n@layer reset { }");
  });
});
