import * as fs from "fs";
import * as path from "path";
import { rollup } from "rollup";
import purgecss from "./../src/";

describe("rollup-plugin-purgecss", () => {
  it("remove unused css", async () => {
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/basic/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          output: path.resolve(__dirname, "assets/actual_a.css"),
        }),
      ],
    });
    await bundle.generate({ format: "cjs", exports: "auto" });

    const actualA = fs
      .readFileSync(path.resolve(__dirname, "assets/actual_a.css"))
      .toString();
    const expectA = fs
      .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
      .toString();
    expect(actualA).toEqual(expectA);
  });

  it("passes the PurgeCSS options to PurgeCSS", async () => {
    let output = "";
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/basic/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          safelist: ["unused"],
          blocklist: ["there"],
          output: (css) => {
            output = css;
          },
        }),
      ],
    });
    await bundle.generate({ format: "cjs", exports: "auto" });

    expect(output).toContain(".used");
    expect(output).toContain(".unused");
    expect(output).not.toContain(".there");
  });

  it("exports the purged css as a string when no output is set", async () => {
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/export/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
        }),
      ],
    });
    const { output } = await bundle.generate({ format: "es" });

    const expectA = fs
      .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
      .toString();
    expect(output[0].code).toContain(JSON.stringify(expectA));
    expect(output[0].code).not.toContain(".unused");
  });

  it("exports the purged css as a string when output is false", async () => {
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/export/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          output: false,
        }),
      ],
    });
    const { output } = await bundle.generate({ format: "es" });

    const expectA = fs
      .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
      .toString();
    expect(output[0].code).toContain(JSON.stringify(expectA));
  });

  it("exports an empty string when the css is written to output", async () => {
    let written = "";
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/export/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          output: (css) => {
            written = css;
          },
        }),
      ],
    });
    const { output } = await bundle.generate({ format: "es" });

    expect(output[0].code).toMatch(/=\s*"";/);
    expect(output[0].code).not.toContain(".used");
    expect(written).toContain(".used");
    expect(written).not.toContain(".unused");
  });
});
