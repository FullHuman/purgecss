'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var Purgecss = _interopDefault(require('purgecss'));
var webpackSources = require('webpack-sources');
var path = _interopDefault(require('path'));

const entryPaths = paths => {
    const ret = paths || [];

    // Convert possible string to an array
    if (typeof ret === 'string') {
        return [ret];
    }

    return ret;
};

const flatten = paths => Array.isArray(paths) ? paths : Object.keys(paths).reduce((acc, val) => [...acc, ...paths[val]], []);

const entries = (paths, chunkName) => {
    if (Array.isArray(paths)) {
        return paths;
    }

    if (!(chunkName in paths)) {
        return [];
    }

    const ret = paths[chunkName];

    return Array.isArray(ret) ? ret : [ret];
};

const assets = (assets = [], extensions = []) => Object.keys(assets).map(name => {
    return extensions.indexOf(path.extname(name.indexOf('?') >= 0 ? name.split('?').slice(0, -1).join('') : name)) >= 0 && { name, asset: assets[name] };
}).filter(a => a);

const files = (modules = {}, extensions = [], getter = a => a) => Object.keys(modules).map(name => {
    const file = getter(modules[name]);

    if (!file) {
        return null;
    }

    return extensions.indexOf(path.extname(file)) >= 0 && file;
}).filter(a => a);

class PurgecssPlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        compiler.plugin('this-compilation', compilation => {
            const entryPaths$$1 = entryPaths(this.options.paths);

            flatten(entryPaths$$1).forEach(p => {
                if (!fs.existsSync(p)) throw new Error(`Path ${p} does not exist.`);
            });

            compilation.plugin('additional-assets', cb => {
                // Go through chunks and purge as configured
                compilation.chunks.forEach(({ name: chunkName, files: files$$1, modules }) => {
                    const assetsToPurge = assets(compilation.assets, ['.css']).filter(asset => files$$1.indexOf(asset.name) >= 0);

                    assetsToPurge.forEach(({ name, asset }) => {
                        const filesToSearch = entries(entryPaths$$1, chunkName).concat(files(modules, this.options.moduleExtensions || [], file => file.resource)).filter(v => !v.endsWith('.css'));

                        // Compile through Purgecss and attach to output.
                        // This loses sourcemaps should there be any!
                        const purgecss = new Purgecss({
                            content: filesToSearch,
                            css: [asset.source()],
                            stdin: true
                        });
                        compilation.assets[name] = new webpackSources.ConcatSource(purgecss.purge()[0].css);
                    });
                });

                cb();
            });
        });
    }
}

module.exports = PurgecssPlugin;
