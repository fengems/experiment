// const React = require('./lib/react')
// const { Component } = require('./lib/react')
import { React } from './lib/react'

const log = console.log.bind(console)

// App 是继承自 Component 的一个类
class App extends React.Component {
    constructor(props) {
        super(props)
        this.onIncrement = this.onIncrement.bind(this)
        this.state = {
            count: 0,
        }
    }
    onIncrement() {
        // this.setState 调用的是父类 Component 的 setState 方法
        this.setState({
            count: this.state.count + 1,
        })
    }
    onDecrement() {
        this.setState({
            count: this.state.count - 1,
        })
    }
    render(props, state) {
        // 重新进入 render 的时候, this.state 的值已经发生变化
        return (
            <div>
                <button onClick={this.onIncrement}>+</button>
                <button onClick={ () => { this.onDecrement() }}>-</button>
                <p>
                    count: { this.state.count }
                </p>
            </div>
        )
    }
}

export default App
