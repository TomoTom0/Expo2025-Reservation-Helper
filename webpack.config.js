const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const { VueLoaderPlugin } = require('vue-loader');

// version.datからバージョン番号を読み取り
const getVersionFromFile = () => {
  try {
    const versionPath = path.resolve(__dirname, 'version.dat');
    return fs.readFileSync(versionPath, 'utf8').trim();
  } catch (error) {
    console.warn('version.datの読み取りに失敗しました。デフォルトバージョンを使用します:', error.message);
    return '0.5.4'; // フォールバック
  }
};

// UserScriptヘッダー（ビルド時に動的生成）
const generateUserScriptHeader = () => {
  const version = getVersionFromFile();
  const buildTime = new Date().toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return `// ==UserScript==
// @name         yt-Expo2025-Reservation-Helper
// @namespace    http://staybrowser.com/
// @version      ${version}
// @description  大阪万博2025予約支援ツール: パビリオン検索・予約・監視・同行者管理・入場予約の自動化
// @author       TomoTom0 https://github.com/TomoTom0
// @match        https://ticket.expo2025.or.jp/*
// @run-at       document-end
// ==/UserScript==

// Built: ${buildTime}

`;
};

module.exports = {
  entry: './ts/modules/main.ts', // TypeScript完全移行完了
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
    splitChunks: false, // UserScript制約: chunk分割無効化
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue'], // Vue SFC対応
    alias: {
      '@': path.resolve(__dirname, 'ts'), // エイリアス設定
      'vue': 'vue/dist/vue.esm-bundler.js' // Vue runtime選択
    }
  },
  target: 'web', // ブラウザ環境
  devtool: false, // ソースマップ無効化
  plugins: [
    new webpack.BannerPlugin({
      banner: generateUserScriptHeader(),
      raw: true, // コメント形式として扱わない
      entryOnly: true
    }),
    new VueLoaderPlugin() // Vue Loader Plugin追加
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/], // .vueファイル内のTS処理
          }
        }
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
        test: /\.css$/,
        use: [
          'style-loader', // JSに埋め込んでDOMに注入
          'css-loader'    // CSSをJSモジュールとして読み込み
        ]
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