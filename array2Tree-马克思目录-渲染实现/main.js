const log = console.log.bind(console)

const e = (selector) => {
    return document.querySelector(selector)
}

const bindEvent = (element, eventName, callback) => {
    element.addEventListener(eventName, callback)
}

const toTree = (pid = '0') => {
    let list = data.result
    return list.filter(item => {
        return item.pid === pid
    }).map(item => {
        let d = {
            children: [],
            id: item.id,
            text: item.title,
            layer: item.layer,
        }
        if (!item.finalFlag) {
            d.children = toTree(item.id)
        }
        return d
    })
}

// 递归得到数组的 html 字符串
const getListHtml = (list) => {
    let htmlList = list.map(item => {
        let text = item.text
        let cHtml = getListHtml(item.children)
        return `<div class="box">
            <div>
                <input type="checkbox" class="box-check">
                <span class="box-title">${text}</span>
            </div>
            <div class="box-children hide">${cHtml}</div>
        </div>`
    })
    return htmlList.join('')
}

// 画列表
const drawList = (list) => {
    // 递归生成 html 字符串
    let html = getListHtml(list)
    e('#id-div-app').insertAdjacentHTML('beforeend', html)
}

// 绑定事件
// 切换子列表的显示, 打开的时候只展示子集, 关闭的时候关闭所有子集
const toggleList = (children) => {
    // 如果本来是关闭的, 那么直接打开子集
    if (children.classList.contains('hide')) {
        children.classList.remove('hide')
    } else {
        // 如果原来是打开的, 需要关闭所有子集
        children.classList.add('hide')
        let childrenList = children.querySelectorAll('.box-children')
        childrenList.forEach(item => {
            if (!item.classList.contains('hide')) {
                item.classList.add('hide')
            }
        })
    }
}

// 绑定列表的点击事件
const bindClickList = (app) => {
    bindEvent(app, 'click', (e) => {
        // log('event', e)
        let target = e.target
        let cs = target.classList
        // log('cs', cs)
        if (cs.contains('box-title')) {
            let p = target.closest('.box')
            // log('p', p)
            let child = p.querySelector('.box-children')
            toggleList(child)
        }
    })
}

// 将子元素都改为相同的 checked 状态
const checkChildren = (box, checked) => {
    let checkList = box.querySelectorAll('.box-check')
    checkList.forEach(item => {
        item.checked = checked
    })
}

// 递归父元素, 这里用第二种
const checkParent = (box, checked) => {
    // 查找兄弟元素
    /**
     * 1. 判断情况再修改父元素, 如果父元素不用改, 那么就不操作
     * 如果如果当前元素是 true, 兄弟元素都是 true, 需要修改父元素为 true
     * 如果如果当前元素是 true, 兄弟元素不全是 true, 不修改父元素
     * 如果如果当前元素是 false, 兄弟元素都是 true, 需要修改父元素为 false
     * 如果如果当前元素是 false, 兄弟元素不都是 true, 不修改父元素
     */
    /**
     * 2. 直接根据条件修改父元素
     * 如果当前元素和兄弟元素都是 true, 父元素改为 true
     * 如果当前元素和兄弟元素有不为 true, 父元素改为 false
     */

    // 找到兄弟元素并判断
    let brotherList = box.parentElement.children
    // log('brotherList', brotherList, Array.from(brotherList))
    let pChecked = Array.from(brotherList).every(element => {
        let check = element.querySelector('.box-check')
        return check.checked
    })
    // 如果不是最外层, 那么需要找到父元素来修改状态, 并继续递归
    // 如果已经是最外层, 那么不操作
    if (box.parentElement.classList.contains('box-children')) {
        let pBox = box.parentElement.parentElement
        let check = pBox.querySelector('.box-check')
        check.checked = pChecked
        // 递归查父元素
        checkParent(pBox, pChecked)
    }
}

// 点击 checkbox 的操作
const bindClickCheck = (app) => {
    bindEvent(app, 'click', (e) => {
        let target = e.target
        let cs = target.classList
        if (cs.contains('box-check')) {
            // log('checked', target.checked)
            let checked = target.checked
            let box = target.closest('.box')
            checkChildren(box, checked)
            checkParent(box, checked)
        }
    })
}

const bindEvents = () => {
    let app = e('#id-div-app')
    bindClickList(app)
    bindClickCheck(app)
}

const __main = () => {
    let list = toTree()
    drawList(list)
    bindEvents()
}

__main()
