import { PurgeCSS } from "./../src/index";

import { ROOT_TEST_EXAMPLES, findInCSS, notFindInCSS } from "./utils";

describe("safelist string", () => {
  let purgedCSS = "";
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}safelist/safelist.html`],
      css: [`${ROOT_TEST_EXAMPLES}safelist/safelist.css`],
      safelist: ["random", "h1", "yep", "button"],
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds safelisted selectors", () => {
    findInCSS(expect, [".random", "h1", "#yep", "button"], purgedCSS);
  });
});

describe("safelist regular expression", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}safelist/safelist.html`],
      css: [`${ROOT_TEST_EXAMPLES}safelist/safelist.css`],
      safelist: [/nav-/, /data-v-.*/],
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds safelisted selectors", () => {
    findInCSS(expect, [".nav-blue", ".nav-red", "[data-v-test]"], purgedCSS);
  });
});

describe("safelist option: standard", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}safelist/safelist.html`],
      css: [`${ROOT_TEST_EXAMPLES}safelist/safelist.css`],
      safelist: {
        standard: ["random", "h1", "yep", "button", /nav-/, /data-v-.*/],
      },
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds safelisted selectors", () => {
    findInCSS(
      expect,
      [
        ".random",
        "h1",
        "#yep",
        "button",
        ".nav-blue",
        ".nav-red",
        "[data-v-test]",
      ],
      purgedCSS,
    );
  });
});

describe("safelist option: deep", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [
        `${ROOT_TEST_EXAMPLES}safelist/safelist_patterns_children.html`,
      ],
      css: [`${ROOT_TEST_EXAMPLES}safelist/safelist_patterns_children.css`],
      safelist: {
        deep: [/^card$/],
      },
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds safelisted selectors", () => {
    findInCSS(
      expect,
      [".card", ".card .content", ".btn", ".card .btn .yellow"],
      purgedCSS,
    );
  });

  it("excludes selectors not safelisted", () => {
    notFindInCSS(expect, [".title", ".btn .red", ".btn__green"], purgedCSS);
  });
});

describe("safelist option: greedy", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}safelist/safelist_patterns_greedy.html`],
      css: [`${ROOT_TEST_EXAMPLES}safelist/safelist_patterns_greedy.css`],
      safelist: {
        greedy: [/data-v-.*/],
      },
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds safelisted selectors", () => {
    findInCSS(
      expect,
      [
        ".card",
        ".card[data-v-test]",
        ".card[data-v-test].card--large",
        ".card[data-v-test] .card-content",
      ],
      purgedCSS,
    );
  });

  it("excludes selectors not safelisted", () => {
    notFindInCSS(
      expect,
      [".card.card--large", ".card .card-content"],
      purgedCSS,
    );
  });
});

describe("safelist option: keyframes", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}safelist/safelist_keyframes.html`],
      css: [`${ROOT_TEST_EXAMPLES}safelist/safelist_keyframes.css`],
      safelist: {
        keyframes: [/^scale/, "spin"],
      },
      keyframes: true,
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds safelisted keyframes", () => {
    findInCSS(
      expect,
      ["@keyframes scale", "@keyframes scale-down", "@keyframes spin"],
      purgedCSS,
    );
  });

  it("excludes non-safelisted keyframes", () => {
    notFindInCSS(expect, ["flash"], purgedCSS);
  });
});

describe("safelist option: variables", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}safelist/safelist_css_variables.html`],
      css: [`${ROOT_TEST_EXAMPLES}safelist/safelist_css_variables.css`],
      safelist: {
        variables: [/^--b/, "--unused-color"],
      },
      variables: true,
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds safelisted css variables", () => {
    findInCSS(expect, ["--unused-color", "--button-color"], purgedCSS);
  });

  it("excludes non-safelisted css variables", () => {
    notFindInCSS(expect, ["--tertiary-color:"], purgedCSS);
  });
});

