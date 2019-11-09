import { getAssets, files } from "../src/search";

describe("Search assets", () => {
  it("returns matches based on a pattern", () => {
    const modules = {
      "foobar.txt": {
        source: () => ""
      },
      "barbar.css": {
        source: () => ""
      }
    };
    const extensions = [".txt"];
    const matches = [{ name: "foobar.txt", asset: { source: () => "" } }];

    expect(JSON.stringify(getAssets(modules, extensions))).toBe(
      JSON.stringify(matches)
    );
  });

  it("returns matches if they have query", () => {
    const modules = {
      "foobar.txt?123": {
        source: () => ""
      },
      "barbar.css": {
        source: () => ""
      }
    };
    const extensions = [".txt"];
    const matches = [
      {
        name: "foobar.txt?123",
        asset: {
          source: () => ""
        }
      }
    ];

    expect(JSON.stringify(getAssets(modules, extensions))).toBe(
      JSON.stringify(matches)
    );
  });
});

describe("Search files", () => {
  let chunk: any;
  beforeEach(() => {
    chunk = {
      mapModules: function(cb: any) {
        return Array.from(this.modules, cb);
      }
    };
  });

  it("returns matches based on extension", () => {
    chunk.modulesIterable = ["foobar.txt", "barbar.css"];
    const extensions = [".txt"];
    const matches = ["foobar.txt"];

    expect(files(chunk, extensions, (a: any) => a, 4)).toEqual(matches);
  });

  it("does not fail with missing modules", () => {
    chunk.modulesIterable = ["foobar.txt", "", "barbar.css"];
    const extensions = [".txt"];
    const matches = ["foobar.txt"];

    expect(files(chunk, extensions, (a: any) => a, 4)).toEqual(matches);
  });

  it("returns matches based on extension with a customized getter", () => {
    chunk.modulesIterable = [
      {
        resource: "foobar.txt"
      },
      {
        resource: "barbar.css"
      }
    ];
    const extensions = [".txt"];
    const matches = ["foobar.txt"];

    expect(files(chunk, extensions, (file: any) => file.resource, 4)).toEqual(
      matches
    );
  });

  it("does not fail with missing modules when a getter fails", () => {
    chunk.modulesIterable = [
      {
        resource: "foobar.txt"
      },
      {},
      {
        resource: "barbar.css"
      }
    ];
    const extensions = [".txt"];
    const matches = ["foobar.txt"];

    expect(files(chunk, extensions, (file: any) => file.resource, 4)).toEqual(
      matches
    );
  });
});
