import purgeFromHtml from "../src";

describe("static HTML extraction", () => {
  it("extracts script and style elements without interpreting their contents", () => {
    const result = purgeFromHtml(`
      <script class="loader" id="boot" type="module">
        const markup = '<div class="script-only" id="script-id"></div>';
      </script>
      <style class="theme" id="sheet" media="screen">
        .style-only { content: '<div class="css-only">'; }
      </style>
    `);

    expect(result.tags).toEqual(
      expect.arrayContaining(["script", "style", "html", "head", "body"]),
    );
    expect(result.classes).toEqual(["loader", "theme"]);
    expect(result.ids).toEqual(["boot", "sheet"]);
    expect(result.attributes.names).toEqual(["class", "id", "type", "media"]);
    expect(result.tags).not.toContain("div");
  });

  it("walks nested template contents and their own attributes", () => {
    const result = purgeFromHtml(`
      <template class="outer" id="outer-template">
        <template class="inner"><tr class="row"><td id="cell">x</td></tr></template>
      </template>
    `);

    expect(result.classes).toEqual(["outer", "inner", "row"]);
    expect(result.ids).toEqual(["outer-template", "cell"]);
    expect(result.tags).toEqual(
      expect.arrayContaining(["template", "tr", "td"]),
    );
  });

  it.each([
    `<tr class="row"><td class="cell">x</td></tr>`,
    `<div class="before"></div><tr class="row"><td class="cell">x</td></tr>`,
  ])("preserves table fragment evidence: %s", (content) => {
    const result = purgeFromHtml(content);

    expect(result.classes).toEqual(expect.arrayContaining(["row", "cell"]));
    expect(result.tags).toEqual(expect.arrayContaining(["tr", "td"]));
  });

  it("preserves structural tags discarded by HTML tree construction", () => {
    const result = purgeFromHtml(`
      <div></div><col class="column">
      <form class="outer-form"><form class="inner-form"></form></form>
      <select><div class="dropdown"><option class="choice">x</option></div></select>
    `);

    expect(result.classes).toEqual([
      "column",
      "outer-form",
      "inner-form",
      "dropdown",
      "choice",
    ]);
    expect(result.tags).toEqual(
      expect.arrayContaining(["col", "form", "select", "div", "option"]),
    );
  });

  it("preserves attributes on repeated document wrappers", () => {
    const result = purgeFromHtml(`
      <html class="root-one"><head class="head-one"></head>
      <head class="head-two"></head><body class="body-one"></body>
      <body class="body-two" id="later-body"><html class="root-two"></html>
    `);

    expect(result.classes).toEqual([
      "root-one",
      "head-one",
      "head-two",
      "body-one",
      "body-two",
      "root-two",
    ]);
    expect(result.ids).toEqual(["later-body"]);
  });

  it("retains elements inferred by the HTML parser", () => {
    const result = purgeFromHtml(`<table><td class="cell">x</td></table>`);

    expect(result.tags).toEqual(
      expect.arrayContaining([
        "html",
        "head",
        "body",
        "table",
        "tbody",
        "tr",
        "td",
      ]),
    );
  });

  it("extracts noscript fallback markup", () => {
    const result = purgeFromHtml(`
      <noscript><div class="fallback"><tr class="fallback-row"></tr></div></noscript>
      <p class="following"></p>
    `);

    expect(result.classes).toEqual(["fallback", "fallback-row", "following"]);
  });

  it("preserves following markup from the alternate noscript interpretation", () => {
    const result = purgeFromHtml(
      `<noscript><style></noscript><div class="following"></div>`,
    );

    expect(result.classes).toEqual(["following"]);
    expect(result.tags).toEqual(
      expect.arrayContaining(["noscript", "style", "div"]),
    );
  });

  it.each(["title", "textarea", "xmp", "iframe", "noembed", "noframes"])(
    "does not extract HTML-looking text inside %s",
    (tag) => {
      const result = purgeFromHtml(
        `<${tag} class="actual"><div class="text-only" id="text-id"></div></${tag}><p class="after"></p>`,
      );

      expect(result.classes).toEqual(["actual", "after"]);
      expect(result.ids).toEqual([]);
      expect(result.tags).not.toContain("div");
    },
  );

  it("ignores comments and plaintext markup", () => {
    const result = purgeFromHtml(`
      <!-- <div class="comment-only" id="comment-id"></div> -->
      <plaintext class="actual"><p class="plaintext-only" id="plaintext-id"></p>
    `);

    expect(result.classes).toEqual(["actual"]);
    expect(result.ids).toEqual([]);
    expect(result.tags).not.toContain("div");
    expect(result.tags).not.toContain("p");
  });

  it("normalizes HTML names while preserving case-sensitive selector values", () => {
    const result = purgeFromHtml(
      `<MY-CARD CLASS="Card Active" ID="Main" DATA-THEME="Dark"></MY-CARD>`,
    );

    expect(result.tags).toContain("my-card");
    expect(result.attributes.names).toEqual(["class", "id", "data-theme"]);
    expect(result.attributes.values).toEqual(["Card Active", "Main", "Dark"]);
    expect(result.classes).toEqual(["Card", "Active"]);
    expect(result.ids).toEqual(["Main"]);
  });

  it("preserves SVG casing and both local and qualified attribute names", () => {
    const result = purgeFromHtml(`
      <svg viewbox="0 0 10 10" xmlns:xlink="http://www.w3.org/1999/xlink">
        <lineargradient id="paint"></lineargradient>
        <use href="#plain" xlink:href="#linked" xml:lang="en" lang="fr"></use>
        <foreignobject><div class="html-child"></div></foreignobject>
      </svg>
    `);

    expect(result.tags).toEqual(
      expect.arrayContaining([
        "svg",
        "linearGradient",
        "use",
        "foreignObject",
        "div",
      ]),
    );
    expect(result.tags).not.toContain("lineargradient");
    expect(result.attributes.names).toEqual(
      expect.arrayContaining([
        "viewBox",
        "xmlns:xlink",
        "href",
        "xlink:href",
        "lang",
        "xml:lang",
      ]),
    );
    expect(result.attributes.values).toEqual(
      expect.arrayContaining(["#plain", "#linked", "en", "fr"]),
    );
    expect(result.classes).toEqual(["html-child"]);
  });

  it("preserves MathML attribute casing and HTML integration points", () => {
    const result = purgeFromHtml(`
      <math definitionurl="https://example.test/math">
        <mi class="math-token">x</mi>
        <annotation-xml encoding="text/html"><div class="html-annotation"></div></annotation-xml>
      </math>
    `);

    expect(result.tags).toEqual(
      expect.arrayContaining(["math", "mi", "annotation-xml", "div"]),
    );
    expect(result.attributes.names).toContain("definitionURL");
    expect(result.classes).toEqual(["math-token", "html-annotation"]);
  });

  it("decodes entities and preserves Unicode and selector punctuation", () => {
    const result = purgeFromHtml(
      `<div class="sm:hover 2xl:flex w-1/2 café lead&nbsp;muted a&amp;b nul\u0000name" id="section&#32;one" title="A &amp; B"></div>`,
    );

    expect(result.classes).toEqual([
      "sm:hover",
      "2xl:flex",
      "w-1/2",
      "café",
      "lead\u00a0muted",
      "a&b",
      "nul\uFFFDname",
    ]);
    expect(result.ids).toEqual(["section one"]);
    expect(result.attributes.values).toContain("A & B");
    expect(result.attributes.values).not.toContain("A");
  });

  it("keeps complete IDs and attribute values and only splits class lists", () => {
    const result = purgeFromHtml(
      `<div class="one two" id=" section one " title="first second" data-empty="" disabled></div>`,
    );

    expect(result.classes).toEqual(["one", "two"]);
    expect(result.ids).toEqual([" section one "]);
    expect(result.attributes.values).toEqual([
      "one two",
      " section one ",
      "first second",
      "",
    ]);
  });

  it("uses the first duplicate attribute on an element", () => {
    const result = purgeFromHtml(
      `<div class="first" CLASS="second" id="first-id" id="second-id"></div>`,
    );

    expect(result.classes).toEqual(["first"]);
    expect(result.ids).toEqual(["first-id"]);
  });

  it("preserves a nonempty ID made entirely of whitespace", () => {
    const result = purgeFromHtml(`<p id=" \t\n "></p>`);

    expect(result.ids).toEqual([" \t\n "]);
    expect(result.attributes.values).toEqual([" \t\n "]);
  });

  it("keeps lone surrogates instead of throwing", () => {
    // parse5 8.0.1 threw on two consecutive lone low surrogates.
    const result = purgeFromHtml(
      `<p class="before \uDC00\uDC00 after">\uDC00\uDC00</p>`,
    );

    expect(result.classes).toEqual(["before", "\uDC00\uDC00", "after"]);
  });

  it("deduplicates in first-discovery order and returns independent results", () => {
    const content = `<article class="shared parent" id="same" data-note="first second"><p class="child shared" id="same"></p></article><article class="shared"></article>`;
    const result = purgeFromHtml(content);

    expect(result).toEqual({
      classes: ["shared", "parent", "child"],
      ids: ["same"],
      tags: ["article", "p", "html", "head", "body"],
      attributes: {
        names: ["class", "id", "data-note"],
        values: [
          "shared parent",
          "same",
          "first second",
          "child shared",
          "shared",
        ],
      },
      undetermined: [],
    });
    expect(purgeFromHtml(content)).toEqual(result);
    result.classes.push("changed");
    expect(purgeFromHtml(content).classes).toEqual([
      "shared",
      "parent",
      "child",
    ]);
  });

  it("handles ten thousand sibling elements", () => {
    const content = Array.from(
      { length: 10_000 },
      (_, index) => `<div class="item-${index} common" id="id-${index}"></div>`,
    ).join("");
    const result = purgeFromHtml(content);

    expect(result.classes).toHaveLength(10_001);
    expect(result.classes[0]).toBe("item-0");
    expect(result.classes[10_000]).toBe("item-9999");
    expect(result.ids).toHaveLength(10_000);
    expect(result.tags).toEqual(["div", "html", "head", "body"]);
  });

  it("handles deeply nested elements without recursive tree walking", () => {
    const depth = 6_000;
    const result = purgeFromHtml(
      `${"<div>".repeat(depth)}<span class="deep" id="deepest"></span>${"</div>".repeat(depth)}`,
    );

    expect(result.classes).toEqual(["deep"]);
    expect(result.ids).toEqual(["deepest"]);
    expect(result.tags).toEqual(
      expect.arrayContaining(["div", "span", "html", "head", "body"]),
    );
  });
});
