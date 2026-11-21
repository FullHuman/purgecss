import { PurgeCSS } from "./../src/index";

// https://github.com/FullHuman/purgecss/issues/1262
describe("purge multiple css files", () => {
  const content = [
    {
      raw: '<button class="button"><span class="icon"></span></button>',
      extension: "html",
    },
  ];
  const definitions = {
    raw: `
:root {
  --used-color: red;
  --unused-color: blue;
  --chained-color: var(--chained-base);
  --chained-base: green;
}
@keyframes used-animation {
  from { opacity: 0; }
}
@keyframes animation-in-variable {
  from { opacity: 0; }
}
@keyframes unused-animation {
  from { opacity: 0; }
}
@font-face {
  font-family: "Used Font";
  src: url("used.woff2");
}
@font-face {
  font-family: "Unused Font";
  src: url("unused.woff2");
}
.unused-definition { color: black; }
`,
    name: "definitions.css",
  };
  const usages = {
    raw: `
.button {
  color: var(--used-color);
  background: var(--chained-color);
  animation: used-animation 1s;
  font-family: "Used Font", sans-serif;
}
.icon {
  --icon-animation: animation-in-variable 1s;
  animation: var(--icon-animation);
}
.unused-usage { color: black; }
`,
    name: "usages.css",
  };
  const options = {
    content,
    variables: true,
    keyframes: true,
    fontFace: true,
  };

  describe.each([
    ["definitions before usages", [definitions, usages]],
    ["usages before definitions", [usages, definitions]],
  ])("with %s", (_, css) => {
    let purgedDefinitions: string | undefined;
    let purgedUsages: string | undefined;
    beforeAll(async () => {
      const resultsPurge = await new PurgeCSS().purge({ ...options, css });
      purgedDefinitions = resultsPurge.find(
        (result) => result.file === "definitions.css",
      )?.css;
      purgedUsages = resultsPurge.find(
        (result) => result.file === "usages.css",
      )?.css;
    });

    it("keeps a variable used in another file", () => {
      expect(purgedDefinitions).toContain("--used-color:");
    });
    it("removes an unused variable", () => {
      expect(purgedDefinitions).not.toContain("--unused-color");
    });
    it("keeps the variables used by a variable used in another file", () => {
      expect(purgedDefinitions).toContain("--chained-color:");
      expect(purgedDefinitions).toContain("--chained-base:");
    });
    it("keeps keyframes used in another file", () => {
      expect(purgedDefinitions).toContain("@keyframes used-animation");
    });
    it("keeps keyframes used through a variable in another file", () => {
      expect(purgedDefinitions).toContain("@keyframes animation-in-variable");
    });
    it("removes unused keyframes", () => {
      expect(purgedDefinitions).not.toContain("@keyframes unused-animation");
    });
    it("keeps a font face used in another file", () => {
      expect(purgedDefinitions).toContain('font-family: "Used Font"');
    });
    it("removes an unused font face", () => {
      expect(purgedDefinitions).not.toContain('font-family: "Unused Font"');
    });
    it("only removes the unused rules of the file using the definitions", () => {
      expect(purgedUsages).toContain(".button {");
      expect(purgedUsages).toContain("--icon-animation:");
      expect(purgedUsages).not.toContain(".unused-usage");
    });
  });

  it("reports the rejected selectors of each file separately", async () => {
    const resultsPurge = await new PurgeCSS().purge({
      ...options,
      css: [definitions, usages],
      rejected: true,
    });
    expect(resultsPurge.map((result) => result.rejected)).toEqual([
      [".unused-definition"],
      [".unused-usage"],
    ]);
  });

  it.each([
    ["removing unused definitions", options],
    ["without removing unused definitions", { content }],
  ])("returns the source map of each file, %s", async (_, purgeOptions) => {
    const resultsPurge = await new PurgeCSS().purge({
      ...purgeOptions,
      css: [definitions, usages],
      sourceMap: { inline: false },
    });
    expect(
      resultsPurge.map(
        (result) => JSON.parse(result.sourceMap ?? "{}").sourcesContent,
      ),
    ).toEqual([[definitions.raw], [usages.raw]]);
  });
});
