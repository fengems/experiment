// 引入 pack 文件
const pack = require('./static/js/lib/pack')
// 引入配置文件
const config = require('./pack.config')
// console.log('config', config)

const __main = () => {
    // 获取 a.js 的绝对路径
    // / \\
    // let entry = require.resolve('./static/js/a')
    let entry = require.resolve(config.entry)
    console.log('entry', entry)
    pack(entry, config)
    console.log('end')
}

if (require.main === module) {
    __main()
}
