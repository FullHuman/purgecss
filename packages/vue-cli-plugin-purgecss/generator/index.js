module.exports = (api, options) => {
  api.extendPackage({
    devDependencies: {
      "@fullhuman/postcss-purgecss": "^3.0.0",
    },
  });
  api.render("./templates", options);
};
