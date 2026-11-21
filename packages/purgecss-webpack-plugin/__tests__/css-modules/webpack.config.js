const path = require("path");

const localIdentName = "[local]__[hash:base64:5]";

/**
 * Rules for the CSS of the fixture, with mini-css-extract-plugin or
 * CssExtractRspackPlugin: `card.module.css` is imported with a default
 * import, `named.module.css` with named exports
 *
 * @param extractLoader - loader of the CSS extract plugin
 * @param extra - other options of the rules, e.g. `type` for Rspack
 */
function cssRules(extractLoader, extra = {}) {
  return [
    {
      test: /named\.module\.css$/,
      use: [
        extractLoader,
        {
          loader: "css-loader",
          options: { modules: { namedExport: true, localIdentName } },
        },
      ],
      ...extra,
    },
    {
      test: /\.css$/,
      exclude: /named\.module\.css$/,
      use: [
        extractLoader,
        {
          loader: "css-loader",
          options: {
            modules: {
              auto: true,
              namedExport: false,
              exportLocalsConvention: "as-is",
              localIdentName,
            },
          },
        },
      ],
      ...extra,
    },
  ];
}

module.exports = {
  context: __dirname,
  entry: "./src/index.js",
  contentPaths: [path.join(__dirname, "src", "index.js")],
  // namespace imports, for native CSS with named exports
  namespaceEntry: "./src/index-namespace.js",
  namespaceContentPaths: [path.join(__dirname, "src", "index-namespace.js")],
  cssRules,
};
