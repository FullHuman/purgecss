import PurgeCSS from "./../src/index";
import { ExtractorResult } from "../src/types";

const root = "./packages/purgecss/__tests__/test_examples/";

describe("purgecss with config file", () => {
  it("initialize without error with a config file specified", () => {
    expect(async () => {
      await new PurgeCSS().purge("./packages/purgecss/__tests__/purgecss.config.js");
    }).not.toThrow();
  });

  it("throws an error if config file is not found", async () => {
    expect.assertions(1);
    await expect(
      new PurgeCSS().purge("./packages/purgecss/__tests__/purgecss_wrong_path.config.js")
    ).rejects.toThrow();
  });
});

describe("filters out unused selectors", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}remove_unused/remove_unused.js`],
      css: [`${root}remove_unused/remove_unused.css`]
    });
    purgedCSS = resultsPurge[0].css;
  });
  it("contains .used-class", () => {
    expect(purgedCSS.includes(".used-class")).toBe(true);
  });

  it("removes .unused-class", () => {
    expect(purgedCSS.includes(".unused-class")).toBe(false);
  });

  it("removes .another-one-not-found", () => {
    expect(purgedCSS.includes(".another-one-not-found")).toBe(false);
  });
});

describe("special characters, with custom Extractor", () => {
  let purgedCSS: string = "";
  const CustomExtractor = (content: string): ExtractorResult => {
    const selectors = content.match(/[A-z0-9-:/]+/g) || [];
    return {
      attributes: {
        names: new Set(),
        values: new Set()
      },
      classes: new Set(),
      ids: new Set(),
      tags: new Set(),
      undetermined: new Set(selectors)
    };
  };

  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}special_characters/special_characters.js`],
      css: [`${root}special_characters/special_characters.css`],
      extractors: [
        {
          extractor: CustomExtractor,
          extensions: ["html", "js"]
        }
      ]
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds tailwind class", () => {
    expect(purgedCSS.includes("md\\:w-1\\/3")).toBe(true);
  });

  it("discards unused class beginning with number", () => {
    expect(purgedCSS.includes("\\32 -panel")).toBe(false);
  });
});
