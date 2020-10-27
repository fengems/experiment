const { transform } = require('@babel/core')

const log = console.log.bind(console)

const codeList = () => {
    let cs
    cs = [
        `<div></div>`,
        `<div id="test"></div>`,
        `<div id="test" class="div-test"></div>`,
        `<div id="test">gua</div>`,
        `
<div id="test">
    <span></span>
</div>    
`,
        `
<div id="test">
    <span>gua</span>
</div>    
`,
        `
<button id="id-button-login" onClick={() => log('Clicked')}>
    Like Button
</button>
`,
        '<App />',
        `
<button onClick={this.onIncrement}>+</button>
`,
        `
<div>
{
    this.state.count
}        
</div>
        `
    ]
    return cs
}

const demo = function() {
    let cs = codeList()
    for (let i = 0; i < cs.length; i++) {
        let c = cs[i]
        let r = transform(c, {
            plugins: [
                '@babel/transform-react-jsx',
            ]
        })
        log('\n*** code start ***')
        log(r.code)
        log('*** code end ***\n')
    }
}

const __main = () => {
    demo()
}

__main()
//
// *** code start ***
// React.createElement("div", null);
// *** code end ***
//
//
// *** code start ***
// React.createElement("div", {
//     id: "test"
// });
// *** code end ***
//
//
// *** code start ***
// React.createElement("div", {
//     id: "test",
//     class: "div-test"
// });
// *** code end ***
//
//
// *** code start ***
// React.createElement("div", {
//     id: "test"
// }, "gua");
// *** code end ***
//
//
// *** code start ***
// React.createElement("div", {
//     id: "test"
// }, React.createElement("span", null));
// *** code end ***
//
//
// *** code start ***
// React.createElement("div", {
//     id: "test"
// }, React.createElement("span", null, "gua"));
// *** code end ***
//
//
// *** code start ***
// React.createElement("button", {
//     id: "id-button-login",
//     onClick: () => log('Clicked')
// }, "Like Button");
// *** code end ***
//
//
// *** code start ***
// React.createElement(App, null);
// *** code end ***

// *** code start ***
// React.createElement("div", null, this.state.count);
// *** code end ***

let o = {
    type: 'button',
    props: {
        id: "id-button-login",
        onClick: () => log('Clicked'),
        children: [
            {
                type: 'TEXT',
                nodeValue: 'Like Button',
            },
        ]
    }
}
