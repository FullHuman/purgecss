const path = require("path");
const glob = require("fast-glob");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { PurgeCSSPlugin } = require("../../../src/");

const PATHS = {
  src: path.join(__dirname, "src"),
};

// `only: ["style"]` must purge the `style` chunk only, not every asset whose
// name contains "style" (https://github.com/FullHuman/purgecss/issues/881)
module.exports = {
  mode: "development",
  devtool: false,
  entry: {
    style: "./src/style.js",
    style_hello_world: "./src/style_hello_world.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${PATHS.src}/*`),
      only: ["style"],
    }),
  ],
};
