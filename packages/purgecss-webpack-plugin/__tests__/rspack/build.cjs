/**
 * Build the CSS-modules fixture with Rspack, in its own process: @rspack/core
 * is an ES module, which Jest only loads on Node.js 24.9 and above.
 *
 * Usage: node build.cjs '<JSON array of builds>'
 * Each build: { name, css, mode, devtool, plugin }
 * - css: "extract" for CssExtractRspackPlugin, "native" for `css/auto` with
 *   readable class names and code, "native-defaults" for `css/auto` with the
 *   default options of Rspack (minimized, named exports, hashed class names)
 * - plugin: true for the TypeScript source of the plugin, "lib" for its built
 *   bundle, false for no plugin
 *
 * `webpack` cannot be resolved: the plugin must only use what Rspack provides.
 */
const Module = require("module");
const path = require("path");

const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request === "webpack" || request.startsWith("webpack/")) {
    const error = new Error(`Cannot find module '${request}'`);
    error.code = "MODULE_NOT_FOUND";
    throw error;
  }
  return resolveFilename.call(this, request, ...args);
};

require("ts-node").register({
  transpileOnly: true,
  project: path.resolve(__dirname, "..", "..", "tsconfig.json"),
  compilerOptions: { module: "commonjs" },
});

const { rspack } = require("@rspack/core");
const fixture = require("../css-modules/webpack.config.js");

function getPlugins(plugin, paths) {
  if (!plugin) return [];
  const { PurgeCSSPlugin } = require(
    plugin === "lib" ? "../../lib/purgecss-webpack-plugin.js" : "../../src",
  );
  return [new PurgeCSSPlugin({ paths })];
}

function getConfig({ name, css, mode, devtool, plugin }) {
  // the default options of Rspack generate named exports only
  const namespace = css === "native-defaults";
  const config = {
    mode,
    devtool,
    context: fixture.context,
    entry: namespace ? fixture.namespaceEntry : fixture.entry,
    output: {
      path: path.resolve(__dirname, "..", "js", `rspack-${name}`),
      clean: true,
    },
    // keep the CSS readable, PurgeCSS runs before the minimizers anyway
    optimization: { minimize: false },
    plugins: getPlugins(
      plugin,
      namespace ? fixture.namespaceContentPaths : fixture.contentPaths,
    ),
  };
  if (css === "native-defaults") {
    delete config.optimization;
    config.module = { rules: [{ test: /\.css$/, type: "css/auto" }] };
  } else if (css === "extract") {
    config.module = {
      rules: fixture.cssRules(rspack.CssExtractRspackPlugin.loader, {
        type: "javascript/auto",
      }),
    };
    config.plugins.unshift(new rspack.CssExtractRspackPlugin());
  } else {
    config.module = {
      rules: [{ test: /\.css$/, type: "css/auto" }],
      parser: { "css/auto": { namedExports: false } },
      generator: { "css/auto": { localIdentName: "[local]__[hash]" } },
    };
  }
  return config;
}

function build(config) {
  return new Promise((resolve, reject) => {
    rspack(config, (err, stats) => {
      if (err) reject(err);
      else if (stats.hasErrors()) reject(new Error(stats.toString()));
      else resolve();
    });
  });
}

(async () => {
  for (const options of JSON.parse(process.argv[2])) {
    await build(getConfig(options));
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
