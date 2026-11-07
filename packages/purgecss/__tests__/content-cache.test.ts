import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  ContentCache,
  ExtractorFunction,
  ExtractorResult,
  PurgeCSS,
  UserDefinedOptions,
} from "../src/index";
import ExtractorResultSets from "../src/ExtractorResultSets";

const CSS = ".alpha {} .beta {} .gamma {} .delta {}";

/**
 * Purge the css with a new PurgeCSS instance using the content cache
 */
async function purgeWithCache(
  contentCache: ContentCache | undefined,
  options: UserDefinedOptions,
): Promise<string> {
  const purgeCSS = new PurgeCSS();
  purgeCSS.contentCache = contentCache;
  const [result] = await purgeCSS.purge(options);
  return result.css;
}

describe("content cache", () => {
  let testDir: string;
  let extractor: jest.Mock<ExtractorResult, [string]>;
  let options: UserDefinedOptions;

  // whole seconds, so that the times are stored exactly
  const minuteAgo = new Date(Math.floor(Date.now() / 1000) * 1000 - 60_000);

  /**
   * Write a content file modified a minute ago, as the selectors of a file
   * modified less than 2 seconds before it is read are not kept. Its change
   * time is now: the clock is moved forward so that it is read more than
   * 2 seconds later.
   */
  const writeContent = (
    name: string,
    content: string,
    modifiedAt = minuteAgo,
  ): string => {
    const file = path.join(testDir, name);
    fs.writeFileSync(file, content);
    fs.utimesSync(file, modifiedAt, modifiedAt);
    return file;
  };

  const realNow = Date.now;
  let clockOffset: number;

  beforeEach(() => {
    clockOffset = 10_000;
    jest.spyOn(Date, "now").mockImplementation(() => realNow() + clockOffset);
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "purgecss-cache-"));
    writeContent("a.html", '<div class="alpha"></div>');
    writeContent("b.html", '<div class="beta"></div>');
    extractor = jest.fn(
      (content: string) => content.match(/[A-Za-z0-9_-]+/g) || [],
    );
    options = {
      content: [path.join(testDir, "*.html")],
      css: [{ raw: CSS }],
      defaultExtractor: extractor,
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it("extracts the content files on every run without a cache", async () => {
    await purgeWithCache(undefined, options);
    await purgeWithCache(undefined, options);
    expect(extractor).toHaveBeenCalledTimes(4);
  });

  it("reuses the selectors of the files that did not change", async () => {
    const contentCache = new ContentCache();
    const first = await purgeWithCache(contentCache, options);
    expect(extractor).toHaveBeenCalledTimes(2);
    expect(contentCache.size).toBe(2);
    expect(contentCache.has(path.join(testDir, "a.html"))).toBe(true);

    const second = await purgeWithCache(contentCache, options);
    expect(extractor).toHaveBeenCalledTimes(2);
    expect(second).toBe(first);
    expect(second).toBe(".alpha {} .beta {}");
  });

  it("extracts again a file whose size changed", async () => {
    const contentCache = new ContentCache();
    await purgeWithCache(contentCache, options);
    writeContent("a.html", '<div class="alpha gamma"></div>');

    const css = await purgeWithCache(contentCache, options);
    expect(extractor).toHaveBeenCalledTimes(3);
    expect(extractor).toHaveBeenLastCalledWith(
      '<div class="alpha gamma"></div>',
    );
    expect(css).toBe(".alpha {} .beta {} .gamma {}");
  });

  it("extracts again a file whose modification time changed", async () => {
    const contentCache = new ContentCache();
    await purgeWithCache(contentCache, options);
    // same size, different content and modification time
    writeContent(
      "a.html",
      '<div class="delta"></div>',
      new Date(Date.now() - 30_000),
    );

    const css = await purgeWithCache(contentCache, options);
    expect(extractor).toHaveBeenCalledTimes(3);
    expect(css).toBe(".beta {} .delta {}");
  });

  it("extracts again a file whose modification time was set back", async () => {
    // read right after its change time, which the file systems may store
    // with a precision of a few milliseconds
    clockOffset = 0;
    const contentCache = new ContentCache();
    const file = path.join(testDir, "a.html");
    await purgeWithCache(contentCache, options);
    // changed less than 2 seconds before: not kept
    expect(contentCache.has(file)).toBe(false);
    // same size, different content, same modification time (`touch -r`,
    // `cp -p`, backup restore)
    writeContent("a.html", '<div class="delta"></div>');
    expect(fs.statSync(file).mtimeMs).toBe(minuteAgo.getTime());

    const css = await purgeWithCache(contentCache, options);
    expect(extractor).toHaveBeenCalledTimes(4);
    expect(css).toBe(".beta {} .delta {}");
  });

  it("compares the change time of the files", () => {
    const contentCache = new ContentCache();
    const file = path.join(testDir, "a.html");
    const stats = { mtimeMs: 1000, ctimeMs: 60_000, size: 25, ino: 1 };
    const selectors = Promise.resolve(new ExtractorResultSets([]));
    contentCache.set(file, {
      ...stats,
      extractor,
      selectors,
      checkedAt: 70_000,
    });
    expect(contentCache.get(file, stats, extractor)).toBe(selectors);
    expect(
      contentCache.get(file, { ...stats, ctimeMs: 80_000 }, extractor),
    ).toBeUndefined();
  });

  it("does not keep the selectors of a file changed just before", async () => {
    const contentCache = new ContentCache();
    const file = path.join(testDir, "a.html");
    const selectors = Promise.resolve(new ExtractorResultSets([]));
    // modified long before, but changed (e.g. its modification time set
    // back) just before it was read
    contentCache.set(file, {
      mtimeMs: 1000,
      ctimeMs: 69_000,
      size: 25,
      ino: 1,
      extractor,
      selectors,
      checkedAt: 70_000,
    });
    expect(contentCache.has(file)).toBe(true);
    await selectors;
    await Promise.resolve();
    expect(contentCache.has(file)).toBe(false);
  });

  it("extracts again a file replaced by another one", async () => {
    const contentCache = new ContentCache();
    await purgeWithCache(contentCache, options);
    // a new file with the same size and modification time renamed over the
    // old one
    const newFile = writeContent("a.tmp", '<div class="delta"></div>');
    const file = path.join(testDir, "a.html");
    fs.renameSync(newFile, file);
    expect(fs.statSync(file).mtimeMs).toBe(minuteAgo.getTime());

    const css = await purgeWithCache(contentCache, options);
    expect(extractor).toHaveBeenCalledTimes(3);
    expect(css).toBe(".beta {} .delta {}");
  });

  it("does not keep the selectors of a file modified just before", async () => {
    const contentCache = new ContentCache();
    // modified now: a change within the precision of the file system
    // timestamps would not change its modification time
    writeContent("a.html", '<div class="alpha"></div>', new Date(Date.now()));
    await purgeWithCache(contentCache, options);
    expect(contentCache.has(path.join(testDir, "a.html"))).toBe(false);
    expect(contentCache.has(path.join(testDir, "b.html"))).toBe(true);

    await purgeWithCache(contentCache, options);
    expect(extractor).toHaveBeenCalledTimes(3);
    expect(extractor).toHaveBeenLastCalledWith('<div class="alpha"></div>');
  });

  it("extracts each file once for runs at the same time", async () => {
    const contentCache = new ContentCache();
    const results = await Promise.all(
      Array.from({ length: 20 }, () => purgeWithCache(contentCache, options)),
    );
    expect(extractor).toHaveBeenCalledTimes(2);
    for (const css of results) expect(css).toBe(".alpha {} .beta {}");
  });

  it("shares the files being extracted by another run", async () => {
    const contentCache = new ContentCache();
    // shared while being extracted even when modified just before
    writeContent("a.html", '<div class="alpha"></div>', new Date(Date.now()));
    const get = jest.spyOn(contentCache, "get");
    let release: () => void = () => undefined;
    const released = new Promise<void>((resolve) => (release = resolve));
    const slowExtractor = jest.fn(async (content: string) => {
      await released;
      return content.match(/[A-Za-z0-9_-]+/g) || [];
    });
    // the extractors are awaited, although their type is synchronous
    const slowOptions = {
      ...options,
      defaultExtractor: slowExtractor as unknown as ExtractorFunction,
    };
    const waitFor = async (condition: () => boolean): Promise<void> => {
      while (!condition()) await new Promise((r) => setTimeout(r, 5));
    };

    const first = purgeWithCache(contentCache, slowOptions);
    await waitFor(() => slowExtractor.mock.calls.length === 2);
    const second = purgeWithCache(contentCache, slowOptions);
    // the second run found both files in the cache, still being extracted
    await waitFor(() => get.mock.calls.length === 4);
    expect(get.mock.results.map((result) => !!result.value)).toEqual([
      false,
      false,
      true,
      true,
    ]);
    release();
    expect(await second).toBe(".alpha {} .beta {}");
    expect(await first).toBe(".alpha {} .beta {}");
    expect(slowExtractor).toHaveBeenCalledTimes(2);
  });

  it("does not keep a failed extraction", async () => {
    const contentCache = new ContentCache();
    extractor.mockImplementationOnce(() => {
      throw new Error("extractor error");
    });
    await expect(purgeWithCache(contentCache, options)).rejects.toThrow(
      "extractor error",
    );
    const css = await purgeWithCache(contentCache, options);
    expect(css).toBe(".alpha {} .beta {}");
  });

  it("extracts again a file when its extractor changed", async () => {
    const contentCache = new ContentCache();
    await purgeWithCache(contentCache, options);
    const otherExtractor: ExtractorFunction = jest.fn(() => ["gamma"]);

    const css = await purgeWithCache(contentCache, {
      ...options,
      extractors: [{ extractor: otherExtractor, extensions: ["html"] }],
    });
    expect(otherExtractor).toHaveBeenCalledTimes(2);
    expect(css).toBe(".gamma {}");
  });

  it("picks up new files and ignores deleted files", async () => {
    const contentCache = new ContentCache();
    await purgeWithCache(contentCache, options);
    writeContent("c.html", '<div class="gamma"></div>');
    fs.rmSync(path.join(testDir, "a.html"));

    const css = await purgeWithCache(contentCache, options);
    // only the new file is read
    expect(extractor).toHaveBeenCalledTimes(3);
    expect(css).toBe(".beta {} .gamma {}");
  });

  it("is shared by files given as paths and as globs", async () => {
    const contentCache = new ContentCache();
    await purgeWithCache(contentCache, options);
    // a relative path to a file extracted through the glob
    const relativePath = path.relative(
      process.cwd(),
      path.join(testDir, "a.html"),
    );
    const css = await purgeWithCache(contentCache, {
      ...options,
      content: [relativePath],
    });
    expect(extractor).toHaveBeenCalledTimes(2);
    expect(css).toBe(".alpha {}");
  });

  it("lists its files and removes the ones not given to prune", async () => {
    const contentCache = new ContentCache();
    await purgeWithCache(contentCache, options);
    const fileA = path.join(testDir, "a.html");
    const fileB = path.join(testDir, "b.html");
    expect([...contentCache.keys()].sort()).toEqual([fileA, fileB]);

    // relative paths are resolved
    expect(contentCache.prune([path.relative(process.cwd(), fileB)])).toBe(1);
    expect([...contentCache.keys()]).toEqual([fileB]);
    expect(contentCache.prune([fileB])).toBe(0);
    expect(contentCache.prune([])).toBe(1);
    expect(contentCache.size).toBe(0);
  });

  it("can remove one or all of its files", async () => {
    const contentCache = new ContentCache();
    await purgeWithCache(contentCache, options);
    expect(contentCache.delete(path.join(testDir, "a.html"))).toBe(true);
    expect(contentCache.delete(path.join(testDir, "a.html"))).toBe(false);
    expect(contentCache.size).toBe(1);

    await purgeWithCache(contentCache, options);
    expect(extractor).toHaveBeenCalledTimes(3);

    contentCache.clear();
    expect(contentCache.size).toBe(0);
    await purgeWithCache(contentCache, options);
    expect(extractor).toHaveBeenCalledTimes(5);
  });

  it("resolves the paths given to has and delete", async () => {
    const contentCache = new ContentCache();
    await purgeWithCache(contentCache, options);
    const relativePath = path.relative(
      process.cwd(),
      path.join(testDir, "a.html"),
    );
    expect(contentCache.has(relativePath)).toBe(true);
    expect(contentCache.delete(relativePath)).toBe(true);
    expect(contentCache.has(relativePath)).toBe(false);
    expect([...contentCache.keys()]).toEqual([path.join(testDir, "b.html")]);
  });
});

describe("content files read in parallel", () => {
  let testDir: string;

  beforeAll(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "purgecss-parallel-"));
    // more files than the number of files read at the same time
    for (let i = 0; i < 100; i++) {
      fs.writeFileSync(
        path.join(testDir, `page-${i}.html`),
        `<div class="used-${i}"></div>`,
      );
    }
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it("merges the selectors of every file", async () => {
    const css = Array.from({ length: 101 }, (_, i) => `.used-${i} {}`).join(
      "\n",
    );
    for (const contentCache of [undefined, new ContentCache()]) {
      const result = await purgeWithCache(contentCache, {
        content: [path.join(testDir, "*.html")],
        css: [{ raw: css }],
      });
      expect(result).toBe(
        Array.from({ length: 100 }, (_, i) => `.used-${i} {}`).join("\n"),
      );
    }
  });

  it("extracts the selectors of every file given as a path", async () => {
    const files = Array.from({ length: 100 }, (_, i) =>
      path.join(testDir, `page-${i}.html`),
    );
    const purgeCSS = new PurgeCSS();
    const selectors = await purgeCSS.extractSelectorsFromFiles(files, []);
    for (let i = 0; i < 100; i++) {
      expect(selectors.hasClass(`used-${i}`)).toBe(true);
    }
  });

  it("merges the selectors of each file once it is extracted", async () => {
    const files = Array.from({ length: 100 }, (_, i) =>
      path.join(testDir, `page-${i}.html`),
    );
    const merge = jest.spyOn(ExtractorResultSets.prototype, "merge");
    const mergedFiles = (): number =>
      merge.mock.calls.filter(([that]) => that instanceof ExtractorResultSets)
        .length;
    // the first file is extracted last: the selectors of the other files
    // are not kept until it is done
    let mergedBeforeFirstFile = -1;
    const extractor = async (content: string): Promise<string[]> => {
      if (content.includes('"used-0"')) {
        for (let i = 0; i < 200 && mergedFiles() < 99; i++) {
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
        mergedBeforeFirstFile = mergedFiles();
      }
      return content.match(/[A-Za-z0-9_-]+/g) || [];
    };
    try {
      const selectors = await new PurgeCSS().extractSelectorsFromFiles(files, [
        {
          extractor: extractor as unknown as ExtractorFunction,
          extensions: ["html"],
        },
      ]);
      expect(mergedBeforeFirstFile).toBe(99);
      expect(mergedFiles()).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(selectors.hasClass(`used-${i}`)).toBe(true);
      }
    } finally {
      merge.mockRestore();
    }
  });

  it("limits the files read at the same time across runs", async () => {
    let pending = 0;
    let maxPending = 0;
    const extractor = async (content: string): Promise<string[]> => {
      maxPending = Math.max(maxPending, ++pending);
      await new Promise((resolve) => setTimeout(resolve, 1));
      pending--;
      return content.match(/[A-Za-z0-9_-]+/g) || [];
    };
    const runs = await Promise.all(
      Array.from({ length: 5 }, () =>
        new PurgeCSS().purge({
          content: [path.join(testDir, "*.html")],
          css: [{ raw: ".used-1 {} .unused {}" }],
          defaultExtractor: extractor as unknown as ExtractorFunction,
        }),
      ),
    );
    for (const [result] of runs) expect(result.css).toBe(".used-1 {}");
    expect(maxPending).toBe(32);
  });

  it("rejects when the extraction of a content file fails", async () => {
    const extractor = jest.fn(() => {
      throw new Error("extractor error");
    });
    await expect(
      new PurgeCSS().purge({
        content: [path.join(testDir, "*.html")],
        css: [{ raw: ".a {}" }],
        defaultExtractor: extractor,
      }),
    ).rejects.toThrow("extractor error");
    // the files left are not read once one of them failed
    expect(extractor.mock.calls.length).toBeLessThan(100);
  });

  it("rejects with the error of the first file that failed", async () => {
    const files = Array.from({ length: 100 }, (_, i) =>
      path.join(testDir, `page-${i}.html`),
    );
    // the first file is slow to fail, the others fail right away
    const extractor = jest.fn(async (content: string) => {
      const index = Number(/used-(\d+)/.exec(content)![1]);
      if (index === 1) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (index === 1 || index >= 50) throw new Error(`error ${index}`);
      return [];
    });
    await expect(
      new PurgeCSS().extractSelectorsFromFiles(files, [
        {
          extractor: extractor as unknown as ExtractorFunction,
          extensions: ["html"],
        },
      ]),
    ).rejects.toThrow(/^error 1$/);
  });
});
