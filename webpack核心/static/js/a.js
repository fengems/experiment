import log from './helper/log'
import e from './helper/feng'
// const es = require('./helper/gua')

const bindEventLogin = () => {
    let button = e('#id-button-login')
    let box = e('.box')

    button.addEventListener('click', (event) => {
        box.classList.add('pink')
    })
}

const bindEvents = () => {
    bindEventLogin()
}

const __main = () => {
    bindEvents()
}

__main()
