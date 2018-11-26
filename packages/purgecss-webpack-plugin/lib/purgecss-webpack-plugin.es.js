import fs from 'fs';
import Purgecss from 'purgecss';
import { ConcatSource } from 'webpack-sources';
import path from 'path';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

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

var entryPaths = function entryPaths(paths) {
  var ret = paths || [];

  if (typeof ret === 'function') {
    ret = ret();
  } // Convert possible string to an array


  if (typeof ret === 'string') {
    ret = [ret];
  }

  return ret;
};
var flatten = function flatten(paths) {
  return Array.isArray(paths) ? paths : Object.keys(paths).reduce(function (acc, val) {
    return _toConsumableArray(acc).concat(_toConsumableArray(paths[val]));
  }, []);
};
var entries = function entries(paths, chunkName) {
  if (Array.isArray(paths)) {
    return paths;
  }

  if (!(chunkName in paths)) {
    return [];
  }

  var ret = paths[chunkName];
  return Array.isArray(ret) ? ret : [ret];
};

var assets = function assets() {
  var assets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var extensions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return Object.keys(assets).map(function (name) {
    return extensions.indexOf(path.extname(name.indexOf('?') >= 0 ? name.split('?').slice(0, -1).join('') : name)) >= 0 && {
      name: name,
      asset: assets[name]
    };
  }).filter(function (a) {
    return a;
  });
};
var files = function files(chunk) {
  var extensions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var getter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (a) {
    return a;
  };
  var webpackVersion = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 3;
  var mods = [];

  if (webpackVersion === 4) {
    Array.from(chunk.modulesIterable || [], function (module) {
      var file = getter(module);

      if (file) {
        mods.push(extensions.indexOf(path.extname(file)) >= 0 && file);
      }
    });
  } else if (chunk.mapModules) {
    chunk.mapModules(function (module) {
      var file = getter(module);
      if (!file) return null;
      return extensions.indexOf(path.extname(file)) >= 0 && file;
    });
  }

  return mods.filter(function (a) {
    return a;
  });
};

var webpackVersion = 4;
var styleExtensions = ['.css', '.scss', '.styl', '.sass', '.less'];
var pluginName = 'PurgeCSS';
var purgedStats = {};

var PurgecssPlugin =
/*#__PURE__*/
function () {
  function PurgecssPlugin(options) {
    _classCallCheck(this, PurgecssPlugin);

    this.options = options;
  }

  _createClass(PurgecssPlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      if (typeof compiler.hooks === 'undefined') {
        webpackVersion = 3;
      }

      if (webpackVersion === 4) {
        compiler.hooks.compilation.tap(pluginName, function (compilation) {
          _this.initializePlugin(compilation);
        });
        compiler.hooks.done.tapAsync(pluginName, function (stats, cb) {
          _this.addStats(stats);

          cb();
        });
      } else {
        compiler.plugin('this-compilation', function (compilation) {
          _this.initializePlugin(compilation);
        });
        compiler.plugin('done', function (stats) {
          _this.addStats(stats);
        });
      }
    }
  }, {
    key: "addStats",
    value: function addStats(stats) {
      if (this.options.rejected) {
        stats.purged = purgedStats;
      }
    }
  }, {
    key: "initializePlugin",
    value: function initializePlugin(compilation) {
      var _this2 = this;

      var entryPaths$$1 = entryPaths(this.options.paths);
      flatten(entryPaths$$1).forEach(function (p) {
        if (!fs.existsSync(p)) throw new Error("Path ".concat(p, " does not exist."));
      });

      if (webpackVersion === 4) {
        compilation.hooks.additionalAssets.tap(pluginName, function () {
          _this2.runPluginHook(compilation, entryPaths$$1);
        });
      } else {
        compilation.plugin('additional-assets', function (callback) {
          _this2.runPluginHook(compilation, entryPaths$$1, callback);
        });
      }
    }
  }, {
    key: "runPluginHook",
    value: function runPluginHook(compilation, entryPaths$$1) {
      var _this3 = this;

      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
      var assetsFromCompilation = assets(compilation.assets, ['.css']); // Go through chunks and purge as configured

      compilation.chunks.forEach(function (chunk) {
        var chunkName = chunk.name,
            files$$1 = chunk.files;
        var assetsToPurge = assetsFromCompilation.filter(function (asset) {
          if (_this3.options.only) {
            return [].concat(_this3.options.only).some(function (only) {
              return asset.name.indexOf(only) >= 0;
            });
          } else {
            return files$$1.indexOf(asset.name) >= 0;
          }
        });
        assetsToPurge.forEach(function (_ref) {
          var name = _ref.name,
              asset = _ref.asset;
          var filesToSearch = entries(entryPaths$$1, chunkName).concat(files(chunk, _this3.options.moduleExtensions || [], function (file) {
            return file.resource;
          }, webpackVersion)).filter(function (v) {
            for (var _i = 0; _i < styleExtensions.length; _i++) {
              var ext = styleExtensions[_i];
              if (v.endsWith(ext)) return false;
            }

            return true;
          }); // Compile through Purgecss and attach to output.
          // This loses sourcemaps should there be any!

          var options = _objectSpread({}, _this3.options, {
            content: filesToSearch,
            css: [{
              raw: asset.source()
            }]
          });

          if (typeof options.whitelist === 'function') {
            options.whitelist = options.whitelist();
          }

          if (typeof options.whitelistPatterns === 'function') {
            options.whitelistPatterns = options.whitelistPatterns();
          }

          if (typeof options.whitelistPatternsChildren === 'function') {
            options.whitelistPatternsChildren = options.whitelistPatternsChildren();
          }

          var purgecss = new Purgecss(options);
          var purged = purgecss.purge()[0];

          if (purged.rejected) {
            purgedStats[name] = purged.rejected;
          }

          compilation.assets[name] = new ConcatSource(purged.css);
        });
      });
      callback();
    }
  }]);

  return PurgecssPlugin;
}();

export default PurgecssPlugin;
