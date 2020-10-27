const { isAttributes } = require('./utils')
import { Component } from './react'

const log = console.log.bind(console)

// 判断 o 的原型是不是 Component 的实例
// 也就是判断 o 是不是继承自 Component

const isClass = (o) => o.prototype instanceof Component

const ReactDOM = {
    render: (vdom, container) => {
        log('vdom', vdom, container)
        // 相当于 vdom 和 element 是全局变量
        // 他们的值一直是最初的值
        if (window.vdom === undefined) {
            window.vdom = vdom
        }
        if (window.element === undefined) {
            window.element = container
        }
        // type 此时是 App, 也就是一个类
        let { type, props } = vdom
        let element = null
        // 如果 type 是 TEXT, 说明是文本节点
        if (type === 'TEXT') {
            element = document.createTextNode('')
        } else if (isClass(type)) {
            // 此时 type 是一个类, 也就是继承自 Component 的类组件
            let cls = type
            if (cls.instance === undefined) {
                cls.instance = new cls(props)
            }
            // cls.instance 相当于 this
            let state = cls.instance.state || {}
            log('state in cls', state)
            // let r = cls.instance.render(props, state)
            let r = cls.instance.render(props, state)
            element = ReactDOM.render(r, container)
        } else {
            element = document.createElement(type)
        }

        // 有些元素上绑定了事件, 需要手动绑定
        Object.keys(props).filter(e => e.startsWith('on'))
            .forEach(k => {
                // 先拿到事件名称
                let eventType = k.toLowerCase().slice(2)
                // 再绑定事件
                element.addEventListener(eventType, props[k])
            })

        // 再处理其他 props
        // 在元素上面增加 attribute
        Object.keys(props).filter(e => isAttributes(e))
            .forEach(k => {
                element[k] = props[k]
            })

        let children = props.children || []
        // 递归处理 children
        children.forEach(c => ReactDOM.render(c, element))

        // 把元素插入到页面中
        container.appendChild(element)
        return element
    }
}

export default ReactDOM