describe("blocklist option", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}safelist/blocklist.html`],
      css: [`${ROOT_TEST_EXAMPLES}safelist/blocklist.css`],
      blocklist: ["h1", "yep", "button", /nav-/],
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("excludes blocklisted selectors", () => {
    notFindInCSS(
      expect,
      ["h1", "yep", "button", "nav-blue", "nav-red"],
      purgedCSS,
    );
  });

  it("includes non-blocklisted selectors", () => {
    findInCSS(expect, ["data-v-test", ".random"], purgedCSS);
  });
});

describe("blocklist option with attribute selectors", () => {
  const content = [
    {
      raw: '<button type="button" class="btn">a</button><input type="reset" disabled><input type="submit">',
      extension: "html",
    },
  ];
  const css = [
    {
      raw: `
        button,
        [type='button'],
        [type="reset"],
        [type=submit] {
          appearance: button;
        }
        [type='button'].btn {
          color: red;
        }
        [type^='sub'] {
          color: green;
        }
        [disabled] {
          color: blue;
        }
      `,
    },
  ];

  async function purge(blocklist: Array<string | RegExp>): Promise<string> {
    const resultsPurge = await new PurgeCSS().purge({
      content,
      css,
      blocklist,
    });
    return resultsPurge[0].css;
  }

  it("keeps the attribute selectors when they are not blocklisted", async () => {
    const purgedCSS = await purge([]);
    findInCSS(
      expect,
      [
        "[type='button']",
        '[type="reset"]',
        "[type=submit]",
        "[type='button'].btn",
        "[type^='sub']",
        "[disabled]",
      ],
      purgedCSS,
    );
  });

  it("excludes an attribute selector blocklisted with its value", async () => {
    const purgedCSS = await purge(["[type='button']"]);
    notFindInCSS(expect, ["[type='button']"], purgedCSS);
    findInCSS(
      expect,
      ["button", '[type="reset"]', "[type=submit]", "[type^='sub']"],
      purgedCSS,
    );
  });

  it("ignores the quotes used in the blocklist and in the CSS", async () => {
    const purgedCSS = await purge([
      '[type="button"]',
      "[type=reset]",
      "[type='submit']",
    ]);
    notFindInCSS(
      expect,
      ["[type='button']", '[type="reset"]', "[type=submit]"],
      purgedCSS,
    );
    findInCSS(expect, ["button", "[type^='sub']", "[disabled]"], purgedCSS);
  });

  it("excludes attribute selectors matching a regular expression", async () => {
    const purgedCSS = await purge([/^\[type=["']?(button|reset)["']?\]$/]);
    notFindInCSS(expect, ["[type='button']", '[type="reset"]'], purgedCSS);
    findInCSS(expect, ["[type=submit]", "[type^='sub']"], purgedCSS);
  });

  it("takes the operator into account", async () => {
    const purgedCSS = await purge(["[type^=sub]"]);
    notFindInCSS(expect, ["[type^='sub']"], purgedCSS);
    findInCSS(expect, ["[type=submit]", "[type='button']"], purgedCSS);
  });

  it("excludes an attribute selector without value", async () => {
    const purgedCSS = await purge(["[disabled]"]);
    notFindInCSS(expect, ["[disabled]"], purgedCSS);
    findInCSS(expect, ["[type='button']"], purgedCSS);
  });

  it("still excludes every selector of an attribute blocklisted by its name", async () => {
    const purgedCSS = await purge(["type"]);
    notFindInCSS(expect, ["[type"], purgedCSS);
    findInCSS(expect, ["button", "[disabled]"], purgedCSS);
  });
});

describe("blocklisted attribute selector normalization", () => {
  async function purge(
    selector: string,
    blocklist: Array<string | RegExp>,
    attribute = "data-kind",
    value = "button",
  ): Promise<string> {
    const [result] = await new PurgeCSS().purge({
      content: [{ raw: "content", extension: "html" }],
      defaultExtractor: () => ({
        attributes: { names: [attribute], values: [value] },
        classes: [],
        ids: [],
        tags: [],
        undetermined: [],
      }),
      css: [{ raw: `${selector} { color: red }` }],
      blocklist,
    });
    return result.css;
  }

  it.each(["i", "s", "I", "S"])(
    "preserves the %s modifier when normalizing quotes",
    async (flag) => {
      const selector = `[data-kind='button' ${flag}]`;
      expect(await purge(selector, [])).toBe(`${selector} { color: red }`);
      expect(await purge(selector, [`[data-kind="button" ${flag}]`])).toBe("");
      expect(await purge(selector, [`[data-kind=button ${flag}]`])).toBe("");
    },
  );

  it.each([
    ["[data-kind='button' i]", '[data-kind="button"]'],
    ["[data-kind='button' s]", '[data-kind="button" i]'],
    ["[data-kind='button']", '[data-kind="button" s]'],
  ])("does not conflate the modifier in %s", async (selector, blocked) => {
    expect(await purge(selector, [blocked])).toBe(`${selector} { color: red }`);
  });

  it.each(["*", ""])(
    "preserves the %s namespace prefix when normalizing quotes",
    async (namespace) => {
      const selector = `[${namespace}|href='icon']`;
      expect(await purge(selector, [], "href", "icon")).toBe(
        `${selector} { color: red }`,
      );
      expect(
        await purge(selector, [`[${namespace}|href="icon"]`], "href", "icon"),
      ).toBe("");
    },
  );

  it.each(["[*|href='icon']", "[*|href]"])(
    "does not broaden a no-namespace blocklist to %s",
    async (selector) => {
      const blocked = selector.includes("=") ? '[href="icon"]' : "[href]";
      expect(await purge(selector, [blocked], "href", "icon")).toBe(
        `${selector} { color: red }`,
      );
    },
  );

  it("preserves named namespaces", async () => {
    const css =
      "@namespace svg \"http://www.w3.org/2000/svg\"; [svg|href='icon'] { color: red }";
    const options = {
      content: [{ raw: "href icon", extension: "html" }],
      css: [{ raw: css }],
    };
    expect(
      (
        await new PurgeCSS().purge({ ...options, blocklist: ['[href="icon"]'] })
      )[0].css,
    ).toBe(css);
    expect(
      (
        await new PurgeCSS().purge({
          ...options,
          blocklist: ['[svg|href="icon"]'],
        })
      )[0].css,
    ).toBe('@namespace svg "http://www.w3.org/2000/svg"');
  });

  it.each([
    [
      String.raw`[data-label='say "hi"']`,
      String.raw`[data-label="say \"hi\""]`,
      "data-label",
      'say "hi"',
    ],
    [
      String.raw`[data-label="it's ready"]`,
      String.raw`[data-label='it\'s ready']`,
      "data-label",
      "it's ready",
    ],
    [
      String.raw`[data-path='a\\b']`,
      String.raw`[data-path="a\\b"]`,
      "data-path",
      String.raw`a\b`,
    ],
    [
      String.raw`[data\:kind='button']`,
      String.raw`[data\:kind="button"]`,
      "data:kind",
      "button",
    ],
    [
      "[data-label='hello world']",
      String.raw`[data-label=hello\ world]`,
      "data-label",
      "hello world",
    ],
  ])(
    "escapes quote variants of %s",
    async (selector, blocked, attribute, value) => {
      expect(await purge(selector, [], attribute, value)).toBe(
        `${selector} { color: red }`,
      );
      expect(await purge(selector, [blocked], attribute, value)).toBe("");
      expect(await purge(blocked, [selector], attribute, value)).toBe("");
    },
  );

  it.each([
    ["[data-kind='button'i]", '[data-kind="button"i]'],
    ["[ data-kind = 'button' ]", '[ data-kind = "button" ]'],
    ["[ data-kind = 'button' ]", '[data-kind="button"]'],
    ["[ data-kind = 'button'  i ]", '[data-kind="button" i]'],
    ["[ data-kind /* comment */ = 'button' s ]", '[data-kind="button" s]'],
    ["[ data-kind ]", "[data-kind]"],
  ])("normalizes whitespace in %s", async (selector, blocked) => {
    expect(await purge(selector, [])).toBe(`${selector} { color: red }`);
    expect(await purge(selector, [blocked])).toBe("");
  });

  it("tests regexes against escaped selectors with their modifiers", async () => {
    expect(
      await purge("[data-kind='button' i]", [/^\[data-kind="button" i\]$/]),
    ).toBe("");
    expect(
      await purge("[data-kind='button' i]", [/^\[data-kind="button"\]$/]),
    ).toBe("[data-kind='button' i] { color: red }");
    expect(
      await purge(
        String.raw`[data-label='say "hi"']`,
        [/^\[data-label="say \\"hi\\""\]$/],
        "data-label",
        'say "hi"',
      ),
    ).toBe("");
  });

  it("matches existing unanchored regexes against attribute values", async () => {
    expect(
      await purge('[data-kind="nav-top"]', [/nav-/], "data-kind", "nav-top"),
    ).toBe("");
  });
});
