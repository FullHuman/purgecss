const path = require("path");
const glob = require("glob");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { PurgeCSSPlugin } = require("../../../src/");

const customExtractor = (content) => content.match(/[A-z0-9-:/]+/g) || [];

const PATHS = {
  src: path.join(__dirname, "src"),
};

module.exports = {
  mode: "development",
  devtool: false,
  entry: {
    bundle: "./src/index.js",
    legacy: "./src/legacy.js",
  },
  optimization: {
    splitChunks: { chunks: "all" },
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
      styleExtensions: [".css"],
      safelist: ["safelisted"],
      only: ["bundle"],
      extractors: [
        {
          extractor: customExtractor,
          extensions: ["html", "js"],
        },
      ],
    }),
  ],
};
