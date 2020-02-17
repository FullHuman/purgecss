module.exports = (api, options) => {
  api.extendPackage({
    devDependencies: {
      '@fullhuman/postcss-purgecss': '^2.1.0'
    }
  })
  api.render('./templates', options)
}