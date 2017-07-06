'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var through = _interopDefault(require('through2'));
var gulpUtil = _interopDefault(require('gulp-util'));
var Purgecss = _interopDefault(require('purgecss'));

var PLUGIN_NAME = 'gulp-purgecss';

var gulpPurgecss = function gulpPurgecss(options) {
    return through.obj(function (file, encoding, callback) {
        var _this = this;

        // empty
        if (file.isNull()) return callback(null, file);
        // buffer
        if (file.isBuffer()) {
            try {
                var optionsGulp = Object.assign(options, {
                    css: file.contents.toString(),
                    stdin: true
                });
                var result = new Purgecss(optionsGulp).purge()[0].css;
                files.contents = new Buffer(result);
                callback(null, file);
            } catch (e) {
                this.emit('error', new gulpUtil.PluginError(PLUGIN_NAME, e.message));
            }
        }
        // stream
        if (file.isStream()) {
            var css = '';
            file.on('readable', function (buffer) {
                css += buffer.read().toString();
            }).on('end', function () {
                try {
                    var _optionsGulp = Object.assign(options, { css: [css] });
                    var _result = new Purgecss(_optionsGulp).purge()[0].css;
                    file.contents = new Buffer(_result);
                    callback(null, file);
                } catch (e) {
                    _this.emit('error', new gulpUtil.PluginError(PLUGIN_NAME, e.message));
                }
            });
        }
    });
};

module.exports = gulpPurgecss;
