import purgeFromHtml from "../src";

const attributeValue = (content: string): string =>
  content.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

describe("explicit embedded HTML", () => {
  it.each([
    "text/html",
    "text/x-template",
    " TEXT/HTML ",
    "\tText/X-Template; charset=utf-8\n",
  ])("extracts scripts declared as %j", (type) => {
    const result = purgeFromHtml(
      `<script type="${type}" class="template-script"><article class="embedded" id="embedded-id" data-kind="sample"></article></script>`,
    );

    expect(result.classes).toEqual(["template-script", "embedded"]);
    expect(result.ids).toEqual(["embedded-id"]);
    expect(result.tags).toEqual(expect.arrayContaining(["script", "article"]));
    expect(result.attributes.names).toContain("data-kind");
  });

  it.each([
    "",
    "module",
    "text/javascript",
    "application/json",
    "application/ld+json",
    "\u00a0text/html\u00a0",
  ])("does not interpret scripts declared as %j as HTML", (type) => {
    const result = purgeFromHtml(
      `<script type="${type}" class="actual">'<article class="script-only" id="script-id"></article>'</script>`,
    );

    expect(result.classes).toEqual(["actual"]);
    expect(result.ids).toEqual([]);
    expect(result.tags).not.toContain("article");
  });

  it("does not interpret an ordinary script without a type as HTML", () => {
    expect(
      purgeFromHtml(`<script>'<div class="script-only"></div>'</script>`)
        .classes,
    ).toEqual([]);
  });

  it("extracts srcdoc and decodes entities at each HTML boundary", () => {
    const embedded = `<p class="a&amp;b" id="frame-id" title="A &amp; B"></p>`;
    const result = purgeFromHtml(
      `<iframe class="frame" srcdoc="${attributeValue(embedded)}"></iframe>`,
    );

    expect(result.classes).toEqual(["frame", "a&b"]);
    expect(result.ids).toEqual(["frame-id"]);
    expect(result.attributes.values).toContain(embedded);
    expect(result.attributes.values).toContain("A & B");
    expect(result.classes).not.toContain("a&amp;b");
  });

  it("processes nested srcdoc and template scripts in discovery order", () => {
    const deepest = `<strong class="deepest"></strong>`;
    const frame = `<section class="frame-content"><script type="text/x-template">${deepest}</script></section>`;
    const result = purgeFromHtml(`
      <iframe class="frame" srcdoc="${attributeValue(frame)}"></iframe>
      <script type="text/html"><aside class="sibling-template"></aside></script>
    `);

    expect(result.classes).toEqual([
      "frame",
      "frame-content",
      "sibling-template",
      "deepest",
    ]);
  });

  it("deduplicates repeated embedded documents", () => {
    const embedded = `<div class="shared" id="shared-id"></div>`;
    const result = purgeFromHtml(`
      <iframe srcdoc="${attributeValue(embedded)}"></iframe>
      <iframe srcdoc="${attributeValue(embedded)}"></iframe>
      <script type="text/html">${embedded}</script>
    `);

    expect(result.classes).toEqual(["shared"]);
    expect(result.ids).toEqual(["shared-id"]);
    expect(result.tags.filter((tag) => tag === "div")).toHaveLength(1);
  });

  it("extracts an iframe nested inside another iframe's srcdoc", () => {
    const deepest = `<p class="deepest-frame" id="nested-id"></p>`;
    const nested = `<iframe class="nested-frame" srcdoc="${attributeValue(deepest)}"></iframe>`;
    const result = purgeFromHtml(
      `<iframe class="outer-frame" srcdoc="${attributeValue(nested)}"></iframe>`,
    );

    expect(result.classes).toEqual([
      "outer-frame",
      "nested-frame",
      "deepest-frame",
    ]);
    expect(result.ids).toEqual(["nested-id"]);
    expect(result.tags).toContain("p");
  });

  it("does not parse arbitrary HTML-looking attributes or comments", () => {
    const result = purgeFromHtml(`
      <div data-template="${attributeValue(`<p class="attribute-only"></p>`)}"></div>
      <!-- <script type="text/html"><p class="comment-only"></p></script> -->
      <iframe><p class="iframe-fallback-only"></p></iframe>
    `);

    expect(result.classes).toEqual([]);
    expect(result.tags).not.toContain("p");
  });

  it("does not interpret SVG script text as an HTML template", () => {
    const result = purgeFromHtml(`
      <svg>
        <script type="text/html">&lt;div class="svg-text-only"&gt;&lt;/div&gt;<g class="svg-child"></g></script>
      </svg>
    `);

    expect(result.classes).toEqual(["svg-child"]);
    expect(result.tags).toContain("g");
    expect(result.tags).not.toContain("div");
  });
});
