const path = require("path");
const glob = require("glob");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PurgecssPlugin = require("../../../src/").default;

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
    new PurgecssPlugin({
      paths: () => glob.sync(`${PATHS.src}/*`),
      safelist: () => {
        return {
          standard: ["whitelisted", /^whitelistedPat/],
          deep: [/^whitelistedPatternChildren/],
          greedy: [/^whitelistedPatternGreedy/],
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
