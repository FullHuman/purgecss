import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";
import {
  ContentCache,
  ExtractorResultSets,
  PurgeCSS,
  ResultPurge,
  UserDefinedOptions as PurgeCSSUserDefinedOptions,
  defaultOptions,
} from "purgecss";
// only types are imported from webpack: at runtime, the plugin uses the
// classes of the bundler running it (`compiler.webpack`), webpack or Rspack
import type { Chunk, Compilation, sources } from "webpack";
import { collectCssModulesExports } from "./css-modules";
import {
  CompilationLike,
  CompilerLike,
  PurgedStats,
  UserDefinedOptions,
} from "./types";

export * from "./types";

const styleExtensions = [".css", ".scss", ".styl", ".sass", ".less"];
const pluginName = "PurgeCSS";

/**
 * Get the filename without ?hash
 *
 * @param fileName - file name
 */
function getFormattedFilename(fileName: string): string {
  if (fileName.includes("?")) {
    return fileName.split("?").slice(0, -1).join("");
  }
  return fileName;
}

/**
 * Returns true if the filename is of types of one of the specified extensions
 *
 * @param filename - file name
 * @param extensions - extensions
 */
function isFileOfTypes(filename: string, extensions: string[]): boolean {
  const extension = path.extname(getFormattedFilename(filename));
  return extensions.includes(extension);
}

/**
 * Options of PurgeCSS from the options of the plugin, without the content
 * and the css
 *
 * @param pluginOptions - options of the plugin
 * @param sourceMap - whether source maps are generated
 */
function getPurgeCSSOptions(
  pluginOptions: UserDefinedOptions,
  sourceMap: boolean,
): Omit<PurgeCSSUserDefinedOptions, "content" | "css"> {
  const options = {
    ...defaultOptions,
    ...pluginOptions,
  };

  if (typeof options.safelist === "function") {
    options.safelist = options.safelist();
  }

  if (typeof options.blocklist === "function") {
    options.blocklist = options.blocklist();
  }

  return {
    defaultExtractor: options.defaultExtractor,
    extractors: options.extractors,
    fontFace: options.fontFace,
    keyframes: options.keyframes,
    output: options.output,
    rejected: options.rejected,
    variables: options.variables,
    safelist: options.safelist,
    blocklist: options.blocklist,
    dynamicAttributes: options.dynamicAttributes,
    // the source map of an asset is extracted by webpack (`devtool`), which
    // adds its own annotation. Its path defaults to the name of the asset.
    sourceMap: sourceMap ? { inline: false, annotation: false } : false,
  };
}

/**
 * Create a PurgeCSS instance with its options set, without content or css
 *
 * @param options - options of PurgeCSS
 */
async function createPurgeCSS(
  options: Omit<PurgeCSSUserDefinedOptions, "content" | "css">,
): Promise<PurgeCSS> {
  const purgeCSS = new PurgeCSS();
  // `purge` sets the options (default values, safelist) and has nothing to
  // read or purge
  await purgeCSS.purge({ ...options, content: [], css: [] });
  return purgeCSS;
}

/**
 * Create the Source instance result of PurgeCSS
 *
 * @param webpackSources - `sources` of the bundler, webpack or Rspack
 * @param name - asset name
 * @param asset - webpack asset
 * @param purgeResult - result of PurgeCSS purge method
 * @param sourceMap - wether sourceMap is enabled
 * @returns the new Source
 */
function createSource(
  webpackSources: typeof sources,
  name: string,
  asset: sources.Source,
  purgeResult: ResultPurge,
  sourceMap: boolean,
): sources.Source {
  if (!sourceMap || !purgeResult.sourceMap) {
    return new webpackSources.RawSource(purgeResult.css);
  }
  const { source, map } = asset.sourceAndMap();
  const purgedMap = JSON.parse(purgeResult.sourceMap) as { sources?: string[] };

  // the map of the purged css points to the css before purging, under the
  // name in its `sources`, which the map of that css is applied to. What the
  // map of that css does not map, e.g. the comments added by
  // mini-css-extract-plugin, is left unmapped instead of being mapped to the
  // css before purging.
  return new webpackSources.SourceMapSource(
    purgeResult.css,
    purgedMap.sources?.[0] ?? name,
    purgeResult.sourceMap,
    source.toString(),
    map ?? undefined,
    !!map,
  );
}

/**
 * Add the content files to the dependencies of the compilation, so that the
 * watcher of webpack or Rspack runs a new compilation when one of them
 * changes, and return the files that do not exist.
 *
 * The watchers do not follow symbolic links by default
 * (`watchOptions.followSymlinks`): the target of a symbolic link, e.g. a
 * file of a workspace package linked in `node_modules`, is added too.
 *
 * @param compilation - compilation of webpack or Rspack
 * @param entryPaths - content files
 * @returns the content files that do not exist
 */
