const path = require('path');
module.exports = {
    target: 'node',
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: 'file-differ.js',
        path: path.resolve(__dirname, 'dist'),
    },
};