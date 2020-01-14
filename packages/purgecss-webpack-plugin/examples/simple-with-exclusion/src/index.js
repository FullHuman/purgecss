import _ from 'lodash'
import './style_that_we_want_to_purge.css'

function component() {
  var element = document.createElement('div')

  // Lodash, currently included via a script, is required for this line to work
  // Lodash, now imported by this script
  element.innerHTML = _.join(['Hello', 'webpack'], ' ')
  element.classList.add('hello')
  element.classList.add('whitelisted')
  element.classList.add('md:w-2/3')
  return element
}

document.body.appendChild(component())
