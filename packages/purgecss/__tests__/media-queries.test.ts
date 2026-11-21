import { PurgeCSS } from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("media queries", () => {
  let purgecssResult: string;
  beforeAll(async () => {
    const purgecss = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}media-queries/media_queries.html`],
      css: [`${ROOT_TEST_EXAMPLES}media-queries/media_queries.css`],
    });
    purgecssResult = purgecss[0].css;
  });
  it("finds .media-class", () => {
    expect(purgecssResult.includes(".media-class")).toBe(true);
  });

  it("finds .alone", () => {
    expect(purgecssResult.includes(".alone")).toBe(true);
  });

  it("finds #id-in-media", () => {
    expect(purgecssResult.includes("#id-in-media")).toBe(true);
  });

  it("finds body", () => {
    expect(purgecssResult.includes("body")).toBe(true);
  });

  it("removes .unused-class", () => {
    expect(purgecssResult.includes(".unused-class")).toBe(false);
  });

  it("removes the empty media query", () => {
    expect(purgecssResult.includes("66666px")).toBe(false);
  });

  it("removes the media query left with only a comment", () => {
    expect(purgecssResult.includes("77777px")).toBe(false);
    expect(purgecssResult.includes("only this comment is left")).toBe(false);
  });

  it("removes the media query left empty by a nested at-rule", () => {
    expect(purgecssResult.includes("88888px")).toBe(false);
    expect(purgecssResult.includes("@supports")).toBe(false);
  });

  it("keeps the comments of a media query that is still used", () => {
    expect(purgecssResult.includes("99999px")).toBe(true);
    expect(purgecssResult.includes("this comment stays")).toBe(true);
  });
});

describe("at-rules left empty by removed keyframes, font faces and @property", () => {
  let purgecssResult: string;
  beforeAll(async () => {
    const purgecss = await new PurgeCSS().purge({
      content: [
        {
          raw: '<div class="used"></div><div class="animated"></div>',
          extension: "html",
        },
      ],
      css: [
        {
          raw: `
@media (min-width: 11111px) {
  @keyframes unused-in-media { to { opacity: 1; } }
}
@media (min-width: 22222px) {
  /* animations */
  @supports (display: grid) {
    @keyframes unused-nested { to { opacity: 1; } }
  }
}
@supports (font-display: swap) {
  @font-face { font-family: "Unused Font"; src: url(unused.woff2); }
}
@supports (color: red) {
  @property --unused-property { syntax: "<color>"; inherits: false; initial-value: red; }
}
@media (min-width: 33333px) {
  @keyframes unused-with-used-rule { to { opacity: 1; } }
  .used { color: red; }
}
@media (min-width: 44444px) {
  @keyframes used-in-media { to { opacity: 1; } }
}
@media (min-width: 55555px) {
  /* purgecss ignore */
  @keyframes ignored-in-media { to { opacity: 1; } }
}
.animated { animation: used-in-media 1s; }
`,
        },
      ],
      keyframes: true,
      fontFace: true,
      variables: true,
    });
    purgecssResult = purgecss[0].css;
  });

  it("removes the media query left empty by removed keyframes", () => {
    expect(purgecssResult).not.toContain("unused-in-media");
    expect(purgecssResult).not.toContain("11111px");
  });

  it("removes the nested at-rules left empty by removed keyframes", () => {
    expect(purgecssResult).not.toContain("unused-nested");
    expect(purgecssResult).not.toContain("22222px");
    expect(purgecssResult).not.toContain("@supports (display: grid)");
    expect(purgecssResult).not.toContain("animations");
  });

  it("removes the at-rule left empty by a removed font face", () => {
    expect(purgecssResult).not.toContain("Unused Font");
    expect(purgecssResult).not.toContain("font-display");
  });

  it("removes the at-rule left empty by a removed @property", () => {
    expect(purgecssResult).not.toContain("--unused-property");
    expect(purgecssResult).not.toContain("@supports (color: red)");
  });

  it("keeps the at-rules that still contain used rules or keyframes", () => {
    expect(purgecssResult).not.toContain("unused-with-used-rule");
    expect(purgecssResult).toContain("33333px");
    expect(purgecssResult).toContain("@keyframes used-in-media");
    expect(purgecssResult).toContain("44444px");
  });

  it("keeps the at-rules whose keyframes are kept by an ignore comment", () => {
    expect(purgecssResult).toContain("@keyframes ignored-in-media");
    expect(purgecssResult).toContain("55555px");
  });
});
