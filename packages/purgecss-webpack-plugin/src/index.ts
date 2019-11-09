import * as fs from "fs";
import Purgecss from "purgecss";
import { ConcatSource } from "webpack-sources";
import * as search from "./search";
import { UserDefinedOptions, PurgedStats, PurgeAsset } from "./types";

import { Compiler, Stats, compilation as compilationType } from "webpack";

type Compilation = compilationType.Compilation;

const styleExtensions = [".css", ".scss", ".styl", ".sass", ".less"];
const pluginName = "PurgeCSS";

export default class PurgeCSSPlugin {
  options: UserDefinedOptions;
  purgedStats: PurgedStats;

  constructor(options: UserDefinedOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(pluginName, (compilation: Compilation) => {
      this.initializePlugin(compilation);
    });
    compiler.hooks.done.tap(pluginName, this.onHooksDone.bind(this));
  }

  async onHooksCompilation(compilation: Compilation) {
    this.initializePlugin(compilation);
  }

  onHooksDone(stats: Stats, callback: () => void) {
    if (stats.hasErrors()) {
      if (this.options.verbose) {
        console.warn("purge-webpack-plugin: pausing due to webpack errors");
      }
      return;
    }

    if (this.options.rejected) {
      // @ts-ignore
      stats["purged"] = this.purgedStats;
    }

    // callback()
  }

  getAssetsToPurge(assetsFromCompilation: PurgeAsset[], files: string[]) {
    return assetsFromCompilation.filter(asset => {
      if (this.options.only) {
        return this.options.only.some(only => {
          return asset && asset.name.includes(only);
        });
      } else {
        return asset && files.includes(asset.name);
      }
    });
  }

  initializePlugin(compilation: Compilation) {
    const entryPaths =
      typeof this.options.paths === "function"
        ? this.options.paths()
        : this.options.paths;

    entryPaths.forEach(p => {
      if (!fs.existsSync(p)) throw new Error(`Path ${p} does not exist.`);
    });

    compilation.hooks.additionalAssets.tapPromise(pluginName, () => {
      return this.runPluginHook(compilation, entryPaths);
    });
  }

  async runPluginHook(compilation: Compilation, entryPaths: string[]) {
    const assetsFromCompilation = search.getAssets(compilation.assets, [
      ".css"
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
              (file: any) => file.resource,
              4
            )
          )
          .filter(v => !styleExtensions.some(ext => v.endsWith(ext)));

        // Compile through Purgecss and attach to output.
        // This loses sourcemaps should there be any!
        const options = {
          ...this.options,
          content: filesToSearch,
          css: [
            {
              raw: asset.source()
            }
          ]
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

        const purgecss = await new Purgecss().purge({
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
          whitelistPatternsChildren: options.whitelistPatternsChildren
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
