const path = require('path');

module.exports = {
    mode: 'development',
    target: 'node', // Node.js環境用
    entry: './src-modules/test-export-helper.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'test-exports-real.js',
        library: {
            type: 'commonjs2'
        },
        environment: {
            module: false
        }
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.test.json'
                    }
                },
                exclude: /node_modules/
            }
        ]
    },
    externals: {
        // DOM関連のモジュールは外部化（jestが提供）
        'jsdom': 'jsdom'
    }
};