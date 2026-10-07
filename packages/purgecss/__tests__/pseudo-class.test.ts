import { PurgeCSS } from "./../src/index";
import { findInCSS, ROOT_TEST_EXAMPLES } from "./utils";

describe(":not pseudo class", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/not.html`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/not.css`],
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds foo-bar", () => {
    expect(purgedCSS.includes("foo-bar")).toBe(true);
  });
  it("finds foo", () => {
    expect(purgedCSS.includes(".foo")).toBe(true);
  });
});

describe("pseudo selectors", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_selector.html`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_selector.css`],
    });
    purgedCSS = resultsPurge[0].css;
  });
  it("finds some-item:nth-child(2n)", () => {
    expect(purgedCSS.includes("some-item:nth-child(2n)")).toBe(true);
  });

  it("finds some-item:nth-child(2n + 1)", () => {
    expect(purgedCSS.includes("some-item:nth-child(2n + 1)")).toBe(true);
  });

  it("finds some-item:nth-of-type(n+3)", () => {
    expect(purgedCSS.includes("some-item:nth-of-type(n+3)")).toBe(true);
  });

  it("finds some-item:nth-of-type(-1n+6)", () => {
    expect(purgedCSS.includes("some-item:nth-of-type(-1n+6)")).toBe(true);
  });

  it("finds some-item:nth-of-type(-n+6)", () => {
    expect(purgedCSS.includes("some-item:nth-of-type(-n+6)")).toBe(true);
  });

  it("removes unused:only-child()", () => {
    expect(purgedCSS.includes("unused:only-child()")).toBe(false);
  });

  it("finds used:only-child()", () => {
    expect(purgedCSS.includes("used:only-child()")).toBe(true);
  });

  it("finds odd-item:nth-child(odd)", () => {
    expect(purgedCSS.includes("odd-item:nth-child(odd)")).toBe(true);
  });
});

describe("nth-child", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/nth_child.html`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/nth_child.css`],
    });
    purgedCSS = resultsPurge[0].css;
  });
  it("finds some-item:nth-child(2n)", () => {
    expect(purgedCSS.includes("some-item:nth-child(2n)")).toBe(true);
  });
  it("finds some-item:nth-child(2n+1)", () => {
    expect(purgedCSS.includes("some-item:nth-child(2n+1)")).toBe(true);
  });
  it('removes canvas (contains "n")', () => {
    expect(purgedCSS.includes("canvas")).toBe(false);
  });
});

describe("pseudo classes", () => {
  it("finds div:before", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_class.js`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_class.css`],
    });
    const purgedCSS = resultsPurge[0].css;
    expect(purgedCSS.includes("div:before")).toBe(true);
  });

  it("removes row:after", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_class.js`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/pseudo_class.css`],
    });
    const purgedCSS = resultsPurge[0].css;
    expect(purgedCSS.includes("row:after")).toBe(false);
  });
});

describe(":where pseudo class", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/where.html`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/where.css`],
      safelist: {
        standard: ["[&:where(.a)]:text-black"],
      },
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("removes unused selectors", () => {
    expect(purgedCSS.includes(".unused")).toBe(false);
  });

  it("keeps used selectors", () => {
    findInCSS(
      expect,
      [
        ".root :where(.a) .c {",
        ".root:where(.a) .c {",
        ".\\[\\&\\:where\\(\\.a\\)\\]\\:text-black:where(.a) {",
      ],
      purgedCSS,
    );
  });
});

describe(":where/:is combined with other pseudo classes at the root level", () => {
  const purge = async (css: string, raw: string): Promise<string> => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [{ raw, extension: "html" }],
      css: [{ raw: css }],
    });
    return resultsPurge[0].css;
  };

  it("keeps :where(.x) when x is used", async () => {
    expect(await purge(":where(.aaa){color:red}", "aaa")).toContain("aaa");
  });

  it("keeps .x:not(_) when x is used", async () => {
    expect(await purge(".bbb:not(_){color:red}", "bbb")).toContain("bbb");
  });

  it("keeps :where(.x):not(_) when x is used", async () => {
    expect(await purge(":where(.aaa):not(_){color:red}", "aaa")).toContain(
      "aaa",
    );
  });

  it("keeps :where(.x):not(_):not(_) when x is used", async () => {
    expect(
      await purge(":where(.ccc):not(_):not(_){color:red}", "ccc"),
    ).toContain("ccc");
  });

  it("keeps :is(.x):not(_) when x is used", async () => {
    expect(await purge(":is(.ddd):not(_){color:red}", "ddd")).toContain("ddd");
  });

  it("removes :where(.x):not(_) when x is unused", async () => {
    expect(await purge(":where(.unused):not(_){color:red}", "aaa")).toBe("");
  });

  it("keeps the used class inside :where() and trims the unused one", async () => {
    const result = await purge(
      ":where(.unused, .aaa):not(_):not(_){color:red}",
      "aaa",
    );
    expect(result).toContain(".aaa");
    expect(result).not.toContain(".unused");
  });
});

