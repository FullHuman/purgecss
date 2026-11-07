import * as path from "path";
import ExtractorResultSets from "./ExtractorResultSets";
import { ExtractorFunction } from "./types";

/**
 * Time, in milliseconds, a content file must have gone unmodified and
 * unchanged before the selectors extracted from it are kept in the cache once
 * the extraction is done. File systems store modification and change times
 * with a limited precision (2 seconds for the modification time on FAT, a few
 * milliseconds for the change time on Linux before 6.13): a file modified or
 * changed less than that before being read could be modified again with the
 * same times.
 */
const RECENTLY_MODIFIED_MS = 2000;

/**
 * Information of `fs.Stats` that tells if a content file changed
 *
 * @public
 */
export interface ContentFileStats {
  /** modification time of the file, `fs.Stats.mtimeMs` */
  mtimeMs: number;
  /**
   * change time of the file, `fs.Stats.ctimeMs`. Unlike the modification
   * time, it cannot be set back, e.g. by `touch -r` or a backup restore.
   */
  ctimeMs: number;
  /** size of the file in bytes, `fs.Stats.size` */
  size: number;
  /** inode number of the file, `fs.Stats.ino` */
  ino: number;
}

/**
 * Selectors extracted from a content file, along with what they were
 * extracted from
 *
 * @public
 */
export interface ContentCacheEntry extends ContentFileStats {
  /** extractor function used to extract the selectors */
  extractor: ExtractorFunction;
  /**
   * selectors extracted from the file. The promise is stored as soon as the
   * file starts being read, so that runs at the same time share the work.
   */
  selectors: Promise<ExtractorResultSets>;
  /**
   * time, `Date.now()`, right before the file was stat. When the file was
   * modified or changed less than 2 seconds before, the entry is only shared
   * while the file is being read and extracted, and is removed once it is
   * done.
   */
  checkedAt: number;
}

/**
 * Cache of the selectors extracted from content files, shared across
 * PurgeCSS instances.
 *
 * Integrations that run PurgeCSS many times with the same content, e.g. a
 * PostCSS plugin called once per CSS file or a bundler plugin in watch mode,
 * can set the same cache on every PurgeCSS instance they create with
 * {@link PurgeCSS.contentCache}. A content file is then only read and
 * extracted again when its modification time, change time, size, inode or
 * the extractor used for it changed. Runs at the same time share the files
 * being read and extracted: each file is extracted once.
 *
 * A file modified or changed (e.g. its modification time set back) less than
 * 2 seconds before it was read is extracted again on the next run, as a
 * modification within the precision of the file system timestamps would keep
 * the same modification and change times.
 *
 * The paths given to the methods are resolved from the current working
 * directory.
 *
 * Globs are still resolved on every run, so new files are picked up and
 * deleted files no longer contribute selectors. The entries of the files that
 * are no longer used stay in the cache until {@link ContentCache.prune},
 * {@link ContentCache.delete} or {@link ContentCache.clear} is called.
 *
 * The extractors are called concurrently and in no particular order: they
 * must not depend on the order of the files or on a state kept between files.
 *
 * @example
 * ```ts
 * const contentCache = new ContentCache()
 * for (const css of cssFiles) {
 *   const purgeCSS = new PurgeCSS()
 *   purgeCSS.contentCache = contentCache
 *   await purgeCSS.purge({ content: ['src/pages/*.html'], css: [css] })
 * }
 * ```
 *
 * @public
 */
export class ContentCache {
  private entries = new Map<string, ContentCacheEntry>();
  /**
   * Strings of the selectors of the entries, one per distinct selector: the
   * files of a project share most of their selectors, which would otherwise
   * be kept once per file, each one keeping the whole content of its file
   * in memory. It holds the selectors of the files removed from the cache
   * too, until {@link ContentCache.clear}.
   */
  private selectorsPool = new Map<string, string>();

  /**
   * Number of files in the cache
   */
  get size(): number {
    return this.entries.size;
  }

  /**
   * Get the selectors of a file if they are still valid. The selectors may
   * still be being extracted by another run.
   *
   * @param filePath - path of the content file
   * @param stats - current stats of the file
   * @param extractor - extractor function used for the file
   * @returns the selectors extracted from the file, or `undefined` when the
   * file is not in the cache or changed since it was extracted
   */
  get(
    filePath: string,
    stats: ContentFileStats,
    extractor: ExtractorFunction,
  ): Promise<ExtractorResultSets> | undefined {
    const entry = this.entries.get(path.resolve(filePath));
    if (
      entry &&
      entry.mtimeMs === stats.mtimeMs &&
      entry.ctimeMs === stats.ctimeMs &&
      entry.size === stats.size &&
      entry.ino === stats.ino &&
      entry.extractor === extractor
    ) {
      return entry.selectors;
    }
    return undefined;
  }

  /**
   * Store the selectors of a file. The entry is removed when its selectors
   * reject, or once they resolve when the file was modified or changed less
   * than 2 seconds before {@link ContentCacheEntry.checkedAt}.
   *
   * @param filePath - path of the content file
   * @param entry - selectors of the file and what they were extracted from
   */
  set(filePath: string, entry: ContentCacheEntry): void {
    filePath = path.resolve(filePath);
    this.entries.set(filePath, entry);
    const forget = (): void => {
      if (this.entries.get(filePath) === entry) this.entries.delete(filePath);
    };
    entry.selectors.then((selectors) => {
      const changedAt = Math.max(entry.mtimeMs, entry.ctimeMs);
      if (entry.checkedAt - changedAt < RECENTLY_MODIFIED_MS) {
        forget();
      } else if (
        this.entries.get(filePath) === entry &&
        typeof selectors?.internSelectors === "function"
      ) {
        // the selectors are equal strings: the runs that read them get the
        // same selectors
        selectors.internSelectors(this.selectorsPool);
      }
    }, forget);
  }

  /**
   * Check if a file is in the cache, whether its entry is still valid or not
   *
   * @param filePath - path of the content file
   */
  has(filePath: string): boolean {
    return this.entries.has(path.resolve(filePath));
  }

  /**
   * Absolute paths of the files in the cache
   */
  keys(): IterableIterator<string> {
    return this.entries.keys();
  }

  /**
   * Remove a file from the cache
   *
   * @param filePath - path of the content file
   * @returns true if the file was in the cache
   */
  delete(filePath: string): boolean {
    return this.entries.delete(path.resolve(filePath));
  }

  /**
   * Remove the files that are not in the given list, e.g. the files of a
   * previous build that the content globs no longer match
   *
   * @param filePaths - paths of the files to keep
   * @returns the number of files removed
   */
  prune(filePaths: Iterable<string>): number {
    const kept = new Set<string>();
    for (const filePath of filePaths) kept.add(path.resolve(filePath));
    let removed = 0;
    for (const filePath of this.entries.keys()) {
      if (!kept.has(filePath)) {
        this.entries.delete(filePath);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Remove all the files from the cache
   */
  clear(): void {
    this.entries.clear();
    this.selectorsPool.clear();
  }
}
