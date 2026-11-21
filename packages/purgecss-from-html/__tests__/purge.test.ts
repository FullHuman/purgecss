import { PurgeCSS } from "../../purgecss/src";
import purgeFromHtml from "../src";

const purge = async (content: string, selectors: string[]) => {
  const results = await new PurgeCSS().purge({
    content: [{ raw: content, extension: "html" }],
    css: [
      {
        raw: selectors
          .map((selector) => `${selector} { color: red; }`)
          .join("\n"),
      },
    ],
    extractors: [{ extensions: ["html"], extractor: purgeFromHtml }],
    rejected: true,
  });
  return results[0];
};

describe("HTML extractor with PurgeCSS", () => {
  it("retains structural and fallback selectors while removing unused selectors", async () => {
    const kept = [
      "script.loader",
      "style.theme",
      ".row",
      ".cell",
      ".fallback",
      ".nested",
      "#cell",
    ];
    const removed = [".unused", ".script-only", ".style-only", ".comment-only"];
    const result = await purge(
      `
      <script class="loader">'<div class="script-only"></div>'</script>
      <style class="theme">.style-only { color: blue; }</style>
      <!-- <p class="comment-only"></p> -->
      <div></div><tr class="row"><td class="cell" id="cell">x</td></tr>
      <noscript><p class="fallback"></p></noscript>
      <template><template><section class="nested"></section></template></template>
    `,
      [...kept, ...removed],
    );

    expect(result.rejected).toEqual(removed);
    for (const selector of kept) expect(result.css).toContain(selector);
  });

  it("uses full attribute values without retaining selectors for isolated words", async () => {
    const kept = [
      "[title]",
      '[title="first second"]',
      '[title~="first"]',
      '[title^="first "]',
      '[title$=" second"]',
      '[title*="st sec"]',
      '[lang|="en"]',
      '[data-empty=""]',
      "[disabled]",
      ".card",
      ".active",
      String.raw`#hero\ section`,
    ];
    const removed = [
      '[title="first"]',
      '[title^="second"]',
      '[title$="first"]',
      '[class="card"]',
      '[id="hero"]',
      '[title="missing"]',
      "[absent]",
      ".first",
      "#hero",
    ];
    const result = await purge(
      `<div title="first second" class="card active" id="hero section" lang="en-US" data-empty="" disabled></div>`,
      [...kept, ...removed],
    );

    expect(result.rejected).toEqual(removed);
    for (const selector of kept) expect(result.css).toContain(selector);
  });

  it("retains escaped class and ID selectors", async () => {
    const kept = [
      String.raw`.sm\:hover`,
      String.raw`.\32 xl\:flex`,
      String.raw`.w-1\/2`,
      String.raw`.a\&b`,
      ".café",
      String.raw`#section\ one`,
    ];
    const removed = [
      String.raw`.sm\:unused`,
      String.raw`#section\ two`,
      ".other",
    ];
    const result = await purge(
      `<div class="sm:hover 2xl:flex w-1/2 a&amp;b café" id="section one"></div>`,
      [...kept, ...removed],
    );

    expect(result.rejected).toEqual(removed);
    for (const selector of kept) expect(result.css).toContain(selector);
  });

  it("retains SVG names and namespaced attribute selectors", async () => {
    const kept = [
      "linearGradient",
      "foreignObject",
      "[viewBox]",
      'use[href="#plain"]',
      'use[xlink|href="#linked"]',
      ".html-child",
    ];
    const removed = ["radialGradient", 'use[href="#unused"]', ".missing"];
    const result = await purge(
      `
      <svg viewbox="0 0 1 1">
        <lineargradient></lineargradient><use href="#plain" xlink:href="#linked"></use>
        <foreignobject><div class="html-child"></div></foreignobject>
      </svg>
    `,
      [...kept, ...removed],
    );

    expect(result.rejected).toEqual(removed);
    for (const selector of kept) expect(result.css).toContain(selector);
  });

  it("retains explicit embedded HTML and removes ordinary script and JSON text", async () => {
    const kept = [".frame-content", ".html-template", ".legacy-template"];
    const removed = [".json-only", ".javascript-only", ".unused"];
    const result = await purge(
      `
      <iframe srcdoc="&lt;p class=&quot;frame-content&quot;&gt;&lt;/p&gt;"></iframe>
      <script type="text/html"><p class="html-template"></p></script>
      <script type="text/x-template"><p class="legacy-template"></p></script>
      <script type="application/json">{"html":"<p class='json-only'></p>"}</script>
      <script>const html = "<p class='javascript-only'></p>";</script>
    `,
      [...kept, ...removed],
    );

    expect(result.rejected).toEqual(removed);
    for (const selector of kept) expect(result.css).toContain(selector);
  });
});
