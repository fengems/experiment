const log = console.log.bind(console)

const ensure = (condition, message) => {
    // 在条件不成立的时候, 输出 message
    if (!condition) {
        log('*** 测试失败:', message)
    } else {
        log('+++ 测试成功')
    }
}

const arrayEquals = function(a1, a2) {
    if (a1.length !== a2.length) {
        return false
    }
    for (let i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) {
            return false
        }
    }
    return true
}

const objectEquals = (a1, a2) => {
    // 抽出一些条件封装成函数
    let checkResults = equalConditions(a1, a2)
    if (checkResults !== undefined) {
        return checkResults
    }
    // 遍历看看另一个对象是否有这个属性
    for (let item in a1) {
        // 如果 a2 没有 a1 的这个属性, 那么就为假
        if (!a2.hasOwnProperty(item)) {
            return false
        } else if (!objectEquals(a1[item], a2[item])) {
            // 递归判断是否相等, 排除该项是对象的情况
            return false
        }
    }
    // 通过了所有判断条件的为真
    return true
}

const parseNumber = (string, index) => {
    let i = index
    let s = string.slice(i)
    let digits = '1234567890'
    let dot = '.'
    let end = 0
    // 这里从 1 开始循环, 可以跳过 '-' 符号
    for (let j = 1; j < s.length; j++) {
        let char = s[j]
        if (!digits.includes(char) && char !== dot) {
            end = j
            break
        }
    }
    let n = string.slice(i, i + end)
    return [Number(n), end]
}

const parseEscape = s => {
    let map = {
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t',
        '\\': '\\',
        '/': `\/`,
        '"': `\"`,
    }

    let i = 0
    let r = ''
    while (i < s.length) {
        let c = s[i]
        let next = s[i + 1]
        if (c === '\\' && map[next]) {
            r += map[next]
            i += 2
        } else {
            r += c
            i += 1
        }
    }
    return r
}

const parseString = (string, index) => {
    let i = index
    // 我们希望和从 " 的下一位开始切片
    // 比如 "name" 切完之后的结果应该是 name"
    let s = string.slice(i + 1)
    let end = 0
    for (let j = 0; j < s.length; j++) {
        let char = s[j]
        let left = s[j - 1]
        if (char === '"' && left !== '\\') {
            end = j
            break
        }
    }
    let r = string.slice(i + 1, i + 1 + end)
    let s1 = parseEscape(r)

    return [s1, end]
}

const parseKeyword = (string, index) => {
    let i = index
    let s = string.slice(i)
    let map = {
        f: [false, 5],
        t: [true, 4],
        n: [null, 4],
    }
    let c = s[0]
    return map[c]
}

// json 字符串解析为 tokens
const jsonTokens = s => {
    // 把 json 字符串解析成 tokens 数组的形式
    // 1. 遍历字符串, 根据不同情况 push 不同元素到数组中
    // 2. 如果遇到的是 ", 按照字符串来处理
    // 3. 如果遇到的是数字, 按照数值来处理
    // 4. 如果遇到 '{', '}', '[', ']', ':', ',' 这几个字符, 直接 push 到数组中
    // 5. 如果遇到空白字符, 如换行, 空格, 缩进等, 直接跳过

    // 1. 数字需要考虑负数和小数
    // 2. 字符串需要考虑转义字符
    // 3. 考虑嵌套数组和对象
    // 4. 需要加上布尔值和 null
    let i = 0
    let tokens = []
    let digits = '1234567890'
    // 假设 JSON 字符串开头字符一定为 '{' 或者 '['
    while (i < s.length) {
        let c = s[i]
        if ('{}[]:,'.includes(c)) {
            tokens.push(c)
        } else if (digits.includes(c) || c === '-') {
            let [n, end] = parseNumber(s, i)
            i += end - 1
            tokens.push(n)
        } else if (c === '"') {
            let [s1, end] = parseString(s, i)
            i += end + 1
            tokens.push(s1)
        } else if ('ftn'.includes(c)) {
            let [k, end] = parseKeyword(s, i)
            i += end - 1
            tokens.push(k)
        }
        i += 1
    }
    return tokens
}

const parsedList = (tokens, index) => {
    // 解析 tokens, 返回解析后的 JSON 值
    // 这里舍去第一项的 '['
    let ts = tokens.slice(index + 1)
    let r = []
    let i = 0
    let end = 0
    while (i < ts.length) {
        let t = ts[i]
        if (t === ']') {
            end = i
            break
        } else if (t === '{') {
            let [n, end] = parsedDict(ts, i)
            i += end
            r.push(n)
        } else if (t === '[') {
            let [n, end] = parsedList(ts, i)
            i += end
            r.push(n)
        } else if (t !== ',') {
            r.push(t)
        }
        i += 1
    }
    return [r, end]
}

const parseValue = (tokens, index) => {
    let ts = tokens
    let i = index
    let right = ts[i + 1]
    if (right === '[') {
        return parsedList(ts, i + 1)
    } else if (right === '{') {
        return parsedDict(ts, i + 1)
    }
    return [right, 0]
}

const parsedDict = (tokens, index) => {
    let ts = tokens.slice(index + 1)
    let r = {}
    let i = 0
    let end = 0
    while (i < ts.length) {
        let t = ts[i]
        if (t === '}') {
            end = i
            break
        } else if (t === ':') {
            let key = ts[i - 1]
            let [value, end] = parseValue(ts, i)
            r[key] = value
            i += end + 1
        }
        i += 1
    }
    return [r, end]
}

const parsedJson = tokens => {
    // tokens 是一个包含 JSON tokens 的数组
    // 解析 tokens, 返回解析后的 object 或者数组
    let item = tokens[0]
    let list = ''
    if (item === '{') {
        list = parsedDict(tokens, 0)
    } else if (item === '[') {
        list = parsedList(tokens, 0)
    }
    return list[0]
}

const parse = s => {
    // s 是一个 JSON 格式的字符串
    // 解析 s, 返回相应的 JSON 对象格式
    // 1. 数字需要考虑负数和小数
    // 2. 字符串需要考虑转义字符
    // 3. 考虑嵌套数组和对象
    // 4. 需要加上布尔值和 null
    let tokens = jsonTokens(s)
    // log('tokens', tokens)
    return parsedJson(tokens)
}

const testParse = () => {
    let s1 = String.raw`{
    "s1": "gua",
    "num1": 11,
    "num2": -20,
    "num3": 12.5
}`
    let r1 = parse(s1)
    ensure(r1.num2 === -20 && r1.num3 === 12.5, 'test parse 1')

    let s2 = String.raw`{
    "s1": "gua",
    "s2": "a\bb\fc\nd\re\tf\\g\/h\"i"
}`
    let r2 = parse(s2)
    ensure(r2.s2 === 'a\bb\fc\nd\re\tf\\g/h"i', 'test parse 2')

    let s3 = String.raw`{
    "arr1": [1, 2, 3],
    "obj": {
        "arr2": [4, 5, 6],
        "obj2": {
            "key1": [7, 10.3]
        }
    }
}`
    let r3 = parse(s3)
    ensure(
        r3.obj.arr2.length === 3 && r3.obj.obj2.key1.includes(10.3),
        'test parse 3'
    )

    let s4 = String.raw`{
    "boolean": true,
    "null": null
}`
    let r4 = parse(s4)
    ensure(r4.boolean && r4.null === null, 'test parse 4')
}

const __main = () => {
    testParse()
}

__main()
