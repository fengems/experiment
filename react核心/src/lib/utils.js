const isObject = o => Object.prototype.toString.call(o) === '[object Object]'

// 如果 key 不是表示事件, 也不是表示 children 子元素, 说明是 attributes
const isAttributes = (key) => !key.startsWith('on') && key !== 'children'

module.exports = {
    isObject,
    isAttributes,
}