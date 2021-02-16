// import fs from "fs";
import path from "path";
import { rollup } from "rollup";
import purgecss from "./../src/";

// const expectA = fs.readFileSync(path.resolve(__dirname, "assets/expect_a.css")).toString();

describe("rollup-plugin-purgecss", () => {
  it("remove unused css", async () => {
    await rollup({
      input: path.resolve(__dirname, "fixtures/basic/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          output: path.resolve(__dirname, "temp/purged"),
        }),
      ],
    });

    // const value = await bundle.generate({ format: "cjs" });
    // expect(value.output).toEqual(expectA);
  });
});
