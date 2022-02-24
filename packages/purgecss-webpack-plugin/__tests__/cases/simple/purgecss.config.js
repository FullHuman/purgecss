const path = require("path");
const glob = require("glob");

const customExtractor = (content) => {
  const res = content.match(/[A-z0-9-:/]+/g) || [];
  return res;
};

const PATHS = {
  src: path.join(__dirname, "src"),
};

module.exports = {
  paths: glob.sync(`${PATHS.src}/*`),
  safelist: ["safelisted"],
  extractors: [
    {
      extractor: customExtractor,
      extensions: ["html", "js"],
    },
  ],
}