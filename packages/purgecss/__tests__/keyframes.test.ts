import PurgeCSS from "./../src/index";

const root = "./packages/purgecss/__tests__/test_examples/";

describe("keyframes", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}keyframes/keyframes.html`],
      css: [`${root}keyframes/keyframes.css`],
      keyframes: true
    });
    purgedCSS = resultsPurge[0].css;
  });
  it("finds bounce", () => {
    expect(purgedCSS.includes("bounce")).toBe(true);
  });
  it("removes flash", () => {
    expect(purgedCSS.includes("@keyframes flash")).toBe(false);
  });
  it("keeps keyframes from animations with multiple keyframes", () => {
    expect(purgedCSS.includes("@keyframes scale")).toBe(true);
    expect(purgedCSS.includes("@keyframes spin")).toBe(true);
  });
});

describe("purge unused keyframe animations", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}keyframes/index.html`],
      css: [`${root}keyframes/index.css`],
      keyframes: true
    });
    purgedCSS = resultsPurge[0].css;
  });
  it("removes `@keyframes flashAni`", () => {
    expect(purgedCSS.includes("@keyframes flashAni")).toBe(false);
  });
  it("keeps `@keyframes rotateAni`", () => {
    expect(purgedCSS.includes("@keyframes rotateAni")).toBe(true);
  });
});

describe("do not purge keyframes if option set to false", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}keyframes/index.html`],
      css: [`${root}keyframes/index.css`],
      keyframes: false
    });
    purgedCSS = resultsPurge[0].css;
  });
  it("keeps `@keyframes flashAni`", () => {
    expect(purgedCSS.includes("@keyframes flashAni")).toBe(true);
  });
  it("keeps `@keyframes rotateAni`", () => {
    expect(purgedCSS.includes("@keyframes rotateAni")).toBe(true);
  });
});

describe("keep keyframe decimals", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [
        {
          raw: '<div class="xx"></div>',
          extension: "html"
        }
      ],
      css: [
        {
          raw: `
              @keyframes xxx {
                  0% {opacity: 0;}
                  99.9% {opacity: 1;}
              }
              .xx { animation: xxx 200ms linear both }
              `
        }
      ],
      keyframes: false
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("keeps `99.9%`", () => {
    expect(purgedCSS.includes("99.9%")).toBe(true);
  });
});
