import purgecssFromHtml from "purgecss-from-html";
import { ExtractorResult } from "../src/types";
import { PurgeCSS } from "./../src/index";
import { notFindInCSS, ROOT_TEST_EXAMPLES } from "./utils";

describe("purgecss with config file", () => {
  it("initialize without error with a config file specified", () => {
    expect(async () => {
      await new PurgeCSS().purge("./__tests__/purgecss.config.js");
    }).not.toThrow();
  });

  it("throws an error if config file is not found", async () => {
    expect.assertions(1);
    await expect(
      new PurgeCSS().purge("./__tests__/purgecss_wrong_path.config.js")
    ).rejects.toThrow();
  });
});

describe("filters out unused selectors", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}others/remove_unused.js`],
      css: [`${ROOT_TEST_EXAMPLES}others/remove_unused.css`],
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
      content: [`${ROOT_TEST_EXAMPLES}others/special_characters.js`],
      css: [`${ROOT_TEST_EXAMPLES}others/special_characters.css`],
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

describe("PurgeCSS with detailed extractor for html", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}chaining-rules/index.html`],
      css: [`${ROOT_TEST_EXAMPLES}chaining-rules/index.css`],
      extractors: [
        {
          extensions: ["html"],
          extractor: purgecssFromHtml,
        },
      ],
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("keeps parent1 selector", () => {
    expect(purgedCSS.includes("parent1")).toBe(true);
  });
  it("removes parent3, d33ef1, .parent2", () => {
    notFindInCSS(expect, ["parent3", "d33ef1", "parent2"], purgedCSS);
  });
});

describe("Warn if no files are found from the option 'content'", () => {
  it("warns if no files are found", async () => {
    const originalConsoleWarn = console.warn;
    console.warn = jest.fn();
    await new PurgeCSS().purge({
      content: ["./__tests__/not-found.js", "./__tests__/not-found.html"],
      css: [`${ROOT_TEST_EXAMPLES}others/remove_unused.css`]
    });
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      "No files found from the passed PurgeCSS option 'content'.");
      console.warn = originalConsoleWarn;
  })

  it("does not warn if files are found", async () => {
    const originalConsoleWarn = console.warn;
    console.warn = jest.fn();
    await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}others/remove_unused.js`],
      css: [`${ROOT_TEST_EXAMPLES}others/remove_unused.css`]
    });
    expect(console.warn).not.toHaveBeenCalled();
    console.warn = originalConsoleWarn;
  });

  it("does not warn if raw content is found", async () => {
    const originalConsoleWarn = console.warn;
    console.warn = jest.fn();
    await new PurgeCSS().purge({
      content: [{ raw: '<div class="a">test</div>', extension: 'html' }],
      css: [`${ROOT_TEST_EXAMPLES}others/remove_unused.css`]
    });
    expect(console.warn).not.toHaveBeenCalled();
    console.warn = originalConsoleWarn;
  });

})