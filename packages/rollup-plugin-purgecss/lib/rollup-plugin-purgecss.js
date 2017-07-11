'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rollupPluginutils = require('rollup-pluginutils');
var Purgecss = _interopDefault(require('purgecss'));

const pluginPurgecss = function (options = {}) {
    const filter = rollupPluginutils.createFilter(options.include || ['**/*.css'], options.exclude || 'node_modules/**');
    const styles = [];
    let dest = '';

    return {
        name: 'purgecss',
        transform(code, id) {
            if (!filter(id)) return null;

            const purgecss = new Purgecss({
                content: options.content,
                css: [code],
                stdin: true
            });
            let css = purgecss.purge()[0].css;
            styles.push(css);

            css = JSON.stringify(css);
            if (options.insert) {
                // do thing
            } else if (!options.output) {
                code = css;
            } else {
                code = `"";`;
            }

            return {
                code: `export default ${code}`,
                map: { mappings: '' }
            };
        },
        ongenerate(opts, result) {
            if (!options.insert && (!styles.length || options.output === false)) {
                return;
            }
            const css = styles.reduce((acc, value) => {
                return acc + value;
            }, '');
            if (typeof options.output === "string") {
                return fs.writeFileSync(options.output, css);
            }
            if (typeof options.output === "function") {
                return options.output(css, styles);
            }
            if (!options.insert && dest) {
                if (dest.endsWith('.js') || dest.endsWith('.ts')) {
                    dest = dest.slice(0, -3);
                }
                dest = `${dest}.css`;
                return fs.writeFileSync(dest, css);
            }
        }
    };
};

module.exports = pluginPurgecss;
