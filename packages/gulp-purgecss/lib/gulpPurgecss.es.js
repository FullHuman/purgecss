import through from 'through2';
import PluginError from 'plugin-error';
import Purgecss from 'purgecss';
import glob from 'glob';

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var PLUGIN_NAME = 'gulp-purgecss';

var getFiles = function getFiles(contentArray) {
  return contentArray.reduce(function (acc, content) {
    return [].concat(toConsumableArray(acc), toConsumableArray(glob.sync(content)));
  }, []);
};

var gulpPurgecss = function gulpPurgecss(options) {
  return through.obj(function (file, encoding, callback) {
    var _this = this;

    // empty
    if (file.isNull()) return callback(null, file);
    // buffer
    if (file.isBuffer()) {
      try {
        var optionsGulp = Object.assign(options, {
          content: getFiles(options.content),
          css: [file.contents.toString()],
          stdin: true
        });
        var result = new Purgecss(optionsGulp).purge()[0].css;
        file.contents = new Buffer(result);
        callback(null, file);
      } catch (e) {
        this.emit('error', new PluginError(PLUGIN_NAME, e.message));
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
          _this.emit('error', new PluginError(PLUGIN_NAME, e.message));
        }
      });
    }
  });
};

export default gulpPurgecss;
