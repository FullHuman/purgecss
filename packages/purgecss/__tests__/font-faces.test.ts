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
      purgedCSS.includes(`src: url('../fonts/CerebriSans-Bold.eot?')`)
    ).toBe(true);
  });
  it("keep @font-face 'Cerebri Sans'", () => {
    expect(
      purgedCSS.includes(`src: url('../fonts/CerebriSans-Regular.eot?')`)
    ).toBe(true);
  });
  it("remove @font-face 'OtherFont'", () => {
    expect(purgedCSS.includes(`src: url('xxx')`)).toBe(false);
  });
});
