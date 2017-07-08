import { createFilter } from 'rollup-pluginutils';
import Purgecss from 'purgecss';

var pluginPurgecss = function pluginPurgecss() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var filter = createFilter(options.include || ['**/*.css'], options.exclude || 'node_modules/**');

    var purgecssOptions = Object.assign(options.options, {
        css: options.include
    });
    var purgecss = new Purgecss({
        content: options.content,
        css: options.include
    });

    return {
        transform: function transform(code, id) {
            if (!filter(id)) return;

            return {
                code: ""
            };
        },
        ongenerate: function ongenerate(opts, result) {}
    };
};

export default pluginPurgecss;
