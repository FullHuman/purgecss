// all PurgeCSS packages are released together with the same version
const { version } = require("../package.json");

module.exports = (api, options) => {
  api.extendPackage({
    devDependencies: {
      "@fullhuman/postcss-purgecss": `^${version}`,
    },
  });
  api.render("./templates", options);
};
