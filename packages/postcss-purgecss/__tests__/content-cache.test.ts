import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import postcss from "postcss";
import { ExtractorFunction } from "purgecss";

import purgeCSSPlugin, { UserDefinedOptions } from "../src/";
import { sharedContentCache } from "../src/content-cache";

/**
 * Write a content file with a modification time in the past: the content
 * cache does not keep the selectors of a file modified less than 2 seconds
 * before it was read. Its change time (ctime) cannot be set back: the tests
 * move the clock forward instead, see `beforeEach`.
 */
function writeContentFile(
  filePath: string,
  content: string,
  secondsAgo: number,
): void {
  fs.writeFileSync(filePath, content);
  const time = Date.now() / 1000 - secondsAgo;
  fs.utimesSync(filePath, time, time);
}

describe("Purgecss postcss plugin content cache", () => {
  let directory: string;
  let extractor: jest.Mock<ReturnType<ExtractorFunction>, [string]>;
  let options: UserDefinedOptions;

  beforeEach(() => {
    // the files written by the test were changed (ctime) more than 2 seconds
    // before they are read
    const now = Date.now.bind(Date);
    jest.spyOn(Date, "now").mockImplementation(() => now() + 10_000);
    directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "postcss-purgecss-cache-"),
    );
    writeContentFile(
      path.join(directory, "a.html"),
      '<div class="from-a"></div>',
      60,
    );
    writeContentFile(
      path.join(directory, "b.html"),
      '<div class="from-b"></div>',
      60,
    );
    extractor = jest.fn((content: string) => content.match(/[\w-]+/g) || []);
    options = {
      content: [`${directory}/*.html`],
      extractors: [{ extractor, extensions: ["html"] }],
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  const css = ".from-a{color:red}.from-b{color:blue}.unused{color:green}";

  it("extracts the content files once for all the css files", async () => {
    const plugin = purgeCSSPlugin(options);
    for (let i = 0; i < 5; i++) {
      const result = await postcss([plugin]).process(css, {
        from: `/virtual/module-${i}.css`,
      });
      expect(result.css).toBe(".from-a{color:red}.from-b{color:blue}");
    }
    expect(extractor).toHaveBeenCalledTimes(2);
  });

  it("shares the extracted content between instances of the plugin", async () => {
    // postcss-loader creates an instance of the plugin for every css file
    for (let i = 0; i < 3; i++) {
      await postcss([purgeCSSPlugin({ ...options })]).process(css, {
        from: `/virtual/module-${i}.css`,
      });
    }
    expect(extractor).toHaveBeenCalledTimes(2);
  });

  it("shares the files extracted by css files processed at the same time", async () => {
    const plugin = purgeCSSPlugin(options);
    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        postcss([plugin]).process(css, { from: `/virtual/module-${i}.css` }),
      ),
    );
    for (const result of results) {
      expect(result.css).toBe(".from-a{color:red}.from-b{color:blue}");
    }
    expect(extractor).toHaveBeenCalledTimes(2);
  });

  it("extracts a content file again when it changed", async () => {
    const plugin = purgeCSSPlugin(options);
    await postcss([plugin]).process(css, { from: "/virtual/first.css" });
    expect(extractor).toHaveBeenCalledTimes(2);

    writeContentFile(
      path.join(directory, "b.html"),
      '<div class="unused"></div>',
      30,
    );
    const result = await postcss([plugin]).process(css, {
      from: "/virtual/second.css",
    });
    expect(result.css).toBe(".from-a{color:red}.unused{color:green}");
    expect(extractor).toHaveBeenCalledTimes(3);
    expect(extractor).toHaveBeenLastCalledWith('<div class="unused"></div>');
  });

  it("picks up the files added and removed since the last css file", async () => {
    const plugin = purgeCSSPlugin(options);
    await postcss([plugin]).process(css, { from: "/virtual/first.css" });

    fs.rmSync(path.join(directory, "b.html"));
    writeContentFile(
      path.join(directory, "c.html"),
      '<div class="unused"></div>',
      60,
    );
    const result = await postcss([plugin]).process(css, {
      from: "/virtual/second.css",
    });
    expect(result.css).toBe(".from-a{color:red}.unused{color:green}");
    expect(extractor).toHaveBeenCalledTimes(3);
  });

  it("extracts the content files again with another extractor", async () => {
    await postcss([purgeCSSPlugin(options)]).process(css, {
      from: "/virtual/first.css",
    });
    const otherExtractor = jest.fn(() => ["unused"]);
    const result = await postcss([
      purgeCSSPlugin({
        ...options,
        extractors: [{ extractor: otherExtractor, extensions: ["html"] }],
      }),
    ]).process(css, { from: "/virtual/second.css" });
    expect(result.css).toBe(".unused{color:green}");
    expect(otherExtractor).toHaveBeenCalledTimes(2);
  });

  it("removes from the cache the content files no longer read", async () => {
    const plugin = purgeCSSPlugin(options);
    await postcss([plugin]).process(css, { from: "/virtual/first.css" });
    const a = path.join(directory, "a.html");
    const b = path.join(directory, "b.html");
    expect(sharedContentCache.has(a)).toBe(true);
    expect(sharedContentCache.has(b)).toBe(true);

    // a long dev session with generated content files keeps no deleted file
    for (let i = 0; i < 5; i++) {
      writeContentFile(
        path.join(directory, `page-${i}.html`),
        `<div class="page-${i}"></div>`,
        60,
      );
      if (i > 0) fs.rmSync(path.join(directory, `page-${i - 1}.html`));
      await postcss([plugin]).process(css, { from: "/virtual/first.css" });
    }
    const cachedFiles = [...sharedContentCache.keys()].filter((file) =>
      file.startsWith(directory),
    );
    expect(cachedFiles.sort()).toEqual(
      [a, b, path.join(directory, "page-4.html")].sort(),
    );
  });

  it("keeps in the cache the files read by another content option", async () => {
    const a = path.join(directory, "a.html");
    const b = path.join(directory, "b.html");
    await postcss([purgeCSSPlugin(options)]).process(css, {
      from: "/virtual/first.css",
    });
    await postcss([purgeCSSPlugin({ ...options, content: [b] })]).process(css, {
      from: "/virtual/second.css",
    });
    fs.rmSync(b);
    await postcss([purgeCSSPlugin(options)]).process(css, {
      from: "/virtual/first.css",
    });
    // still read by the last run of the content option [b]
    expect(sharedContentCache.has(a)).toBe(true);
    expect(sharedContentCache.has(b)).toBe(true);
  });

  it("extracts the content files for every css file with the option contentCache set to false", async () => {
    const plugin = purgeCSSPlugin({ ...options, contentCache: false });
    for (let i = 0; i < 3; i++) {
      const result = await postcss([plugin]).process(css, {
        from: `/virtual/module-${i}.css`,
      });
      expect(result.css).toBe(".from-a{color:red}.from-b{color:blue}");
    }
    expect(extractor).toHaveBeenCalledTimes(6);
    expect(sharedContentCache.has(path.join(directory, "a.html"))).toBe(false);
  });
});
