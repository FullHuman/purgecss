import { getAssets, files } from "../src/search";

describe("Search assets", () => {
  it("returns matches based on a pattern", () => {
    const modules = {
      "foobar.txt": {
        source: (): string => "",
      },
      "barbar.css": {
        source: (): string => "",
      },
    };
    const extensions = [".txt"];
    const matches = [
      { name: "foobar.txt", asset: { source: (): string => "" } },
    ];

    expect(JSON.stringify(getAssets(modules, extensions))).toBe(
      JSON.stringify(matches)
    );
  });

  it("returns matches if they have query", () => {
    const modules = {
      "foobar.txt?123": {
        source: (): string => "",
      },
      "barbar.css": {
        source: (): string => "",
      },
    };
    const extensions = [".txt"];
    const matches = [
      {
        name: "foobar.txt?123",
        asset: {
          source: (): string => "",
        },
      },
    ];

    expect(JSON.stringify(getAssets(modules, extensions))).toBe(
      JSON.stringify(matches)
    );
  });
});

describe("Search files", () => {
  let chunk: any;
  beforeEach(() => {
    chunk = {};
  });

  it("returns matches based on extension", () => {
    chunk.modulesIterable = ["foobar.txt", "barbar.css"];
    const extensions = [".txt"];
    const matches = ["foobar.txt"];

    expect(files(chunk, extensions, (a: any) => a)).toEqual(matches);
  });

  it("does not fail with missing modules", () => {
    chunk.modulesIterable = ["foobar.txt", "", "barbar.css"];
    const extensions = [".txt"];
    const matches = ["foobar.txt"];

    expect(files(chunk, extensions, (a: any) => a)).toEqual(matches);
  });

  it("returns matches based on extension with a customized getter", () => {
    chunk.modulesIterable = [
      {
        resource: "foobar.txt",
      },
      {
        resource: "barbar.css",
      },
    ];
    const extensions = [".txt"];
    const matches = ["foobar.txt"];

    expect(files(chunk, extensions, (file: any) => file.resource)).toEqual(
      matches
    );
  });

  it("does not fail with missing modules when a getter fails", () => {
    chunk.modulesIterable = [
      {
        resource: "foobar.txt",
      },
      {},
      {
        resource: "barbar.css",
      },
    ];
    const extensions = [".txt"];
    const matches = ["foobar.txt"];

    expect(files(chunk, extensions, (file: any) => file.resource)).toEqual(
      matches
    );
  });
});
