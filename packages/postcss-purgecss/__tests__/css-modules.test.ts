import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import postcss from "postcss";
import postcssModules from "postcss-modules";

import purgeCSSPlugin, { UserDefinedOptions } from "../src/";

const css = `
.base { color: red }
.modUsed { composes: base; margin: 0 }
.modUnused { padding: 0 }
.modUsed:hover { margin: 1px }
.modUsed .modUnused { margin: 2px }
.global-used { color: blue }
`;

/**
 * Run postcss-modules then PurgeCSS, as Vite does with a `.module.css` file
 */
async function purgeCSSModule(
  content: string,
  modulesOptions: Parameters<typeof postcssModules>[0] = {},
  options: Omit<UserDefinedOptions, "content"> = {},
): Promise<{ css: string; tokens: Record<string, string> }> {
  let tokens: Record<string, string> = {};
  const result = await postcss([
    postcssModules({
      ...modulesOptions,
      getJSON: (_, json) => {
        tokens = json;
      },
    }),
    purgeCSSPlugin({
      ...options,
      content: [{ raw: content, extension: "js" }],
    }),
  ]).process(css, { from: "/project/src/app.module.css" });
  return { css: result.css, tokens };
}

describe("Purgecss postcss plugin with CSS modules", () => {
  it("keeps the scoped classes whose local name is used in the content", async () => {
    const { css: purgedCSS, tokens } = await purgeCSSModule(
      `import styles from "./app.module.css";
      export const App = () => <div className={styles.modUsed}></div>;`,
    );
    const modUsed = tokens.modUsed.split(" ")[0];
    const [base] = tokens.base.split(" ");
    // the names are scoped, e.g. `_modUsed_1x2y3_3`
    expect(modUsed).not.toBe("modUsed");

    expect(purgedCSS).toContain(`.${modUsed} {`);
    expect(purgedCSS).toContain(`.${modUsed}:hover`);
    // composed by a used class
    expect(purgedCSS).toContain(`.${base} {`);
    expect(purgedCSS).not.toContain(tokens.modUnused);
    expect(purgedCSS).not.toContain("global-used");
  });

  it("removes the scoped classes whose local name is not used", async () => {
    const { css: purgedCSS, tokens } = await purgeCSSModule(
      `<div class="global-used"></div>`,
    );
    for (const localName of ["base", "modUsed", "modUnused"]) {
      for (const scopedName of tokens[localName].split(" ")) {
        expect(purgedCSS).not.toContain(scopedName);
      }
    }
    expect(purgedCSS.trim()).toBe(`.${tokens["global-used"]} { color: blue }`);
  });

  it("uses the local names converted by localsConvention", async () => {
    const { css: purgedCSS, tokens } = await purgeCSSModule(
      `styles.globalUsed`,
      { localsConvention: "camelCaseOnly" },
    );
    expect(tokens.globalUsed).toBeDefined();
    expect(purgedCSS.trim()).toBe(`.${tokens.globalUsed} { color: blue }`);
  });

  it.each([
    ["a string", ["modUnused"]],
    ["a regular expression", [/^modUn/]],
    ["a regular expression written as a string", ["/^modUn/"]],
  ])(
    "keeps the scoped classes whose local name is safelisted with %s",
    async (_, safelist) => {
      // e.g. a dynamic access such as styles[`mod${name}`]
      const { css: purgedCSS, tokens } = await purgeCSSModule(
        `styles.modUsed`,
        {},
        { safelist },
      );
      const [modUnused] = tokens.modUnused.split(" ");
      expect(purgedCSS).toContain(`.${modUnused} {`);
      expect(purgedCSS).toContain(`.${tokens.modUsed.split(" ")[0]} {`);
      expect(purgedCSS).not.toContain(tokens["global-used"]);
    },
  );

  it("keeps the children of a scoped class whose local name is deep safelisted", async () => {
    const { css: purgedCSS, tokens } = await purgeCSSModule(
      `styles.base`,
      {},
      { safelist: { deep: [/^modUsed$/] } },
    );
    const [modUsed] = tokens.modUsed.split(" ");
    const [modUnused] = tokens.modUnused.split(" ");
    expect(purgedCSS).toContain(`.${modUsed} .${modUnused}`);
    // only kept as a child of the deep safelisted class
    expect(purgedCSS).not.toContain(`.${modUnused} { padding: 0 }`);
  });

  it("removes the scoped classes whose local name is blocklisted", async () => {
    const { css: purgedCSS, tokens } = await purgeCSSModule(
      `styles.modUsed; styles.base`,
      {},
      { blocklist: ["modUsed"] },
    );
    expect(purgedCSS).not.toContain(tokens.modUsed.split(" ")[0]);
    expect(purgedCSS).toContain(`.${tokens.base} {`);
  });

  it.each([
    ["the default convention", {}, "brand gap"],
    [
      "localsConvention camelCaseOnly",
      { localsConvention: "camelCaseOnly" as const },
      "brandColor gap",
    ],
  ])(
    "does not take the values defined with @value as classes, with %s",
    async (_, modulesOptions, usedValues) => {
      let tokens: Record<string, string> = {};
      const result = await postcss([
        postcssModules({
          ...modulesOptions,
          getJSON: (_, json) => {
            tokens = json;
          },
        }),
        purgeCSSPlugin({
          content: [{ raw: `styles.card ${usedValues}`, extension: "js" }],
          safelist: ["brandColor", "brand-color"],
        }),
      ]).process(
        `@value brand-color: red;
@value gap: 1px solid;
:global(.red) { color: red }
:global(.solid) { border: 0 }
:global(.px) { margin: 0 }
.card { color: brand-color; border: gap }
.unused { color: blue }`,
        { from: "/project/src/card.module.css" },
      );
      // the values are exported along with the classes
      expect(Object.values(tokens)).toEqual(
        expect.arrayContaining(["red", "1px solid"]),
      );
      const [card] = (tokens.card ?? "").split(" ");
      expect(card).not.toBe("");
      expect(result.css).toContain(
        `.${card} { color: red; border: 1px solid }`,
      );
      expect(result.css).not.toContain(".red");
      expect(result.css).not.toContain(".solid");
      expect(result.css).not.toContain(".px");
      expect(result.css).not.toContain(tokens.unused);
    },
  );

  it.each([
    ["@value brandColor: red", ".brand-color", "brand-color", {}],
    ["@value header: 10px", ".Header", "Header", {}],
    ["@value btn_primary: blue", ".btnPrimary", "btnPrimary", {}],
    ["@value brand-color: red", ".brandColor", "brandColor", {}],
    [
      "@value brand-color: red",
      ".brandColor",
      "brandColor",
      { localsConvention: "camelCase" as const },
    ],
    ['@value brand-color from "./colors.css"', ".brandColor", "brandColor", {}],
  ])(
    "keeps a used class whose name differs from %s",
    async (valueDefinition, selector, localName, modulesOptions) => {
      let tokens: Record<string, string> = {};
      // the module that an imported value comes from
      const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), "postcss-purgecss-modules-"),
      );
      fs.writeFileSync(
        path.join(directory, "colors.css"),
        "@value brand-color: red;",
      );
      let result: postcss.Result;
      try {
        result = await postcss([
          postcssModules({
            ...modulesOptions,
            getJSON: (_, json) => {
              tokens = json;
            },
          }),
          purgeCSSPlugin({
            content: [{ raw: `styles["${localName}"]`, extension: "js" }],
          }),
        ]).process(
          `${valueDefinition};
${selector} { margin: 0 }
.unused { color: blue }`,
          { from: path.join(directory, "card.module.css") },
        );
      } finally {
        fs.rmSync(directory, { recursive: true, force: true });
      }
      const [scopedName] = tokens[localName].split(" ");
      expect(scopedName).not.toBe(localName);
      expect(result.css).toContain(`.${scopedName} { margin: 0 }`);
      expect(result.css).not.toContain(tokens.unused);
    },
  );

  it("keeps a used class whose name differs from a value with unhashed scoped names", async () => {
    let tokens: Record<string, string> = {};
    const result = await postcss([
      postcssModules({
        generateScopedName: "[local]",
        getJSON: (_, json) => {
          tokens = json;
        },
      }),
      purgeCSSPlugin({
        content: [{ raw: 'styles["brand-color"]', extension: "js" }],
      }),
    ]).process(
      `@value brandColor: red;
.brand-color { color: brandColor }
.unused { color: blue }`,
      { from: "/project/src/card.module.css" },
    );
    expect(tokens["brand-color"]).toBe("brand-color");
    expect(result.css.trim()).toBe(".brand-color { color: red }");
  });

  it("does not take a value whose value is a global class as a class", async () => {
    let tokens: Record<string, string> = {};
    const result = await postcss([
      postcssModules({
        getJSON: (_, json) => {
          tokens = json;
        },
      }),
      purgeCSSPlugin({
        content: [{ raw: "styles.border styles.card", extension: "js" }],
      }),
    ]).process(
      `@value color: solid;
@value border: 1px color;
:global(.solid) { border: 0 }
.card { border: border }`,
      { from: "/project/src/card.module.css" },
    );
    // a value can refer to the values defined before it
    expect(tokens.border).toBe("1px solid");
    expect(result.css).toContain(`.${tokens.card} { border: 1px solid }`);
    expect(result.css).not.toContain(".solid");
  });

  it("keeps the scoped IDs whose local name is used in the content", async () => {
    let tokens: Record<string, string> = {};
    const result = await postcss([
      postcssModules({
        getJSON: (_, json) => {
          tokens = json;
        },
      }),
      purgeCSSPlugin({
        content: [{ raw: "el.id = styles.main", extension: "js" }],
        safelist: ["sidebar"],
      }),
    ]).process(
      `#main { width: 1px }
#sidebar { width: 2px }
#unused { width: 3px }`,
      { from: "/project/src/layout.module.css" },
    );
    expect(tokens.main).not.toBe("main");
    expect(result.css).toContain(`#${tokens.main} { width: 1px }`);
    expect(result.css).toContain(`#${tokens.sidebar} { width: 2px }`);
    expect(result.css).not.toContain(tokens.unused);
  });

  it("keeps the classes composed by a used class whose rule only composes", async () => {
    let tokens: Record<string, string> = {};
    const result = await postcss([
      postcssModules({
        getJSON: (_, json) => {
          tokens = json;
        },
      }),
      purgeCSSPlugin({
        content: [{ raw: "styles.primary", extension: "js" }],
      }),
    ]).process(`.btn { color: red } .primary { composes: btn }`, {
      from: "/project/src/button.module.css",
    });
    expect(result.css).toContain(`.${tokens.btn} { color: red }`);
  });
});
