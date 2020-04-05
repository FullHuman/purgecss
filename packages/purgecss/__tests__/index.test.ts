import PurgeCSS from "./../src/index";
import { ExtractorResult } from "../src/types";

const root = "./packages/purgecss/__tests__/test_examples/";

describe("purgecss with config file", () => {
  it("initialize without error with a config file specified", () => {
    expect(async () => {
      await new PurgeCSS().purge(
        "./packages/purgecss/__tests__/purgecss.config.js"
      );
    }).not.toThrow();
  });

  it("throws an error if config file is not found", async () => {
    expect.assertions(1);
    await expect(
      new PurgeCSS().purge(
        "./packages/purgecss/__tests__/purgecss_wrong_path.config.js"
      )
    ).rejects.toThrow();
  });
});

describe("filters out unused selectors", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}remove_unused/remove_unused.js`],
      css: [`${root}remove_unused/remove_unused.css`],
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
  let purgedCSS = "";
  const CustomExtractor = (content: string): ExtractorResult =>
    content.match(/[A-z0-9-:/]+/g) || [];

  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}special_characters/special_characters.js`],
      css: [`${root}special_characters/special_characters.css`],
      extractors: [
        {
          extractor: CustomExtractor,
          extensions: ["html", "js"],
        },
      ],
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

describe("with custom Comparator", () => {
  let purgedCSS = "";
  const CustomExtractor = (content: string): ExtractorResult =>
    content.match(/[A-z0-9-:/]+/g) || [];

  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}custom_comparator/custom_comparator.js`],
      css: [`${root}custom_comparator/custom_comparator.css`],
      extractors: [
        {
          extractor: CustomExtractor,
          extensions: ["html", "js"],
        },
      ],
      customClassComparator: (node, selector) =>
        node === selector || node.endsWith(":" + selector),
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds literal class", () => {
    expect(purgedCSS.includes("w-full")).toBe(true);
  });

  it("finds decorated class 1", () => {
    expect(purgedCSS.includes("md\\:w-full")).toBe(true);
  });

  it("finds decorated class 2", () => {
    expect(purgedCSS.includes("hover\\:w-full")).toBe(true);
  });
});
