import PurgeCSS from "./../src/index";

const root = "./packages/purgecss/__tests__/test_examples/";

describe("whitelist", () => {
  let purgedCSS: string = "";
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [`${root}whitelist/whitelist.html`],
      css: [`${root}whitelist/whitelist.css`],
      whitelist: ["random", "h1", "yep", "button"],
      whitelistPatterns: [/nav-/]
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds random class", () => {
    expect(purgedCSS.includes(".random")).toBe(true);
  });

  it("finds h1", () => {
    expect(purgedCSS.includes("h1")).toBe(true);
  });

  it("finds #yep", () => {
    expect(purgedCSS.includes("#yep")).toBe(true);
  });

  it("finds button", () => {
    expect(purgedCSS.includes("button")).toBe(true);
  });

  it("finds .nav-blue", () => {
    expect(purgedCSS.includes(".nav-blue")).toBe(true);
  });

  it("finds .nav-red", () => {
    expect(purgedCSS.includes(".nav-red")).toBe(true);
  });
});

describe("whitelistPatternsChildren", () => {
  let purgedCSS: string;
  beforeAll(async () => {
    const resultsPurge = await new PurgeCSS().purge({
      content: [
        `${root}whitelist_patterns_children/whitelist_patterns_children.html`
      ],
      css: [
        `${root}whitelist_patterns_children/whitelist_patterns_children.css`
      ],
      whitelistPatternsChildren: [/^card$/]
    });
    purgedCSS = resultsPurge[0].css;
  });

  it("finds card class", () => {
    expect(purgedCSS.includes(".card")).toBe(true);
  });

  it("finds card--title", () => {
    expect(purgedCSS.includes(".title")).toBe(false);
  });

  it("finds card--content", () => {
    expect(purgedCSS.includes(".card .content")).toBe(true);
  });

  it("finds btn", () => {
    expect(purgedCSS.includes(".btn")).toBe(true);
  });

  it("finds btn yellow", () => {
    expect(purgedCSS.includes(".card .btn .yellow")).toBe(true);
  });

  it("finds btn red", () => {
    expect(purgedCSS.includes(".btn .red")).toBe(false);
  });

  it("excludes btn--green", () => {
    expect(purgedCSS.includes(".btn__green")).toBe(false);
  });
});
