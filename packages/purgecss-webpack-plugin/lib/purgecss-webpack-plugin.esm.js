import { existsSync } from 'fs';
import Purgecss from 'purgecss';
import { ConcatSource } from 'webpack-sources';
import path from 'path';

/**
 * Get the filename without ?hash
 * @param fileName file name
 */
function getFormattedFilename(fileName) {
    if (fileName.includes("?")) {
        return fileName
            .split("?")
            .slice(0, -1)
            .join("");
    }
    return fileName;
}
/**
 * Returns true if the filename is of types of one of the specified extensions
 * @param filename file name
 * @param extensions extensions
 */
function isFileOfTypes(filename, extensions) {
    const extension = path.extname(getFormattedFilename(filename));
    return extensions.includes(extension);
}
/**
 * Get the assets that are of one of the specified extensions
 * @param assets assets
 * @param extensions extensions
 */
function getAssets(assets, extensions) {
    const purgeAssets = [];
    if (!assets)
        return purgeAssets;
    for (const [name, asset] of Object.entries(assets)) {
        if (isFileOfTypes(name, extensions)) {
            purgeAssets.push({
                name,
                asset: asset
            });
        }
    }
    return purgeAssets;
}
function files(chunk, extensions) {
    const mods = [];
    for (const module of Array.from(chunk.modulesIterable || [])) {
        const file = module.resource;
        if (file && extensions.includes(path.extname(file)))
            mods.push(file);
    }
    return mods;
}

const styleExtensions = [".css", ".scss", ".styl", ".sass", ".less"];
const pluginName = "PurgeCSS";
class PurgeCSSPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
            this.initializePlugin(compilation);
        });
        compiler.hooks.done.tap(pluginName, this.onHooksDone.bind(this));
    }
    async onHooksCompilation(compilation) {
        this.initializePlugin(compilation);
    }
    async onHooksDone(stats, callback) {
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
    }
    getAssetsToPurge(assetsFromCompilation, files) {
        return assetsFromCompilation.filter(asset => {
            if (this.options.only) {
                return this.options.only.some(only => {
                    return asset && asset.name.includes(only);
                });
            }
            else {
                return asset && files.includes(asset.name);
            }
        });
    }
    initializePlugin(compilation) {
        const entryPaths = typeof this.options.paths === "function"
            ? this.options.paths()
            : this.options.paths;
        entryPaths.forEach(p => {
            if (!existsSync(p))
                throw new Error(`Path ${p} does not exist.`);
        });
        compilation.hooks.additionalAssets.tapAsync(pluginName, (ctx, callback) => {
            this.runPluginHook(compilation, entryPaths).then(callback).catch(callback);
        });
    }
    async runPluginHook(compilation, entryPaths) {
        const assetsFromCompilation = getAssets(compilation.assets, [
            ".css"
        ]);
        for (const chunk of compilation.chunks) {
            const { files: files$1 } = chunk;
            const assetsToPurge = this.getAssetsToPurge(assetsFromCompilation, files$1);
            for (const { name, asset } of assetsToPurge) {
                const filesToSearch = entryPaths
                    .concat(files(chunk, this.options.moduleExtensions || []))
                    .filter(v => styleExtensions.some(ext => v.endsWith(ext)));
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
                console.log('yo', name);
                compilation.assets[name] = new ConcatSource(purged.css);
            }
        }
    }
}

export default PurgeCSSPlugin;
