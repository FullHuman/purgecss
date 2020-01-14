import './style.scss'

function component() {
  var element = document.createElement('div')

  element.classList.add('hello')
  return element
}

document.body.appendChild(component())