function addContentDependencies(
  compilation: Compilation,
  entryPaths: string[],
): string[] {
  const missingPaths: string[] = [];
  for (const p of entryPaths) {
    const absolutePath = path.resolve(p);
    if (!fs.existsSync(absolutePath)) {
      missingPaths.push(p);
      compilation.missingDependencies.add(absolutePath);
      continue;
    }
    compilation.fileDependencies.add(absolutePath);
    const realPath = fs.realpathSync(absolutePath);
    if (realPath !== absolutePath) compilation.fileDependencies.add(realPath);
  }
  return missingPaths;
}

/**
 * @public
 */
export class PurgeCSSPlugin {
  options: UserDefinedOptions;
  purgedStats: PurgedStats = {};
  /**
   * Selectors extracted from the content files, kept from one compilation to
   * the next one in watch mode: only the files that changed are read again
   */
  private contentCache = new ContentCache();

  constructor(options: UserDefinedOptions) {
    this.options = options;
  }

  /**
   * Apply the plugin to a webpack or Rspack compiler
   *
   * @param compiler - compiler of webpack or Rspack
   */
  apply(compiler: CompilerLike): void {
    compiler.hooks.compilation.tap(pluginName, (compilation) =>
      this.initializePlugin(compilation),
    );
  }

  /**
   * Purge the CSS assets of a compilation of webpack or Rspack
   *
   * @param compilationLike - compilation of webpack or Rspack
   */
  initializePlugin(compilationLike: CompilationLike): void {
    const compilation = compilationLike as Compilation;
    const { Compilation } = compilation.compiler.webpack;
    compilation.hooks.processAssets.tapPromise(
      {
        name: pluginName,
        // the stage of the deprecated `additionalAssets` hook the plugin used
        // to run in: the CSS assets of the chunks are added when the chunks
        // are rendered, before `processAssets`. Plugins that derive assets
        // from the CSS (PRE_PROCESS, DERIVED, ADDITIONS) read the purged CSS,
        // which is purged before it is minimized (OPTIMIZE_SIZE), its source
        // map extracted (DEV_TOOLING) and content hashes updated
        // (OPTIMIZE_HASH)
        stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
      },
      async () => {
        let configFileOptions: UserDefinedOptions | undefined;
        const t = path.resolve(process.cwd(), "purgecss.config.js");
        // the config file is optional, but an existing one that fails to load
        // (e.g. a syntax error) is reported instead of being silently ignored
        if (fs.existsSync(t)) {
          try {
            const importedConfig = await import(pathToFileURL(t).href);
            // Handle both ES modules (direct export) and CommonJS (default export)
            configFileOptions =
              importedConfig.default &&
              typeof importedConfig.default === "object"
                ? importedConfig.default
                : importedConfig;
          } catch (err: unknown) {
            throw new Error(`Error loading the config file ${t}: ${err}`, {
              cause: err,
            });
          }
        }
        this.options = {
          ...(configFileOptions ? configFileOptions : {}),
          ...this.options,
        };

        const entryPaths =
          typeof this.options.paths === "function"
            ? this.options.paths()
            : this.options.paths;

        // in watch mode, a change to a content file triggers a new
        // compilation, the content files being outside the module graph. A
        // missing file is watched too, so that the compilation runs again
        // once it is created.
        const missingPaths = addContentDependencies(compilation, entryPaths);
        if (missingPaths.length > 0) {
          // an error of the compilation, not of the hook: webpack watches
          // the dependencies of a compilation that failed with errors, not
          // of one whose hook threw
          const { WebpackError } = compilation.compiler.webpack;
          for (const p of missingPaths) {
            compilation.errors.push(
              new WebpackError(`Path ${p} does not exist.`),
            );
          }
          return;
        }

        return this.runPluginHook(compilation, entryPaths);
      },
    );
  }

