import { PurgeCSS } from "./../src/index";
import { ROOT_TEST_EXAMPLES } from "./utils";

describe("purge unused font-face", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultPurge = await new PurgeCSS().purge({
      content: [`${ROOT_TEST_EXAMPLES}font-faces/font_face.html`],
      css: [`${ROOT_TEST_EXAMPLES}font-faces/font_face.css`],
      fontFace: true,
    });
    purgedCSS = resultPurge[0].css;
  });
  it("keep @font-face 'Cerebri Bold'", () => {
    expect(
      purgedCSS.includes(`src: url('../fonts/CerebriSans-Bold.eot?')`),
    ).toBe(true);
  });
  it("keep @font-face 'Cerebri Sans'", () => {
    expect(
      purgedCSS.includes(`src: url('../fonts/CerebriSans-Regular.eot?')`),
    ).toBe(true);
  });
  it("remove @font-face 'OtherFont'", () => {
    expect(purgedCSS.includes(`src: url('xxx')`)).toBe(false);
  });
});

describe("keep @font-face used by the font shorthand or a custom property", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultPurge = await new PurgeCSS().purge({
      content: [
        {
          raw: '<p class="title lead caption display"></p>',
          extension: "html",
        },
      ],
      css: [
        {
          raw: `
            @font-face { font-family: "Brand"; src: url(brand.woff2); }
            @font-face { font-family: "Body Text"; src: url(body.woff2); }
            @font-face { font-family: Caption Font; src: url(caption.woff2); }
            @font-face { font-family: "Display"; src: url(display.woff2); }
            @font-face { font-family: "Unused"; src: url(unused.woff2); }
            .title { font: 700 2rem/1.2 Brand, sans-serif; }
            .lead { font: italic 1rem "Body Text", serif; }
            .caption { font: 12px Arial, Caption Font; }
            :root { --font-display: "Display", sans-serif; }
            .display { font-family: var(--font-display); }
          `,
        },
      ],
      fontFace: true,
    });
    purgedCSS = resultPurge[0].css;
  });

  it("keeps the font face ending the font shorthand", () => {
    expect(purgedCSS.includes("brand.woff2")).toBe(true);
    expect(purgedCSS.includes("body.woff2")).toBe(true);
  });

  it("keeps the font face listed after the first one in the font shorthand", () => {
    expect(purgedCSS.includes("caption.woff2")).toBe(true);
  });

  it("keeps the font face named in a custom property", () => {
    expect(purgedCSS.includes("display.woff2")).toBe(true);
  });

  it("removes the unused font face", () => {
    expect(purgedCSS.includes("unused.woff2")).toBe(false);
  });
});

describe("match the font family names of @font-face case-insensitively", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultPurge = await new PurgeCSS().purge({
      content: [{ raw: '<p class="lead title"></p>', extension: "html" }],
      css: [
        {
          raw: `
            @font-face { font-family: "Body Text"; src: url(body.woff2); }
            @font-face { font-family: brand; src: url(brand.woff2); }
            @font-face { font-family: "Other"; src: url(other.woff2); }
            .lead { font-family: body text, serif; }
            .title { font: 2rem "BRAND"; }
          `,
        },
      ],
      fontFace: true,
    });
    purgedCSS = resultPurge[0].css;
  });

  it("keeps the font faces used with another case", () => {
    expect(purgedCSS.includes("body.woff2")).toBe(true);
    expect(purgedCSS.includes("brand.woff2")).toBe(true);
  });

  it("removes the unused font face", () => {
    expect(purgedCSS.includes("other.woff2")).toBe(false);
  });
});
