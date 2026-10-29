import { PurgeCSS } from "../src";

async function purge(
  css: string,
  blocklist: Array<string | RegExp>,
): Promise<string> {
  const [result] = await new PurgeCSS().purge({
    content: [],
    dynamicAttributes: ["type"],
    css: [{ raw: css }],
    blocklist,
  });
  return result.css;
}

describe("attribute blocklist CSS tokenization", () => {
  const escapeCases = [2, 3, 4, 5, 6].flatMap((digits) =>
    ["", " ", "\t", "\n", "\r", "\r\n", "\f"].map(
      (terminator) =>
        [
          digits,
          JSON.stringify(terminator),
          `[type="\\${"62".padStart(digits, "0")}${terminator}utton"]`,
        ] as const,
    ),
  );

  it.each(escapeCases)(
    "decodes a %i-digit hex escape terminated by %s",
    async (_digits, _terminator, escaped) => {
      const plain = '[type="button"]';
      expect(await purge(`${plain}{color:red}`, [escaped])).toBe("");
      expect(await purge(`${escaped}{color:red}`, [plain])).toBe("");
    },
  );

  it.each(["\n", "\r", "\r\n", "\f"])(
    "consumes escaped line continuations (%j)",
    async (newline) => {
      const escaped = `[type="but\\${newline}ton"]`;
      const plain = '[type="button"]';
      expect(await purge(`${plain}{color:red}`, [escaped])).toBe("");
      expect(await purge(`${escaped}{color:red}`, [plain])).toBe("");
      expect(
        await purge(String.raw`[type="but\a ton"]{color:blue}`, [escaped]),
      ).toBe(String.raw`[type="but\a ton"]{color:blue}`);
    },
  );

  it("keeps a literal space distinct from an escape terminator", async () => {
    expect(
      await purge('[type=button]{color:red}[type="b utton"]{color:blue}', [
        String.raw`[type="\000062 utton"]`,
      ]),
    ).toBe('[type="b utton"]{color:blue}');
  });

  it("requires another separator after an unquoted hex escape before a modifier", async () => {
    const css = '[type="caféi"]{color:red}[type="café" i]{color:blue}';
    expect(await purge(css, [String.raw`[type=caf\0000E9 i]`])).toBe(
      '[type="café" i]{color:blue}',
    );
    expect(await purge(css, [String.raw`[type=caf\0000E9  i]`])).toBe(
      '[type="caféi"]{color:red}',
    );
  });

  it.each([
    [String.raw`[\000074 ype=button]`, '[type="button"]'],
    [String.raw`[s\000076 g|type=button]`, '[svg|type="button"]'],
  ])(
    "decodes escaped names in the blocklist entry %s",
    async (escaped, plain) => {
      // The stylesheet's selector parser rejects these spellings before the
      // blocklist is evaluated, so use ordinary names in the input CSS.
      expect(await purge(`${plain}{color:red}`, [escaped])).toBe("");
    },
  );

  it.each([
    ["[svg/**/|/**/type=button]", '[svg|type="button"]'],
    [String.raw`[type="\01f680"]`, '[type="🚀"]'],
  ])("decodes the complete attribute %s", async (escaped, plain) => {
    expect(await purge(`${plain}{color:red}`, [escaped])).toBe("");
    expect(await purge(`${escaped}{color:red}`, [plain])).toBe("");
  });

  it.each([String.raw`\*`, String.raw`\2a`])(
    "preserves the namespace escape %s when generating regex quote variants",
    async (namespace) => {
      const selector = `[${namespace}|type='button']`;
      const quoted = `[${namespace}|type="button"]`;
      const pattern = new RegExp(
        `^${quoted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      );
      expect(await purge(`${selector}{color:red}`, [pattern])).toBe("");
      expect(await purge("[*|type='button']{color:blue}", [pattern])).toBe(
        "[*|type='button']{color:blue}",
      );
    },
  );

  it("treats brackets and comment markers inside quoted values as text", async () => {
    const css = '[type="a]/*b*/"]{color:red}[type=a]{color:blue}';
    expect(await purge(css, ["[type='a]/*b*/']"])).toBe("[type=a]{color:blue}");
  });

  it.each(["/**/", "/**//**/", "/* comment */"])(
    "preserves the token boundary at %s",
    async (comment) => {
      for (const flag of ["i", "s"]) {
        const entry = `[type=button${comment}${flag}]`;
        const plain = `[type=button ${flag}]`;
        const neighbor = `[type=button${flag}]{color:blue}`;
        expect(await purge(`${plain}{color:red}${neighbor}`, [entry])).toBe(
          neighbor,
        );
        expect(await purge(`${entry}{color:red}`, [plain])).toBe("");
      }
    },
  );

  it.each([
    ['[type="button""reset"]', "[type=reset]"],
    ['[type=button"reset"]', "[type=reset]"],
    ['[type="button" i s]', "[type=button s]"],
    ['[type="button" s i]', "[type=button i]"],
    ['[type="button" i i]', "[type=button i]"],
    ["[type=but/**/ton]", "[type=button]"],
    ["[ty/**/pe=button]", "[type=button]"],
    ["[type=123]", '[type="123"]'],
    ["[type~ =button]", "[type~=button]"],
    ["[type~/**/=button]", "[type~=button]"],
    ["[type='button' bogus]", "[type=button]"],
    ["[type='button'] /* unclosed", "[type=button]"],
  ])("does not repair malformed entry %s", async (entry, selector) => {
    const css = `${selector}{color:red}`;
    expect(await purge(css, [entry])).toBe(css);
  });

  it("still matches malformed attribute-like strings as literal class names", async () => {
    const literal = '[type="button""reset"]';
    const [result] = await new PurgeCSS().purge({
      content: [{ raw: "content", extension: "html" }],
      defaultExtractor: () => [literal, "type", "reset"],
      css: [
        {
          raw: String.raw`.\[type\=\"button\"\"reset\"\]{color:red}[type=reset]{color:blue}`,
        },
      ],
      blocklist: [literal],
    });
    expect(result.css).toBe("[type=reset]{color:blue}");
  });

  it("accepts comments around a complete attribute entry", async () => {
    expect(
      await purge("[type=button]{color:red}", [
        '/* before */ [type="button"] /* after */',
      ]),
    ).toBe("");
  });

  it.each([
    [
      String.raw`[type="\000062 utton"]`,
      /^\[type="b utton"\]$/,
      /^\[type="button"\]$/,
    ],
    ["[type=button/**/i]", /^\[type=buttoni\]$/, /^\[type=button i\]$/],
  ])(
    "does not generate incorrect regex candidates for %s",
    async (selector, different, equivalent) => {
      const css = `${selector}{color:red}`;
      expect(await purge(css, [different])).toBe(css);
      expect(await purge(css, [equivalent])).toBe("");
    },
  );

  it("reads original attributes at their offsets inside compound and nested selectors", async () => {
    const [result] = await new PurgeCSS().purge({
      content: [{ raw: "one two keep", extension: "html" }],
      dynamicAttributes: ["type"],
      css: [
        {
          raw: '.one[type="but\\\nton"],.two:is([type=button/**/i],.keep){color:red}',
        },
      ],
      blocklist: ['[type="button"]', '[type="button" i]'],
    });
    expect(result.css).toBe(".two:is(.keep){color:red}");
  });
});
