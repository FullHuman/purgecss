import './style_that_we_want_to_purge.css'

function component() {
    var element = document.createElement('div')

    element.classList.add('hello')
    element.classList.add('md:w-2/3')
    return element
}

document.body.appendChild(component())
