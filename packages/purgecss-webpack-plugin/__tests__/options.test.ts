import { PurgeCSSPlugin } from "../src";

describe("PurgeCSSPlugin options", () => {
  // ts-jest type-checks this file, so a required option makes it fail to compile
  it("only requires the paths option", () => {
    const plugin = new PurgeCSSPlugin({ paths: ["index.html"] });
    expect(plugin.options).toEqual({ paths: ["index.html"] });
  });

  it("accepts the documented options", () => {
    const options = {
      paths: () => ["index.html"],
      only: ["bundle"],
      safelist: () => ({ standard: ["safelisted"] }),
      dynamicAttributes: ["aria-selected"],
      rejected: true,
    };
    expect(new PurgeCSSPlugin(options).options).toEqual(options);
  });
});