  /**
   * Purge the CSS assets of a compilation
   *
   * @param compilationLike - compilation of webpack or Rspack
   * @param entryPaths - content files
   */
  async runPluginHook(
    compilationLike: CompilationLike,
    entryPaths: string[],
  ): Promise<void> {
    const compilation = compilationLike as Compilation;
    // CSS assets to purge, and the chunks they belong to. An asset of
    // several chunks is purged once.
    const assetsToPurge = new Set<string>();
    const chunksToPurge = new Set<Chunk>();
    for (const chunk of compilation.chunks) {
      // `only` lists chunk names, e.g. the entry names. Compare them with the
      // chunk name, not with the asset path: a substring of the path also
      // matches other chunks (`style` in `style_print.css` or `css/style/`)
      if (
        this.options.only &&
        !(chunk.name && this.options.only.includes(chunk.name))
      ) {
        continue;
      }
      for (const name of chunk.files) {
        if (
          isFileOfTypes(name, [".css"]) &&
          compilation.getAsset(name) &&
          !assetsToPurge.has(name)
        ) {
          assetsToPurge.add(name);
          chunksToPurge.add(chunk);
        }
      }
    }
    if (assetsToPurge.size === 0) return;

    const sourceMapEnabled = !!compilation.compiler.options.devtool;
    const purgeCSSOptions = getPurgeCSSOptions(this.options, sourceMapEnabled);

    // the content is extracted once for all the assets of the compilation
    const filesToSearch = entryPaths.filter(
      (v) => !styleExtensions.some((ext) => v.endsWith(ext)),
    );
    const contentPurgeCSS = await createPurgeCSS(purgeCSSOptions);
    contentPurgeCSS.contentCache = this.contentCache;
    const selectors = await contentPurgeCSS.extractSelectorsFromFiles(
      filesToSearch,
      contentPurgeCSS.options.extractors,
    );
    // forget the files that are no longer part of the content
    this.contentCache.prune(filesToSearch);
    addCssModulesSelectors(
      selectors,
      collectCssModulesExports(compilation, chunksToPurge),
    );

    const webpackSources = compilation.compiler.webpack.sources;
    for (const name of assetsToPurge) {
      const asset = compilation.getAsset(name);
      if (!asset) continue;

      // an instance per asset: the font faces, keyframes and variables of an
      // asset are removed when unused in that asset
      const purgeCSS = await createPurgeCSS(purgeCSSOptions);
      // the asset name is the path of the css in the source map
      const [purged] = await purgeCSS.getPurgedCSS(
        [{ raw: asset.source.source().toString(), name }],
        selectors,
      );

      if (purged.rejected) {
        this.purgedStats[name] = purged.rejected;
      }

      // Rspack only writes the assets whose version changed since the
      // previous compilation, in watch mode: the version of the asset it
      // rendered does not change with the content files
      const hash = compilation.compiler.webpack.util.createHash(
        compilation.outputOptions.hashFunction ?? "xxhash64",
      );
      hash.update(purged.css);
      if (purged.sourceMap) hash.update(purged.sourceMap);
      const version = hash.digest("hex").toString();
      compilation.updateAsset(
        name,
        createSource(
          webpackSources,
          name,
          asset.source,
          purged,
          sourceMapEnabled,
        ),
        (info) => ({ ...info, version }),
      );
    }
  }
}

/**
 * Words of the selectors found in the content, for extractors that do not
 * split `styles.modUsed` into `styles` and `modUsed`, such as the extractors
 * of Tailwind CSS, which yield the token `styles.modUsed`. The selectors
 * are read from the sets of `ExtractorResultSets`; none are read if its
 * implementation changes.
 *
 * @param selectors - selectors found in the content
 */
function getContentWords(selectors: ExtractorResultSets): Set<string> {
  const words = new Set<string>();
  const { classes, undetermined } = selectors as unknown as {
    classes?: unknown;
    undetermined?: unknown;
  };
  for (const tokens of [classes, undetermined]) {
    if (!(tokens instanceof Set)) continue;
    for (const token of tokens) {
      if (typeof token !== "string") continue;
      for (const word of token.split(/[^\w$-]+/)) {
        if (word) words.add(word);
      }
    }
  }
  return words;
}

/**
 * Add to the selectors found in the content the hashed class names of the
 * CSS modules that are used: those exported under a name found in the
 * content (`styles.modUsed` keeps the class exported as `modUsed`), and
 * those the bundler found to be used.
 *
 * @param selectors - selectors found in the content
 * @param cssModules - exports of the CSS modules
 */
function addCssModulesSelectors(
  selectors: ExtractorResultSets,
  cssModules: ReturnType<typeof collectCssModulesExports>,
): void {
  const classNames = [...cssModules.usedClassNames];
  let words: Set<string> | undefined;
  for (const { name, classNames: exported } of cssModules.exports) {
    if (selectors.hasClass(name)) {
      classNames.push(...exported);
      continue;
    }
    words ??= getContentWords(selectors);
    if (words.has(name)) classNames.push(...exported);
  }
  if (classNames.length > 0) {
    selectors.merge({
      classes: classNames,
      ids: [],
      tags: [],
      attributes: { names: [], values: [] },
      undetermined: [],
    });
  }
}
