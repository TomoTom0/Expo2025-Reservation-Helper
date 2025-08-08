const path = require('path');
const webpack = require('webpack');

// UserScriptヘッダー
const userScriptHeader = `// ==UserScript==
// @name         yt-Expo2025-Reservation-Helper
// @namespace    http://staybrowser.com/
// @version      0.5.4
// @description  大阪万博2025予約支援ツール: パビリオン検索補助, 入場予約監視自動化, 同行者追加自動化
// @author       TomoTom0 https://github.com/TomoTom0
// @match        https://ticket.expo2025.or.jp/*
// @grant       none
// @run-at       document-end
// ==/UserScript==

`;

module.exports = {
  entry: './src-modules/main.ts', // TypeScript完全移行完了
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
    extensions: ['.ts', '.js'] // TypeScript優先で解決
  },
  target: 'web', // ブラウザ環境
  devtool: false, // ソースマップ無効化
  plugins: [
    new webpack.BannerPlugin({
      banner: userScriptHeader,
      raw: true, // コメント形式として扱わない
      entryOnly: true
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
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
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader', // JSに埋め込んでDOMに注入
          'css-loader',   // CSSをJSモジュールとして読み込み
          'sass-loader',  // SCSSをCSSにコンパイル
        ],
      }
    ]
  }
};