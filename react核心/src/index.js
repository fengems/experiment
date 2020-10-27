// const React = require('./lib/react')
// const ReactDOM = require('./lib/react-dom')
import { React } from './lib/react'
import ReactDOM from "./lib/react-dom"
import App from './App'

const log = console.log.bind(console)

const __main = () => {
    let root = document.getElementById('root')
    ReactDOM.render(<App />, root)

    // <App /> 实际上就是下面的 r, 也就是会转成
    // React.createElement(App, null)
    // let r = React.createElement(App, null)
    // r 是一个对象
    // let o = {
    //     type: App,
    //     props: {
    //         children: []
    //     }
    // }
    // ReactDOM.render(r, root)
}

__main()