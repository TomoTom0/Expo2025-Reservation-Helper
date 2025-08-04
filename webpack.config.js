const path = require('path');

module.exports = {
  entry: './src-modules/main.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'src'),
    // UserScript形式のためIIFE包装
    library: {
      type: 'umd',
      name: 'YtomoExtension'
    },
    globalObject: 'this'
  },
  mode: 'development', // 開発モード（可読性維持）
  optimization: {
    minimize: false, // UserScriptの可読性維持のため無効化
  },
  resolve: {
    extensions: ['.js']
  },
  target: 'web', // ブラウザ環境
  devtool: false, // ソースマップ無効化
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['> 1%', 'last 2 versions']
                },
                modules: false // ES modulesをそのまま保持
              }]
            ]
          }
        }
      }
    ]
  }
};