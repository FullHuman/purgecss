import through from 'through2';
import PluginError from 'plugin-error';
import Purgecss from 'purgecss';
import glob from 'glob';

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var PLUGIN_NAME = 'gulp-purgecss';

var getFiles = function getFiles(contentArray) {
  return contentArray.reduce(function (acc, content) {
    return [].concat(_toConsumableArray(acc), _toConsumableArray(glob.sync(content)));
  }, []);
};

var gulpPurgecss = function gulpPurgecss(options) {
  return through.obj(function (file, encoding, callback) {
    var _this = this;

    // empty
    if (file.isNull()) return callback(null, file); // buffer

    if (file.isBuffer()) {
      try {
        var optionsGulp = Object.assign(options, {
          content: getFiles(options.content),
          css: [{
            raw: file.contents.toString()
          }],
          stdin: true
        });
        var purge = new Purgecss(optionsGulp).purge()[0];
        var result = optionsGulp.rejected ? purge.rejected.join(' {}\n') + ' {}' : purge.css;
        file.contents = new Buffer(result);
        callback(null, file);
      } catch (e) {
        this.emit('error', new PluginError(PLUGIN_NAME, e.message));
      }
    } // stream


    if (file.isStream()) {
      var css = '';
      file.on('readable', function (buffer) {
        css += buffer.read().toString();
      }).on('end', function () {
        try {
          var _optionsGulp = Object.assign(options, {
            css: [css]
          });

          var _purge = new Purgecss(_optionsGulp).purge()[0];

          var _result = _optionsGulp.rejected ? _purge.rejected.join(' {}\n') + ' {}' : _purge.css;

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
