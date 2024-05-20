// webpack.config.js
const slsw = require('serverless-webpack');

module.exports = {
    entry: './index.js',
    target: 'node',
    entry: slsw.lib.entries,
    mode: slsw.lib.webpack.isLocal ? "development" : "production",
};