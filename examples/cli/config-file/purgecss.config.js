module.exports = {
  content: ['index.html'],
  css: ['css/tailwind.css', 'css/app.css'],
  extractors: [
    {
      extractor: class {
        static extract(content) {
          return content.match(/[A-z0-9-:\/]+/g) || []
        }
      },
      extensions: ['html', 'js']
    }
  ]
}
