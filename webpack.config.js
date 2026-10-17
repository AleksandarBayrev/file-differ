const path = require('path');
module.exports = {
    target: 'node',
    mode: 'production',
    entry: './src/index.ts',
    output: {
        filename: 'file-differ.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
};