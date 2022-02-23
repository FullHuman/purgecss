const path = require("path");
const glob = require("glob");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { PurgeCSSPlugin } = require("../../../src/");

const customExtractor = (content) => {
  const res = content.match(/[A-z0-9-:/]+/g) || [];
  return res;
};

const PATHS = {
  src: path.join(__dirname, "src"),
};

module.exports = {
  mode: "development",
  devtool: "source-map",
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          type: "css/mini-extract",
          test: /\.css$/,
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
  entry: "./src/index.js",
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
      safelist: ["safelisted"],
      extractors: [
        {
          extractor: customExtractor,
          extensions: ["html", "js"],
        },
      ],
    }),
  ],
};
