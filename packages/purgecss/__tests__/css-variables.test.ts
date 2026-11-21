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

describe("purge CSS variables used in keyframes correctly", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}css-variables/keyframes.html`],
      css: [`${ROOT_TEST_EXAMPLES}css-variables/keyframes.css`],
      variables: true,
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("keeps `--used-color`", () => {
    expect(purgedCSS.includes("--used-color:")).toBe(true);
    expect(purgedCSS.includes("var(--used-color)")).toBe(true);
  });

  it("removes `--unused-color`", () => {
    expect(purgedCSS.includes("--unused-color")).toBe(false);
  });
});

describe("purge CSS variables declared in keyframes", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [
        `${ROOT_TEST_EXAMPLES}css-variables/keyframes-custom-properties.html`,
      ],
      css: [
        `${ROOT_TEST_EXAMPLES}css-variables/keyframes-custom-properties.css`,
      ],
      variables: true,
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("keeps `--angle` animated inside keyframes", () => {
    expect(purgedCSS).toContain("--angle: 360deg");
  });

  it("removes `--unused-angle`", () => {
    expect(purgedCSS).not.toContain("--unused-angle");
  });
});

describe("rules left empty by removed CSS variables", () => {
  async function purge(css: string): Promise<string> {
    const [result] = await new PurgeCSS().purge({
      content: [{ raw: '<div class="used"></div>', extension: "html" }],
      css: [{ raw: css }],
      variables: true,
    });
    return result.css;
  }

  it("removes a rule left empty", async () => {
    expect(
      await purge(
        ":root { --unused: red; }\n.used { color: var(--used, blue); }",
      ),
    ).toBe(".used { color: var(--used, blue); }");
  });

  it("removes a rule left with only a comment", async () => {
    expect(
      await purge(":root {\n  /* colors */\n  --unused: red;\n}\n.used { }"),
    ).toBe(".used { }");
  });

  it("keeps a rule with declarations left", async () => {
    expect(
      await purge(":root { --unused: red; color: blue; }\n.used { }"),
    ).toBe(":root { color: blue; }\n.used { }");
  });

  it("keeps a rule with used variables left", async () => {
    expect(
      await purge(
        ":root { --used: red; --unused: red; }\n.used { color: var(--used); }",
      ),
    ).toBe(":root { --used: red; }\n.used { color: var(--used); }");
  });

  it("removes the at-rules left empty", async () => {
    expect(
      await purge(
        "@media print { @supports (color: red) { :root { --unused: red; } } }\n" +
          "@media screen { .used { --unused: red; } }\n" +
          ".used { }",
      ),
    ).toBe(".used { }");
  });

  it("removes the nested rules left empty", async () => {
    expect(
      await purge(
        ".used { .used { --unused: red; } }\n" +
          ".used { @media print { --unused: red; } }\n" +
          ".used { color: red; .used { --unused: red; } }",
      ),
    ).toBe(".used { color: red }");
  });

  it("keeps a named layer left empty", async () => {
    expect(await purge("@layer base { :root { --unused: red; } }")).toBe(
      "@layer base { }",
    );
  });

  it("keeps the empty rules that had no variable removed", async () => {
    expect(await purge(".used { }\n:root { --unused: red; }")).toBe(
      ".used { }",
    );
  });

  it("keeps the keyframes left empty", async () => {
    expect(
      await purge(
        "@keyframes spin { from { --unused: 0; } to { --unused: 1; } }\n" +
          ".used { animation: spin 1s; }",
      ),
    ).toBe(
      "@keyframes spin { from { } to { } }\n.used { animation: spin 1s; }",
    );
  });

  it("keeps the rules whose variables are kept by an ignore comment", async () => {
    expect(
      await purge(
        ":root {\n  /* purgecss ignore current */\n  --unused: red;\n}\n" +
          "/* purgecss ignore */\n:root { --unused: red; }",
      ),
    ).toBe(":root {\n  --unused: red;\n}\n:root { --unused: red; }");
  });

  it("removes the rules left empty by removed @property rules and variables", async () => {
    expect(
      await purge(
        '@supports (color: red) { @property --unused { syntax: "<color>"; inherits: false; initial-value: red; } :root { --unused: red; } }\n' +
          ".used { }",
      ),
    ).toBe(".used { }");
  });
});

describe("VariablesStructure", () => {
  it("marks the variables used through other variables, without dependencies between declarations", async () => {
    const purgeCSS = new PurgeCSS();
    await purgeCSS.purge({
      content: [{ raw: '<div class="a"></div>', extension: "html" }],
      css: [{ raw: ".a { --a: 1px; --b: var(--a); color: var(--b); }" }],
      variables: true,
    });
    const { nodes } = purgeCSS.variablesStructure;
    const [a] = nodes.get("--a") ?? [];
    const [b] = nodes.get("--b") ?? [];
    expect(a.isUsed).toBe(true);
    expect(b.isUsed).toBe(true);

    // deprecated, it no longer records anything
    purgeCSS.variablesStructure.addVariableUsage(
      b.value,
      b.value.value.matchAll(/var\((.+?)\)/g),
    );
    expect(b.nodes).toEqual([]);
  });
});
