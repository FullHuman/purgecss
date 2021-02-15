import fs from "fs";
import { rollup } from "rollup";
import purgecss from "./src/";

const expectA = fs.readFileSync("__tests__/assets/expect_a.css").toString();

describe("rollup-plugin-purgecss", () => {
  it("remove unused css", async () => {
    const bundle = await rollup({
      input: "__tests__fixtures/index.js",
      plugins: [
        purgecss({
          content: ["__tests__/assets/test_a.html"],
        }),
      ],
    });

    const value = await bundle.generate({ format: "cjs" });
    expect(value.output).toEqual(expectA);
  });
});
