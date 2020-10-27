const path = require('path')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'a.js',
        path: path.resolve(__dirname, 'build')
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                ]
            }
        ]
    },
    watch: true,
}