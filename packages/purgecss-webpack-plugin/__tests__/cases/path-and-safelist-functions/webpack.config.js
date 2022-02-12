const path = require("path");
const glob = require("glob");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {PurgeCSSPlugin} = require("../../../src/");

const customExtractor = (content) => content.match(/[A-z0-9-:/]+/g) || [];

const PATHS = {
  src: path.join(__dirname, "src"),
};

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  context: path.resolve(__dirname),
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
      paths: () => glob.sync(`${PATHS.src}/*`),
      safelist: () => {
        return {
          standard: ["safelisted", /^safelistedPat/],
          deep: [/^safelistedPatternChildren/],
          greedy: [/^safelistedPatternGreedy/],
        };
      },
      extractors: [
        {
          extractor: customExtractor,
          extensions: ["html", "js"],
        },
      ],
    }),
  ],
};
