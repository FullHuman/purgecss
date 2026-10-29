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
