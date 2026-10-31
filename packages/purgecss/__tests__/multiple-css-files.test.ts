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
}
@keyframes used-animation {
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
  animation: used-animation 1s;
  font-family: "Used Font", sans-serif;
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
    beforeAll(async () => {
      const resultsPurge = await new PurgeCSS().purge({ ...options, css });
      purgedDefinitions = resultsPurge.find(
        (result) => result.file === "definitions.css",
      )?.css;
    });

    it("keeps a variable used in another file", () => {
      expect(purgedDefinitions).toContain("--used-color:");
    });
    it("removes an unused variable", () => {
      expect(purgedDefinitions).not.toContain("--unused-color");
    });
    it("keeps keyframes used in another file", () => {
      expect(purgedDefinitions).toContain("@keyframes used-animation");
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
});
