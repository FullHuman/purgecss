import postcss from "postcss";
import { ExtractorResultSets, PurgeCSS, ResultPurge } from "../src/index";

/**
 * The unused rules are removed from the tree once the whole css has been
 * walked through. The results must be the same as removing them one by one
 * during the walk, as PurgeCSS 9.0.0 did: the expected values below are the
 * results of PurgeCSS 9.0.0.
 */
async function purge(css: string): Promise<ResultPurge> {
  const [result] = await new PurgeCSS().purge({
    content: [{ raw: "used", extension: "html" }],
    css: [{ raw: css }],
    rejected: true,
    rejectedCss: true,
  });
  return result;
}

describe("removal of the unused rules", () => {
  it("gives the spacing before the first rule of the file to the next one", async () => {
    const result = await purge(
      "\n\n.unused-1 { color: red }\n  .unused-2 { color: red }\n.used { color: blue }",
    );
    expect(result.css).toBe("\n\n.used { color: blue }");
    expect(result.rejectedCss).toBe(
      "\n\n.unused-1 { color: red }\n\n.unused-2 { color: red }",
    );
  });

  it("removes an at-rule left with comments only", async () => {
    const result = await purge(
      "@media print {\n  .unused-1 { color: red }\n  /* comment */\n  .unused-2 { color: red }\n}\n.used { color: blue }",
    );
    expect(result.css).toBe(".used { color: blue }");
    expect(result.rejectedCss).toBe(
      "@media print {\n  .unused-1 { color: red }\n}@media print {\n  .unused-2 { color: red }\n}",
    );
  });

  it("keeps an at-rule left with an ignore annotation", async () => {
    const result = await purge(
      "@media print {\n  .unused-1 { color: red }\n  /* purgecss ignore */\n}\n.used { color: blue }",
    );
    expect(result.css).toBe(
      "@media print {\n  /* purgecss ignore */\n}\n.used { color: blue }",
    );
  });

  it("removes the nested at-rules left empty", async () => {
    const result = await purge(
      "@supports (display: grid) {\n  @media print {\n    .unused-1 { color: red }\n    .unused-2 { color: red }\n  }\n}\n.used { color: blue }",
    );
    expect(result.css).toBe(".used { color: blue }");
    expect(result.rejected).toEqual([".unused-1", ".unused-2"]);
    expect(result.rejectedCss).toBe(
      "@supports (display: grid) {\n  @media print {\n    .unused-1 { color: red }\n  }\n}@supports (display: grid) {\n  @media print {\n    .unused-2 { color: red }\n  }\n}",
    );
  });

  it("does not repeat the rules of a rejected parent in the rejected css", async () => {
    const result = await purge(
      ".unused-1 {\n  color: red;\n  .unused-2 { color: red }\n}\n.used { .unused-3 { color: red } }",
    );
    expect(result.css).toBe("");
    expect(result.rejected).toEqual([".unused-1", ".unused-2", ".unused-3"]);
    expect(result.rejectedCss).toBe(
      ".unused-1 {\n  color: red;\n  .unused-2 { color: red }\n}.used { .unused-3 { color: red } }",
    );
  });

  it("applies an ignore annotation to the next rule left in the tree", async () => {
    // the at-rule is ignored by the range, keeping the ignore next annotation
    // before it. Once it is removed, the annotation applies to `.unused-2`
    const result = await purge(
      "/* purgecss start ignore */\n/* purgecss ignore */\n@media print {\n  /* purgecss end ignore */\n  .unused-1 { color: red }\n}\n.unused-2 { color: red }\n.used { color: blue }",
    );
    expect(result.css).toBe(".unused-2 { color: red }\n.used { color: blue }");
    expect(result.rejected).toEqual([".unused-1"]);
  });

  it("applies an ignore annotation after a removed rule", async () => {
    const result = await purge(
      ".unused-1 { color: red }\n/* purgecss ignore */\n.unused-2 { color: red }\n.unused-3 { color: red }",
    );
    expect(result.css).toBe(".unused-2 { color: red }");
    expect(result.rejectedCss).toBe(
      ".unused-1 { color: red }\n.unused-3 { color: red }",
    );
  });

  it("removes many consecutive rules", async () => {
    const unused = Array.from(
      { length: 5000 },
      (_, i) => `.unused-${i} { color: red }`,
    );
    const result = await purge(
      [".used {}", ...unused, "/* purgecss ignore */", ".kept {}"].join("\n"),
    );
    expect(result.css).toBe(".used {}\n.kept {}");
    expect(result.rejected).toHaveLength(5000);
  });

  it("updates the iterators running on the tree", () => {
    const root = postcss.parse(".a {} .unused-1 {} .b {} .unused-2 {} .c {}");
    const purgeCSS = new PurgeCSS();
    const selectors = new ExtractorResultSets(["a", "b", "c"]);
    const visited: string[] = [];
    root.each((node) => {
      if (node.type !== "rule") return;
      visited.push(node.selector);
      if (node.selector === ".b") purgeCSS.walkThroughCSS(root, selectors);
    });
    expect(visited).toEqual([".a", ".unused-1", ".b", ".c"]);
    expect(root.toString()).toBe(".a {} .b {} .c {}");
  });

  it("removes the rules of a root given to a postcss plugin", async () => {
    const purgeCSS = new PurgeCSS();
    const selectors = new ExtractorResultSets(["used"]);
    const result = await postcss([
      {
        postcssPlugin: "purge",
        Once(root) {
          purgeCSS.walkThroughCSS(root, selectors);
        },
      },
      {
        postcssPlugin: "spacing",
        Rule(rule) {
          rule.raws.between = " ";
        },
      },
    ]).process("@media print { .unused {} }\n.unused-2 {}\n.used {}", {
      from: undefined,
    });
    expect(result.css).toBe(".used {}");
  });
});