describe("root-level pseudo-class selectors", () => {
  const purge = async (css: string, raw: string): Promise<string> => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [{ raw, extension: "html" }],
      css: [{ raw: css }],
    });
    return resultsPurge[0].css;
  };

  it("keeps :is(h1, h2, h3) when an h2 is present", async () => {
    expect(await purge(":is(h1, h2, h3){color:red}", "<h2>x</h2>")).toContain(
      "h2",
    );
  });

  it("removes :is(h1, h2, h3) when no matching tag is present", async () => {
    expect(await purge(":is(h1, h2, h3){color:red}", "<p>x</p>")).toBe("");
  });

  it("keeps :is(body) when body is present", async () => {
    expect(
      await purge(":is(body){background:white}", "<body></body>"),
    ).toContain("body");
  });

  it("keeps :is(button, input):not(.x) when a button is present", async () => {
    expect(
      await purge(
        ":is(button, input):not(.some-class){color:red}",
        "<button>b</button>",
      ),
    ).toContain("button");
  });

  it("removes :is(button, input):not(.x) when neither tag is present", async () => {
    expect(
      await purge(
        ":is(button, input):not(.some-class){color:red}",
        "<div>d</div>",
      ),
    ).toBe("");
  });

  it("keeps :where(:not(...):not(...)) combined with a present class", async () => {
    const css =
      ".is-layout-constrained > :where(:not(.alignleft):not(.alignright):not(.alignfull)){margin:1px}";
    expect(
      await purge(css, "<div class='is-layout-constrained'><p>x</p></div>"),
    ).toContain(".is-layout-constrained");
  });

  it("removes :where(:not(...)) when its class is absent", async () => {
    const css =
      ".is-layout-constrained > :where(:not(.alignleft):not(.alignright):not(.alignfull)){margin:1px}";
    expect(await purge(css, "<div><p>x</p></div>")).toBe("");
  });

  it("keeps :where(.x) > :first-child when the class is present", async () => {
    expect(
      await purge(
        ":where(.wp-site-blocks) > :first-child{margin:1px}",
        "<div class='wp-site-blocks'><p>x</p></div>",
      ),
    ).toContain(".wp-site-blocks");
  });

  it("removes :where(.x) > :first-child when the class is absent", async () => {
    expect(
      await purge(
        ":where(.wp-site-blocks) > :first-child{margin:1px}",
        "<div><p>x</p></div>",
      ),
    ).toBe("");
  });

  it("keeps a bare :hover rule", async () => {
    expect(await purge(":hover{color:red}", "<div>x</div>")).toContain(
      ":hover",
    );
  });

  it("keeps a bare :not(:hover) rule", async () => {
    expect(await purge(":not(:hover){color:red}", "<div>x</div>")).toContain(
      ":not(:hover)",
    );
  });
});

describe(":is pseudo class", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}pseudo-class/is.html`],
      css: [`${ROOT_TEST_EXAMPLES}pseudo-class/is.css`],
      safelist: {
        standard: ["[&:is(.a)]:text-black"],
      },
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("removes unused selectors", () => {
    expect(purgedCSS.includes(".unused")).toBe(false);
    expect(purgedCSS.includes(":is(.unused)")).toBe(false);
  });

  it("keeps used selectors", () => {
    findInCSS(
      expect,
      [
        ".root :is(.a) .c {",
        ".root:is(.a) .c {",
        ".\\[\\&\\:is\\(\\.a\\)\\]\\:text-black:is(.a) {",
        ":is(.b)",
      ],
      purgedCSS,
    );
  });
});
