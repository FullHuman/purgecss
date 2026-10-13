import postcss from "postcss";
import { PurgeCSS, UserDefinedOptions } from "../src";

describe("CSS variables in keyframes", () => {
  async function purge(css: string, options: Partial<UserDefinedOptions> = {}) {
    const [result] = await new PurgeCSS().purge({
      content: [],
      css: [{ raw: css }],
      variables: true,
      safelist: [/.*/],
      ...options,
    });
    return postcss.parse(result.css);
  }

  function variables(root: postcss.Root) {
    const names: string[] = [];
    root.walkDecls(/^--/, ({ prop }) => {
      names.push(prop);
    });
    return names;
  }

  it.each([" ", "\n\t"])(
    "handles whitespace in local usages and forward dependencies: %j",
    async (space) => {
      const root = await purge(`
        :root { --base: red; --unused: blue; }
        @keyframes pulse {
          from {
            --color: var(${space}--alias${space});
            --alias: var(${space}--base${space});
            color: var(${space}--missing${space}, var(${space}--color${space}));
          }
        }
      `);

      expect(variables(root)).toEqual(["--base", "--color", "--alias"]);
    },
  );

  it.each(["--public", /^--public$/])(
    "keeps dependencies of safelisted local variables: %s",
    async (variable) => {
      const root = await purge(
        `
          :root { --base: red; --unused: blue; }
          @keyframes pulse {
            from { --public: var(--private); --private: var(--base); }
          }
        `,
        { safelist: { standard: [/.*/], variables: [variable] } },
      );

      expect(variables(root)).toEqual(["--base", "--public", "--private"]);
    },
  );

  it.each([
    "/* purgecss ignore */ from { --keep: red; }",
    "from { /* purgecss ignore current */ --keep: red; }",
    "/* purgecss start ignore */ from { --keep: red; } /* purgecss end ignore */",
  ])("respects ignored keyframe rules: %s", async (rule) => {
    const root = await purge(`
      @keyframes pulse {
        ${rule}
        to { --unused: blue; opacity: 1; }
      }
    `);

    expect(variables(root)).toEqual(["--keep"]);
  });

  it("respects ignore ranges enclosing an entire animation", async () => {
    const root = await purge(`
      /* purgecss start ignore */
      @keyframes pulse { from { --keep: red; } }
      /* purgecss end ignore */
      @keyframes other { from { --unused: blue; opacity: 1; } }
    `);

    expect(variables(root)).toEqual(["--keep"]);
  });

  it.each([false, true])(
    "keeps variable overrides across CSS inputs with keyframes: %s",
    async (keyframes) => {
      const results = await new PurgeCSS().purge({
        content: [],
        variables: true,
        keyframes,
        safelist: { standard: [/.*/], variables: ["--keep"] },
        css: [
          {
            raw: `
              :root { --color: var(--base); --base: red; }
              .input { animation: pulse 1s; }
              @keyframes pulse { from { color: var(--color); } }
            `,
          },
          {
            raw: `
              :root { --color: var(--base); --base: blue; --keep: white; }
              .other { color: black; }
            `,
          },
        ],
      });

      expect(variables(postcss.parse(results[0].css))).toEqual([
        "--color",
        "--base",
      ]);
      expect(variables(postcss.parse(results[1].css))).toEqual([
        "--color",
        "--base",
        "--keep",
      ]);
    },
  );

  it("keeps animation overrides across CSS inputs", async () => {
    const results = await new PurgeCSS().purge({
      content: [],
      variables: true,
      keyframes: true,
      safelist: [/.*/],
      css: [
        {
          raw: `
            :root { --color: red; }
            .input { animation: pulse 1s; }
            @keyframes pulse { from { color: var(--color); } }
          `,
        },
        {
          raw: `
            :root { --color: blue; }
            @keyframes pulse { from { color: var(--color); } }
          `,
        },
      ],
    });

    expect(results[0].css).toContain("--color:");
    expect(results[1].css).toContain("--color:");
    expect(results[1].css).toContain("@keyframes pulse");
  });

  it.each([
    "/* purgecss ignore */ to { color: var(--color); --protected: var(--private); }",
    "to { /* purgecss ignore current */ color: var(--color); --protected: var(--private); }",
    "/* purgecss start ignore */ to { color: var(--color); --protected: var(--private); } /* purgecss end ignore */",
  ])("keeps dependencies used by ignored keyframe rules: %s", async (rule) => {
    const root = await purge(`
      :root { --base: red; }
      @keyframes pulse {
        from { --color: var(--base); --private: blue; --unused: white; }
        ${rule}
      }
    `);

    expect(variables(root)).toEqual([
      "--base",
      "--color",
      "--private",
      "--protected",
    ]);
  });

  it("does not keep dependencies of ignored rules in removed animations", async () => {
    const root = await purge(
      `
        :root { --base: red; }
        @keyframes unused {
          from { /* purgecss ignore current */ color: var(--base); }
        }
      `,
      { keyframes: true },
    );

    expect(variables(root)).toEqual([]);
    expect(root.toString()).not.toContain("@keyframes");
  });

  it.each(["g", "y"])(
    "keeps safelisted dependencies without changing RegExp state: %s",
    async (flags) => {
      const pattern = new RegExp("^--public-", flags);
      pattern.lastIndex = 5;
      for (let run = 0; run < 2; run++) {
        const root = await purge(
          `
            @keyframes pulse {
              from {
                --public-a: red;
                --public-b: var(--private);
                --private: blue;
                --unused: white;
              }
            }
          `,
          { safelist: { standard: [/.*/], variables: [pattern] } },
        );

        expect(variables(root)).toEqual([
          "--public-a",
          "--public-b",
          "--private",
        ]);
        expect(pattern.lastIndex).toBe(5);
      }
    },
  );

  it.each(["\u1680", "\ufeff"])(
    "preserves non-ASCII identifier characters in variable usages: %j",
    async (suffix) => {
      const root = await purge(`
        :root { --base${suffix}: red; --unused: white; }
        @keyframes pulse {
          from {
            --alias${suffix}: var( --base${suffix} );
            --color${suffix}: var(--alias${suffix});
            color: var( --color${suffix} );
          }
        }
      `);

      expect(variables(root)).toEqual([
        `--base${suffix}`,
        `--alias${suffix}`,
        `--color${suffix}`,
      ]);
    },
  );

  it("isolates variables between calls on the same PurgeCSS instance", async () => {
    const purgeCSS = new PurgeCSS();
    const options = { content: [], variables: true, safelist: [/.*/] };
    await purgeCSS.purge({
      ...options,
      css: [
        {
          raw: ":root { --color: red; } @keyframes pulse { from { color: var(--color); } }",
        },
      ],
    });
    const [result] = await purgeCSS.purge({
      ...options,
      css: [{ raw: ":root { --color: blue; }" }],
    });

    expect(variables(postcss.parse(result.css))).toEqual([]);
  });

  it.each([false, true])(
    "keeps variables used only in keyframes and their forward dependencies with keyframes: %s",
    async (keyframes) => {
      const root = await purge(
        `
          :root {
            --reject: var(--negative);
            --negative: #ffebeb;
            --unused: white;
          }
          .input { animation: reject .3s; }
          @keyframes reject { from { background-color: var(--reject); } }
        `,
        { keyframes },
      );

      expect(variables(root)).toEqual(["--reject", "--negative"]);
      expect(root.toString()).toContain("var(--reject)");
      expect(root.toString()).toContain("@keyframes reject");
    },
  );

  it.each(["keyframes", "-webkit-keyframes"])(
    "follows dependency chains and nested fallbacks in @%s regardless of declaration order",
    async (name) => {
      const root = await purge(`
        @${name} reject {
          0%, 99.9% { background: var(--missing, var(--reject)); }
        }
        :root {
          --reject: var(--alias);
          --alias: var(--negative);
          --negative: red;
          --unused: white;
        }
      `);

      expect(variables(root)).toEqual(["--reject", "--alias", "--negative"]);
      expect(root.toString()).toContain("0%, 99.9%");
    },
  );

  it("follows all declarations of a variable and terminates on cycles", async () => {
    const root = await purge(`
      :root { --reject: var(--light); --light: var(--reject); }
      .dark { --reject: var(--dark); --dark: red; --unused: blue; }
      @keyframes reject { from { color: var(--reject); } }
    `);

    expect(variables(root)).toEqual([
      "--reject",
      "--light",
      "--reject",
      "--dark",
    ]);
  });

  it("tracks custom properties declared within keyframes", async () => {
    const root = await purge(`
      :root { --negative: red; --unused: blue; }
      @keyframes reject {
        from {
          --reject: var(--negative);
          --local-unused: var(--unused);
          color: var(--reject);
        }
      }
    `);

    expect(variables(root)).toEqual(["--negative", "--reject"]);
  });

  it.each(["keyframes", "-webkit-keyframes"])(
    "removes variables used only by a removed @%s animation",
    async (name) => {
      const root = await purge(
        `
          :root {
            --reject: var(--negative);
            --negative: red;
            --unused: white;
          }
          .removed { animation: reject .3s; }
          @${name} reject { from { color: var(--reject); } }
        `,
        { keyframes: true, safelist: [] },
      );

      expect(variables(root)).toEqual([]);
      expect(root.toString()).not.toContain(`@${name}`);
      expect(root.toString()).not.toContain(".removed");
    },
  );

  it("keeps variables in unreferenced animations when keyframe removal is disabled", async () => {
    const root = await purge(`
      :root { --color: red; --unused: white; }
      @keyframes reject { from { color: var(--color); } }
    `);

    expect(variables(root)).toEqual(["--color"]);
  });

  it.each(["reject", /^reject$/])(
    "keeps variables in safelisted animations: %s",
    async (animation) => {
      const root = await purge(
        `
          :root { --color: red; --unused: white; }
          @-webkit-keyframes reject { from { color: var(--color); } }
          @keyframes unused { from { color: var(--unused); } }
        `,
        {
          keyframes: true,
          safelist: { standard: [/.*/], keyframes: [animation] },
        },
      );

      expect(variables(root)).toEqual(["--color"]);
      expect(root.toString()).toContain("@-webkit-keyframes reject");
      expect(root.toString()).not.toContain("@keyframes unused");
    },
  );

  it("keeps shared dependencies and normal usages while removing unused animations", async () => {
    const root = await purge(
      `
        :root {
          --active: var(--shared);
          --inactive: var(--shared);
          --shared: red;
          --text: black;
          --unused: white;
        }
        .input { animation-name: active; color: var(--text); }
        @keyframes active { to { color: var(--active); } }
        @keyframes inactive { to { color: var(--inactive); } }
      `,
      { keyframes: true },
    );

    expect(variables(root)).toEqual(["--active", "--shared", "--text"]);
    expect(root.toString()).toContain("@keyframes active");
    expect(root.toString()).not.toContain("@keyframes inactive");
  });

  it("leaves variables intact when variable removal is disabled", async () => {
    const root = await purge(
      `
        :root { --color: red; --unused: white; }
        .input { animation: reject .3s; }
        @keyframes reject { from { color: var(--color); } }
      `,
      { variables: false, keyframes: true },
    );

    expect(variables(root)).toEqual(["--color", "--unused"]);
  });
});
