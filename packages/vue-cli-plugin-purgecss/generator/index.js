module.exports = (api, options) => {
  api.extendPackage({
    devDependencies: {
      "@fullhuman/postcss-purgecss": "^4.0.0",
    },
  });
  api.render("./templates", options);
};
