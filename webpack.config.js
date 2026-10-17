const path = require('path');
const webpack = require('webpack');

module.exports = {
    target: 'node',
    mode: 'production',
    entry: './src/index.ts',
    output: {
        filename: 'file-differ.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'swc-loader',
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'typescript'
                            }
                        }
                    }
                }
            }
        ]
    },
    optimization: {
        splitChunks: false,
        runtimeChunk: false
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    ]
};