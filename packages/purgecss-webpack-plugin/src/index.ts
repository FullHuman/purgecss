import * as fs from "fs";
import PurgeCSS, { defaultOptions } from "purgecss";
import { ConcatSource } from "webpack-sources";
import * as search from "./search";
import { File, UserDefinedOptions, PurgedStats, PurgeAsset } from "./types";

import { Compiler, Stats, compilation as compilationType } from "webpack";

type Compilation = compilationType.Compilation;

const styleExtensions = [".css", ".scss", ".styl", ".sass", ".less"];
const pluginName = "PurgeCSS";

export default class PurgeCSSPlugin {
  options: UserDefinedOptions;
  purgedStats: PurgedStats = {};

  constructor(options: UserDefinedOptions) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(pluginName, (compilation: Compilation) => {
      this.initializePlugin(compilation);
    });
    compiler.hooks.done.tap(pluginName, this.onHooksDone.bind(this));
  }

  onHooksDone(stats: Stats): void {
    if (stats.hasErrors()) {
      if (this.options.verbose) {
        console.warn("purge-webpack-plugin: pausing due to webpack errors");
      }
      return;
    }

    if (this.options.rejected) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      stats["purged"] = this.purgedStats;
    }
  }

  getAssetsToPurge(
    assetsFromCompilation: PurgeAsset[],
    files: string[]
  ): PurgeAsset[] {
    return assetsFromCompilation.filter((asset) => {
      if (this.options.only) {
        return this.options.only.some((only) => {
          return asset && asset.name.includes(only);
        });
      } else {
        return asset && files.includes(asset.name);
      }
    });
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
    const assetsFromCompilation = search.getAssets(compilation.assets, [
      ".css",
    ]);

    for (const chunk of compilation.chunks) {
      const { files } = chunk;
      const assetsToPurge = this.getAssetsToPurge(assetsFromCompilation, files);

      for (const { name, asset } of assetsToPurge) {
        const filesToSearch = entryPaths
          .concat(
            search.files(
              chunk,
              this.options.moduleExtensions || [],
              (file: File) => file.resource
            )
          )
          .filter((v) => !styleExtensions.some((ext) => v.endsWith(ext)));

        // Compile through Purgecss and attach to output.
        // This loses sourcemaps should there be any!
        const options = {
          ...defaultOptions,
          ...this.options,
          content: filesToSearch,
          css: [
            {
              raw: asset.source(),
            },
          ],
        };

        if (typeof options.whitelist === "function") {
          options.whitelist = options.whitelist();
        }
        if (typeof options.whitelistPatterns === "function") {
          options.whitelistPatterns = options.whitelistPatterns();
        }
        if (typeof options.whitelistPatternsChildren === "function") {
          options.whitelistPatternsChildren = options.whitelistPatternsChildren();
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
          whitelist: options.whitelist,
          whitelistPatterns: options.whitelistPatterns,
          whitelistPatternsChildren: options.whitelistPatternsChildren,
        });
        const purged = purgecss[0];

        if (purged.rejected) {
          this.purgedStats[name] = purged.rejected;
        }

        compilation.assets[name] = new ConcatSource(purged.css);
      }
    }
  }
}
