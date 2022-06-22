import * as fs from "fs";
import * as path from "path";
import {
  PurgeCSS,
  ResultPurge,
  UserDefinedOptions as PurgeCSSUserDefinedOptions,
  defaultOptions,
} from "purgecss";
import { Compilation, Compiler, sources } from "webpack";
import { PurgedStats, UserDefinedOptions } from "./types";

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

function getPurgeCSSOptions(
  pluginOptions: UserDefinedOptions,
  filesToSearch: string[],
  asset: sources.Source,
  fileName: string,
  sourceMap: boolean
): PurgeCSSUserDefinedOptions {
  const options = {
    ...defaultOptions,
    ...pluginOptions,
    content: filesToSearch,
    css: [
      {
        raw: asset.source().toString(),
      },
    ],
  };

  if (typeof options.safelist === "function") {
    options.safelist = options.safelist();
  }

  if (typeof options.blocklist === "function") {
    options.blocklist = options.blocklist();
  }

  return {
    content: options.content,
    css: options.css,
    defaultExtractor: options.defaultExtractor,
    extractors: options.extractors,
    fontFace: options.fontFace,
    keyframes: options.keyframes,
    output: options.output,
    rejected: options.rejected,
    variables: options.variables,
    safelist: options.safelist,
    blocklist: options.blocklist,
    sourceMap: sourceMap ? { inline: false, to: fileName } : false,
  };
}

/**
 * Create the Source instance result of PurgeCSS
 *
 * @param name - asset name
 * @param asset - webpack asset
 * @param purgeResult - result of PurgeCSS purge method
 * @param sourceMap - wether sourceMap is enabled
 * @returns the new Source
 */
function createSource(
  name: string,
  asset: sources.Source,
  purgeResult: ResultPurge,
  sourceMap: boolean
): sources.Source {
  if (!sourceMap || !purgeResult.sourceMap) {
    return new sources.RawSource(purgeResult.css);
  }
  const { source, map } = asset.sourceAndMap();

  return new sources.SourceMapSource(
    purgeResult.css,
    name,
    purgeResult.sourceMap,
    source.toString(),
    map,
    false
  );
}

/**
 * @public
 */
export class PurgeCSSPlugin {
  options: UserDefinedOptions;
  purgedStats: PurgedStats = {};

  constructor(options: UserDefinedOptions) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      pluginName,
      this.initializePlugin.bind(this)
    );
  }

  initializePlugin(compilation: Compilation): void {
    compilation.hooks.additionalAssets.tapPromise(pluginName, async () => {
      let configFileOptions: UserDefinedOptions | undefined;
      try {
        const t = path.resolve(process.cwd(), "purgecss.config.js");
        configFileOptions = await import(t);
      } catch {
        // no config file present
      }
      this.options = {
        ...(configFileOptions ? configFileOptions : {}),
        ...this.options,
      };

      const entryPaths =
        typeof this.options.paths === "function"
          ? this.options.paths()
          : this.options.paths;

      entryPaths.forEach((p) => {
        if (!fs.existsSync(p)) throw new Error(`Path ${p} does not exist.`);
      });

      return this.runPluginHook(compilation, entryPaths);
    });
  }

  async runPluginHook(
    compilation: Compilation,
    entryPaths: string[]
  ): Promise<void> {
    const assetsFromCompilation = Object.entries(compilation.assets).filter(
      ([name]) => {
        return isFileOfTypes(name, [".css"]);
      }
    );

    for (const chunk of compilation.chunks) {
      const assetsToPurge = assetsFromCompilation.filter(([name]) => {
        if (this.options.only) {
          if (!(this.options.only.some((only) => name.includes(only)))) {
            return false;
          }
        }

        return chunk.files.has(name);
      });

      for (const [name, asset] of assetsToPurge) {
        const filesToSearch = entryPaths.filter(
          (v) => !styleExtensions.some((ext) => v.endsWith(ext))
        );

        const sourceMapEnabled = !!compilation.compiler.options.devtool;
        const purgeCSSOptions = getPurgeCSSOptions(
          this.options,
          filesToSearch,
          asset,
          name,
          sourceMapEnabled
        );

        const purgecss = await new PurgeCSS().purge(purgeCSSOptions);
        const purged = purgecss[0];

        if (purged.rejected) {
          this.purgedStats[name] = purged.rejected;
        }

        compilation.updateAsset(
          name,
          createSource(name, asset, purged, sourceMapEnabled)
        );
      }
    }
  }
}
