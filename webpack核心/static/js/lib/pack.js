const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAstSync } = require('@babel/core')

const { log, gidGenerator, resolvePath } = require('./utils')

// let gid = 1

const astForCode = (code) => {
    let ast = parser.parse(code, {
        sourceType: 'module',
    })
    return ast
}

const codeForAst = (ast, sourceCode) => {
    let r = transformFromAstSync(ast, sourceCode, {
        // 转成 es5 代码的时候需要配置 presets
        presets: ['@babel/preset-env'],
    })
    return r.code
}

const moduleTemplate = (graph, mapping) => {
    // 下面这个对象是 graph[绝对路径]
    // {
    //     id: 3,
    //         dependencies: {},
    //     code: '"use strict";\n' +
    //     '\n' +
    //     'var e = function e(selector) {\n' +
    //     '  return document.querySelector(selector);\n' +
    //     '};\n' +
    //     '\n' +
    //     'module.exports = e;',
    //         content: 'const e = selector => document.querySelector(selector)\n' +
    // '\n' +
    // 'module.exports = e'
    // }
    let g = graph
    let m = JSON.stringify(mapping)
    let s = `
        ${g.id}: [
            function(require, module, exports) {
                ${g.code}
            },
            ${m}
        ],
    `
    return s
}

// 拿到依赖图之后, 还需要处理成模块的形式才能直接运行
const moduleFromGraph = (graph) => {
    let modules = ''
    Object.values(graph).forEach(g => {
        // 参数 g 是 module, 也就是下面的形成
        // {
        //     id: id,
        //     dependencies: ds,
        //     code: es5Code,
        //     content: s,
        // }

        let ds = g.dependencies

        let o = {}
        Object.entries(ds).forEach(([k, v]) => {
            o[k] = graph[v].id
        })

        // log('graph o is', g)

        // module 几乎是一样的, 用一个模板函数来生成
        modules += moduleTemplate(g, o)
    })
    return modules
}

// 最后生成的 bundle 文件
const bundleTemplate = (module) => {
    let s = `
        (function(modules) {
            const require = (id) => {
                let [fn, mapping] = modules[id]

                const localRequire = (name) => {
                    return require(mapping[name])
                }

                const localModule = {
                    exports: {

                    }
                }

                fn(localRequire, localModule, localModule.exports)

                return localModule.exports
            }

            require(1)
        })({${module}})
    `
    return s
}

const saveBundle = (bundle, file) => {
    fs.writeFileSync(file, bundle)
}

// entry 作为起点, 先收集相关依赖
const collectedDeps = (entry) => {
    let s = fs.readFileSync(entry, 'utf8')
    let ast = astForCode(s)

    let l = []
    traverse(ast, {
        // ImportDeclaration 是指遇到 import a from b 类型语句的时候, 进入这个函数
        ImportDeclaration(path) {
            // 这个时候的 module 就是 from 后面的值, 是一个相对路径
            let module = path.node.source.value
            l.push(module)
        }
    })
    // log('l is', l)
    let o = {}
    l.forEach(e => {
        // 一个模块里面可以 import 其他模块, 子模块里面也可以引入更多模块
        // 所以需要遍历处理每一个 from 后面的模块
        // 而这些模块本身是一个相对路径, 不能读出代码, 所以要先处理成绝对路径

        // 先根据 entry 拿到 entry 所做的目录
        // 拿到目录之后根据相对路径可以计算出绝对路径
        let directory = path.dirname(entry)
        let p = resolvePath(directory, e)

        // 转码之后的代码还需要相对路径
        // 所以要把相对路径和绝对路径都返回
        o[e] = p
    })
    // log('o is', o)
    return o
}

const parsedEntry = (entry) => {
    let o = {}
    // 用 id 来标记每一个模块, 用 gidGenerator 来生成全局变量 id
    // let id = gid++
    let id = gidGenerator()
    let ds = collectedDeps(entry)

    let s = fs.readFileSync(entry, 'utf8')
    let ast = astForCode(s)

    // 因为浏览器并不能直接处理 es6 的代码, 所以转成 es5 代码
    let es5Code = codeForAst(ast, s)

    o[entry] = {
        id: id,
        dependencies: ds,
        code: es5Code,
        content: s,
    }

    Object.values(ds).forEach(d => {
        // 依赖是一个树状图的关系, 遍历收集并且解析依赖
        let r = parsedEntry(d)
        // 把返回值与初始值合并
        Object.assign(o, r)
    })

    // log('entry o', o)
    return o
}

const bundle = (entry, config) => {
    let graph = parsedEntry(entry)
    log('graph', graph)
    let module = moduleFromGraph(graph)
    let bundle = bundleTemplate(module)
    // let file = 'dist/bundle.js'
    let file = path.join(config.output.directory, config.output.filename)
    // log('file', file)
    saveBundle(bundle, file)
}

module.exports = bundle
