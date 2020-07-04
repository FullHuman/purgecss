import PurgeCSS from "./../src/index";

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
      purgedCSS
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
      purgedCSS
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
      purgedCSS
    );
  });

  it("excludes selectors not safelisted", () => {
    notFindInCSS(
      expect,
      [".card.card--large", ".card .card-content"],
      purgedCSS
    );
  });
});
