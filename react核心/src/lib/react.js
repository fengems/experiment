const { isObject } = require('./utils')
import ReactDOM from './react-dom'

const log = console.log.bind(console)

const createTextElement = (text) => {
    // 一般来说, 元素的 tagName 是全大写的形式
    let type = 'TEXT'
    let props = {
        nodeValue: text,
    }
    let c = createElement(type, props)
    return c
}

const createElement = (type, props, ...children) => {
    let newProps = Object.assign({}, props)

    // children 的值 [this.state.count]
    // 第一次 <App />
    log('children', type, children)

    // 为了方便运算, 把 children 也放到 props 里面
    if (children.length === 0) {
        newProps.children = []
    } else {
        let l = children.map(c => {
            if (isObject(c)) {
                // 说明是一个元素节点
                return c
            } else {
                // 说明是一个文本节点
                let r = createTextElement(c)
                return r
            }
        })
        newProps.children = l
    }

    return {
        type: type,
        props: newProps,
    }
}

const render = (vdom, element) => {
    // 确保 element 没有子元素, 只剩下自身
    while (element.hasChildNodes()) {
        element.removeChild(element.lastChild)
    }
    ReactDOM.render(vdom, element)
}

class Component {
    constructor(props) {
        this.props = props
    }
    setState(partialState) {
        this.state = Object.assign({}, this.state, partialState)
        log('state in setstate', this.state)
        render(window.vdom, window.element)
    }
}

let React = {
    createElement,
    Component,
}

export {
    React,
    Component,
}
