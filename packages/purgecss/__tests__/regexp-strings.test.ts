import { PurgeCSS, type UserDefinedOptions } from "./../src/index";

// configuration files like postcss.config.json cannot contain regular
// expressions, so they can be written as strings between slashes
describe("regular expressions written as strings", () => {
  const purge = async (
    css: string,
    options: Partial<UserDefinedOptions>,
  ): Promise<string> => {
    const [result] = await new PurgeCSS().purge({
      content: [
        {
          raw: '<div class="used-1 used-2" data-state="open"></div>',
          extension: "html",
        },
      ],
      css: [{ raw: css }],
      // the options of a JSON file, where regular expressions are strings
      ...JSON.parse(JSON.stringify(options)),
    });
    return result.css;
  };

  it("matches the selectors of safelist standard", async () => {
    const css = await purge(
      ".keep-1 {} .keep-2 {} .keep-exact {} .keep- {} .unused {}",
      { safelist: { standard: ["/^keep-\\d/", "keep-exact"] } },
    );
    expect(css).toBe(".keep-1 {} .keep-2 {} .keep-exact {}");
  });

  it("matches the selectors of safelist deep and greedy", async () => {
    const css = await purge(
      ".modal-header .title {} .btn-primary.unused {} .unused .title {}",
      {
        safelist: { deep: ["/^modal-/"], greedy: ["/^btn-/"] },
      } as unknown as Partial<UserDefinedOptions>,
    );
    expect(css).toBe(".modal-header .title {} .btn-primary.unused {}");
  });

  it("uses the flags after the last slash", async () => {
    const css = await purge(".keep-1 {} .unused {}", {
      safelist: ["/^KEEP-/i"],
    });
    expect(css).toBe(".keep-1 {}");
  });

  it("matches the keyframes and the variables of the safelist", async () => {
    const css = await purge(
      "@keyframes spin {} @keyframes fade {} :root { --keep-color: red; --other: blue; }",
      {
        keyframes: true,
        variables: true,
        safelist: { keyframes: ["/^sp/"], variables: ["/^--keep-/"] },
      },
    );
    expect(css).toBe("@keyframes spin {} :root { --keep-color: red; }");
  });

  it("matches the selectors of the blocklist", async () => {
    const css = await purge(".used-1 {} .used-2 {}", {
      blocklist: ["/^used-1$/"],
    });
    expect(css).toBe(".used-2 {}");
  });

  it("matches the attributes of dynamicAttributes", async () => {
    const css = await purge(
      '.used-1[data-highlighted] {} .used-1[aria-invented="1"] {}',
      { dynamicAttributes: ["/^data-/"] },
    );
    expect(css).toBe(".used-1[data-highlighted] {}");
  });

  it("throws on an invalid regular expression", async () => {
    await expect(purge(".keep-1 {}", { safelist: ["/[/"] })).rejects.toThrow(
      "Invalid regular expression",
    );
  });
});
