import {
  ContentCache,
  ContentCacheEntry,
  ContentFileStats,
  ExtractorFunction,
  ExtractorResultSets,
} from "purgecss";

/**
 * Selectors extracted from the content files, shared by all the instances of
 * the plugin. Bundlers run PostCSS once per CSS file, and some of them (e.g.
 * postcss-loader for webpack and Rspack) create a new instance of the plugin
 * for every CSS file: a content file is only read and extracted again when it
 * changed, or when the extractor used for it is another function.
 *
 * @internal
 */
export const sharedContentCache = new ContentCache();

/**
 * Content files read by the last run of each content option, to remove from
 * the shared cache the files that no content option reads any more
 */
const contentFilesByContentKey = new Map<string, Set<string>>();

/**
 * Content cache of a run of the plugin: it uses the selectors of another
 * cache and records the content files that PurgeCSS reads through it
 *
 * @internal
 */
export class RunContentCache extends ContentCache {
  /** absolute paths of the content files read by the run */
  readonly files = new Set<string>();

  /**
   * @param cache - cache that holds the selectors
   */
  constructor(private readonly cache: ContentCache) {
    super();
  }

  get size(): number {
    return this.cache.size;
  }

  get(
    filePath: string,
    stats: ContentFileStats,
    extractor: ExtractorFunction,
  ): Promise<ExtractorResultSets> | undefined {
    this.files.add(filePath);
    return this.cache.get(filePath, stats, extractor);
  }

  set(filePath: string, entry: ContentCacheEntry): void {
    this.files.add(filePath);
    this.cache.set(filePath, entry);
  }

  has(filePath: string): boolean {
    return this.cache.has(filePath);
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  delete(filePath: string): boolean {
    return this.cache.delete(filePath);
  }

  prune(filePaths: Iterable<string>): number {
    return this.cache.prune(filePaths);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Create the content cache of a run of the plugin
 *
 * @param shared - whether the selectors are shared with the other runs, or
 * extracted again for this run only
 */
export function createRunContentCache(shared: boolean): RunContentCache {
  return new RunContentCache(shared ? sharedContentCache : new ContentCache());
}

/**
 * Remove from the shared cache the files that a content option no longer
 * reads (deleted, renamed, or no longer matched by its globs) and that no
 * other content option read on its last run, so that the cache does not grow
 * with every file ever read in a long dev session
 *
 * @param contentKey - key of the content option, e.g. its globs
 * @param files - absolute paths of the content files read by the run
 */
export function pruneSharedContentCache(
  contentKey: string,
  files: Set<string>,
): void {
  const previousFiles = contentFilesByContentKey.get(contentKey);
  contentFilesByContentKey.set(contentKey, files);
  if (!previousFiles) return;
  for (const file of previousFiles) {
    if (files.has(file)) continue;
    let isReadElsewhere = false;
    for (const otherFiles of contentFilesByContentKey.values()) {
      if (otherFiles.has(file)) {
        isReadElsewhere = true;
        break;
      }
    }
    if (!isReadElsewhere) sharedContentCache.delete(file);
  }
}
