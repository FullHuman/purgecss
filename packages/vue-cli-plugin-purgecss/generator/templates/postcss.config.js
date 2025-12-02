const IN_PRODUCTION = process.env.NODE_ENV === "production";

module.exports = {
  plugins: [
    IN_PRODUCTION &&
      require("@fullhuman/postcss-purgecss")({
        content: [`./public/**/*.html`, `./src/**/*.vue`],
        defaultExtractor(content) {
          let previous;
          let contentWithoutStyleBlocks = content;
          do {
            previous = contentWithoutStyleBlocks;
            contentWithoutStyleBlocks = contentWithoutStyleBlocks.replace(
              /<style[^]+?<\/style>/gi,
              ""
            );
          } while (contentWithoutStyleBlocks !== previous);
          return (
            contentWithoutStyleBlocks.match(
              /[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g
            ) || []
          );
        },
        safelist: [
          /-(leave|enter|appear)(|-(to|from|active))$/,
          /^(?!(|.*?:)cursor-move).+-move$/,
          /^router-link(|-exact)-active$/,
          /data-v-.*/,
        ],
      }),
  ],
};
