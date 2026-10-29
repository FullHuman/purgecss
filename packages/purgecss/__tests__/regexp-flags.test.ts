import { PurgeCSS, type UserDefinedOptions } from "./../src/index";

// a regular expression with the g or y flag keeps its lastIndex between
// calls to test(), so it has to be reset before each match
describe("regular expressions with the global flag", () => {
  const purge = async (
    css: string,
    options: Partial<UserDefinedOptions>,
  ): Promise<string> => {
    const [result] = await new PurgeCSS().purge({
      content: [
        {
          raw: '<div class="used-1 used-2 used-3 used-4"></div>',
          extension: "html",
        },
      ],
      css: [{ raw: css }],
      ...options,
    });
    return result.css;
  };

  it("matches every selector with safelist standard", async () => {
    const css = await purge(".keep-1 {} .keep-2 {} .keep-3 {} .keep-4 {}", {
      safelist: { standard: [/^keep-/g] },
    });
    expect(css).toBe(".keep-1 {} .keep-2 {} .keep-3 {} .keep-4 {}");
  });

  it("matches every selector with safelist deep", async () => {
    const css = await purge(
      ".keep-1 .a {} .keep-2 .a {} .keep-3 .a {} .keep-4 .a {}",
      { safelist: { deep: [/^keep-/g] } },
    );
    expect(css).toBe(".keep-1 .a {} .keep-2 .a {} .keep-3 .a {} .keep-4 .a {}");
  });

  it("matches every selector with safelist greedy", async () => {
    const css = await purge(
      ".keep-1.a {} .keep-2.a {} .keep-3.a {} .keep-4.a {}",
      { safelist: { greedy: [/^keep-/g] } },
    );
    expect(css).toBe(".keep-1.a {} .keep-2.a {} .keep-3.a {} .keep-4.a {}");
  });

  it("matches every selector with blocklist", async () => {
    const css = await purge(".used-1 {} .used-2 {} .used-3 {} .used-4 {}", {
      blocklist: [/^used-/g],
    });
    expect(css).toBe("");
  });

  it("matches every keyframes with safelist keyframes", async () => {
    const css = await purge(
      "@keyframes keep-1 {} @keyframes keep-2 {} @keyframes keep-3 {} @keyframes keep-4 {}",
      { keyframes: true, safelist: { keyframes: [/^keep-/g] } },
    );
    expect(css).toBe(
      "@keyframes keep-1 {} @keyframes keep-2 {} @keyframes keep-3 {} @keyframes keep-4 {}",
    );
  });

  it("matches every variable with safelist variables", async () => {
    const css = await purge(
      ":root { --keep-1: 1; --keep-2: 2; --keep-3: 3; --keep-4: 4; }",
      { variables: true, safelist: { variables: [/^--keep-/g] } },
    );
    expect(css).toBe(
      ":root { --keep-1: 1; --keep-2: 2; --keep-3: 3; --keep-4: 4; }",
    );
  });
});
