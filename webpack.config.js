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
};