const log = console.log.bind(console)

const ensure = function(condition, message) {
    if (!condition) {
        log('测试失败', message)
    } else {
        log('测试成功')
    }
}

const isArray = function(o) {
    return Array.isArray(o)
}

const isObject = function(o) {
    return Object.prototype.toString.call(o) === '[object Object]'
}

const arrayDeepEquals = function(a, b) {
    if (a.length !== b.length) {
        return false
    }
    let r = a.every((aItem, index) => {
        let bItem = b[index]
        if (isArray(aItem) && isArray(bItem)) {
            return arrayDeepEquals(aItem, bItem)
        } else if (isObject(aItem) && isObject(bItem)) {
            return objectDeepEquals(aItem, bItem)
        } else {
            return aItem === bItem
        }
    })
    return r
}

const objectDeepEquals = function(a, b) {
    let aKeys = Object.keys(a)
    let bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) {
        return false
    }
    let r = aKeys.every((aKey, index) => {
        let bKey = bKeys[index]
        let aValue = a[aKey]
        let bValue = b[bKey]
        if (isObject(aValue) && isObject(bValue)) {
            return objectDeepEquals(aValue, bValue)
        } else if (isArray(aValue) && isArray(bValue)) {
            return arrayDeepEquals(aValue, bValue)
        } else {
            return aValue === bValue
        }
    })
    return r
}

const equals = function(a, b) {
    // 1. 如果 a 和 b 都是数组, 就参考 arrayDeepEquals 的方式来判断
    // 1.1 如果 a.length 与 b.length 不相等, 返回 false
    // 1.2 遍历数组 a, 用 equals 判断两个数组遍历出来的元素
    // 1.3 如果判断出来的结果不相等, 返回 false
    // 1.4 如果数组遍历结束都没有返回 false, 那么直接返回 true
    // 2. 如果 a 和 b 都是对象, 就参考 objectDeepEquals 的方式来判断
    // 2.1 如果对象 a 与 对象 b 的 key 长度不一样, 返回 false
    // 2.2 遍历对象 a, 用 equals 判断两个对象遍历出来的值
    // 2.3 如果判断出来的结果不相等, 返回 false
    // 2.4 如果对象遍历结束都没有返回 false, 那么直接返回 true
    // 3. 否则, 直接判断 a 与 b 是否相等
    if (isArray(a) && isArray(b)) {
        return arrayDeepEquals(a, b)
    } else if (isObject(a) && isObject(b)) {
        return objectDeepEquals(a, b)
    } else {
        return a === b
    }
}

const arrayDeepClone = function(array) {
    // 新建一个空数组 l
    // 遍历 array 得到元素
    // 如果元素是数组, 递归调用 arrayDeepClone 函数并把元素作为参数, 将得到的返回值添加到 l 中
    // 如果元素不是空数组, 直接把元素添加到 l 中
    let l = array.map(item => {
        if (isArray(item)) {
            return arrayDeepClone(item)
        } else if (isObject(item)) {
            return objectDeepClone(item)
        } else {
            return item
        }
    })
    return l
}

const objectDeepClone = function(object) {
    // 新建一个空对象 o
    // 遍历 object 得到 key 和 value
    // 如果 value 是对象, 递归调用 objectDeepClone 函数并把 value 作为参数, 将得到的返回值添加到 o 中, 作为 key 对应的 value
    // 如果 value 不是对象, 直接把 value 作为 key 的值
    let o = {}
    Object.entries(object).forEach(([k, v]) => {
        // log('k', k, 'v', v)
        if (isObject(v)) {
            o[k] = objectDeepClone(v)
        } else if (isArray(v)) {
            o[k] = arrayDeepClone(v)
        } else {
            o[k] = v
        }
    })
    return o
}

const deepClone = function(value) {
    // 首先判断 value 是数组还是字典还是其他普通类型
    // 如果 value 是对象, 新建空对象 o
    // 遍历 value 得到 k 和 v
    // 递归调用 deepClone 函数并把 v 作为参数, 将得到的返回值添加到 o 中, 作为 k 对应的 value
    // 遍历结束后返回 o
    // 如果 value 是数组, 新建空数组 l
    // 遍历 value 得到元素
    // 递归调用 deepClone 函数并把元素作为参数, 将得到的返回值添加到 l 中
    // 遍历结束后返回 l
    // 如果 value 是其他类型, 直接返回 value

    if (isObject(value)) {
        return objectDeepClone(value)
    } else if (isArray(value)) {
        return arrayDeepClone(value)
    } else {
        return value
    }
}

const testDeepClone = function() {
    let a1 = [[1]]
    let b1 = deepClone(a1)
    a1[0].push(200)
    ensure(equals(a1, [[1, 200]]) && equals(b1, [[1]]), 'test deep clone 1')

    let a2 = {
        x: 1,
        y: {},
    }
    let b2 = deepClone(a2)
    b2.y.z = 200
    ensure(equals(a2.y, {}) && b2.y.z === 200, 'test deep clone 2')

    let a3 = [
        {
            x: 1,
            y: 2,
        },
    ]
    let b3 = deepClone(a3)
    a3[0].y = [2]
    ensure(equals(a3[0].y, [2]) && equals(b3[0].y, 2), 'test deep clone 3')

    let a4 = {
        x: 1,
        y: [2],
    }
    let b4 = deepClone(a4)
    b4.y.push(200)
    ensure(equals(a4.y, [2]) && equals(b4.y, [2, 200]), 'test deep clone 4')

    let a5 = 100
    let b5 = deepClone(a5)
    ensure(b5 === 100, 'test deep clone 5')
}

const __main = function() {
    testDeepClone()
}

__main()
