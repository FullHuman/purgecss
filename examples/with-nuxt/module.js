const Purgecss = require('purgecss')

const defaultOptions = {
  content: ['layouts/**/*.vue', 'pages/**/*.vue', 'components/**/*.vue'],
  whitelist: []
}

module.exports = function(moduleOptions = {}) {
  console.log(process.env)
  const options = Object.assign(defaultOptions, moduleOptions)
  console.log('this.options:::', this.options)
}