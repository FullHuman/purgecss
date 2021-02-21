import * as fs from "fs";
import path from "path";
import PurgeCSS, { defaultOptions } from "purgecss";
import { ConcatSource } from "webpack-sources";
import { UserDefinedOptions, PurgedStats } from "./types";

import { Compiler, Compilation } from "webpack";

const styleExtensions = [".css", ".scss", ".styl", ".sass", ".less"];
const pluginName = "PurgeCSS";

/**
 * Get the filename without ?hash
 * @param fileName file name
 */
function getFormattedFilename(fileName: string): string {
  if (fileName.includes("?")) {
    return fileName.split("?").slice(0, -1).join("");
  }
  return fileName;
}

/**
 * Returns true if the filename is of types of one of the specified extensions
 * @param filename file name
 * @param extensions extensions
 */
function isFileOfTypes(filename: string, extensions: string[]): boolean {
  const extension = path.extname(getFormattedFilename(filename));
  return extensions.includes(extension);
}

export default class PurgeCSSPlugin {
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
    compilation.hooks.additionalAssets.tapPromise(pluginName, () => {
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
          return this.options.only.some((only) => name.includes(only));
        }

        return Array.isArray(chunk.files)
          ? chunk.files.includes(name)
          : chunk.files.has(name);
      });

      for (const [name, asset] of assetsToPurge) {
        const filesToSearch = entryPaths.filter(
          (v) => !styleExtensions.some((ext) => v.endsWith(ext))
        );

        // Compile through Purgecss and attach to output.
        // This loses sourcemaps should there be any!
        const options = {
          ...defaultOptions,
          ...this.options,
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

        const purgecss = await new PurgeCSS().purge({
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
        });
        const purged = purgecss[0];

        if (purged.rejected) {
          this.purgedStats[name] = purged.rejected;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        compilation.updateAsset(name, new ConcatSource(purged.css));
      }
    }
  }
}
