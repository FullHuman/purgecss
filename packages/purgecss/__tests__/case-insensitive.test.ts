import { PurgeCSS } from "./../src/index";
import { findInCSS, notFindInCSS } from "./utils";
import purgecssFromHtml from "purgecss-from-html";

// in HTML, type selectors and attribute names match in any case, and the `i`
// flag of an attribute selector matches its value in any case
describe.each([
  ["the default extractor", []],
  [
    "the HTML extractor",
    [
      {
        extensions: ["html"],
        extractor: purgecssFromHtml,
      },
    ],
  ],
])("case-insensitive selectors with %s", (_, extractors) => {
  let purgedCSS: string;

  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [
        {
          raw: [
            `<table><tr><td>`,
            `<a href="/files/Report.PDF" data-state="Open" lang="EN-us" title="New Arrivals">report</a>`,
            `</td></tr></table>`,
            `<p class="lead"></p>`,
            `<SECTION DATA-ROLE="Main"></SECTION>`,
          ].join(""),
          extension: "html",
        },
      ],
      css: [
        {
          raw: [
            `TD { padding: 4px }`,
            `td { margin: 0 }`,
            `TH { padding: 4px }`,
            `section { margin: 0 }`,
            `SECTION { padding: 0 }`,
            `[DATA-STATE] { font-weight: bold }`,
            `[data-role] { color: red }`,
            `[DATA-HIDDEN] { display: none }`,
            `a[data-state="open" i] { text-decoration: underline }`,
            `a[data-state="open"] { color: red }`,
            `a[data-state="closed" i] { color: red }`,
            `[data-role="main" i] { color: red }`,
            `a[lang|="en" i] { color: red }`,
            `a[lang^="en" i] { color: red }`,
            `a[lang^="en"] { color: red }`,
            `a[href$="report.pdf" i] { color: red }`,
            `a[href$="report.pdf"] { color: red }`,
            `a[title*="arrivals" i] { color: red }`,
            `a[title*="arrivals"] { color: red }`,
            `a[title*="departures" i] { color: red }`,
            `.LEAD { color: red }`,
            `.lead { color: red }`,
          ].join("\n"),
        },
      ],
      extractors,
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("keeps type selectors written in another case", () => {
    findInCSS(expect, ["TD {", "td {", "section {", "SECTION {"], purgedCSS);
    notFindInCSS(expect, ["TH {"], purgedCSS);
  });

  it("keeps attribute names written in another case", () => {
    findInCSS(expect, ["[DATA-STATE] {", "[data-role] {"], purgedCSS);
    notFindInCSS(expect, ["[DATA-HIDDEN]"], purgedCSS);
  });

  it("matches the value of [attribute=value i] in any case", () => {
    findInCSS(
      expect,
      ['a[data-state="open" i]', '[data-role="main" i]'],
      purgedCSS,
    );
    notFindInCSS(
      expect,
      ['a[data-state="open"]', 'a[data-state="closed" i]'],
      purgedCSS,
    );
  });

  it("matches the value of [attribute|=value i] and [attribute^=value i] in any case", () => {
    findInCSS(expect, ['a[lang|="en" i]', 'a[lang^="en" i]'], purgedCSS);
    notFindInCSS(expect, ['a[lang^="en"]'], purgedCSS);
  });

  it("matches the value of [attribute$=value i] in any case", () => {
    if (extractors.length > 0) {
      // the default extractor does not keep the dot of the file name
      findInCSS(expect, ['a[href$="report.pdf" i]'], purgedCSS);
    }
    notFindInCSS(expect, ['a[href$="report.pdf"]'], purgedCSS);
  });

  it("matches the value of [attribute*=value i] in any case", () => {
    findInCSS(expect, ['a[title*="arrivals" i]'], purgedCSS);
    notFindInCSS(
      expect,
      ['a[title*="arrivals"]', 'a[title*="departures" i]'],
      purgedCSS,
    );
  });

  it("keeps matching class names case-sensitively", () => {
    findInCSS(expect, [".lead {"], purgedCSS);
    notFindInCSS(expect, [".LEAD {"], purgedCSS);
  });
});
