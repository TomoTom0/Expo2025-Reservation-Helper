# スタイリングとレスポンシブデザイン

## 1. SCSS + クラス名/タグ名 階層構造

**SCSS**を採用し、クラス名やタグ名の階層構造で指定します。

### 1.1 webpack sass-loader設定

```javascript
// webpack.config.js
{
  test: /\.s[ac]ss$/i,
  use: [
    'style-loader', // JSに埋め込んでDOMに注入
    'css-loader',   // CSSをJSモジュールとして読み込み
    'sass-loader',  // SCSSをCSSにコンパイル
  ],
}
```

**重要**: CSSは`style-loader`によりJSバンドルに埋め込まれ、実行時にDOMに注入されます。

### 1.2 スタイル配置

```
ts/styles/
├── main.scss
├── components/
│   ├── _buttons.scss
│   ├── _ui-components.scss
│   ├── _ticket-tab.scss
│   ├── _processing-overlay.scss
│   └── _debug-dialog.scss
└── ...
```

### 1.3 SCSS記法例

```scss
.ytomo-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.primary {
    background: linear-gradient(135deg, #2c5aa0 0%, #1a365d 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(44, 90, 160, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

---

## 2. レスポンシブデザイン

### 2.1 なぜレスポンシブが必要か

本拡張機能は**iOS（小画面）とPC（大画面）の両方**で動作するため、画面サイズに応じたUIの最適化が不可欠です。

### 2.2 ブレイクポイント戦略

| ブレイクポイント | 対象デバイス | 主な用途 |
|-----------------|-------------|---------|
| `max-width: 400px` | 小型スマートフォン | 極小画面での文字サイズ調整 |
| `max-width: 600px` | 一般的なスマートフォン | **モバイル最適化の基準** |
| `max-width: 768px` | タブレット・大型スマホ | タブレット向け調整 |

### 2.3 実装例

#### 例1: ダイアログ幅の調整

```scss
.ytomo-dialog {
  width: 90%;
  max-width: 800px; // PC: 最大800px

  @media (max-width: 600px) {
    width: 95%; // モバイル: より広く表示
    max-width: none;
  }
}
```

#### 例2: ボタンレイアウトの変更

```scss
.ytomo-button-group {
  display: flex;
  flex-direction: row; // PC: 横並び
  gap: 12px;

  @media (max-width: 600px) {
    flex-direction: column; // モバイル: 縦並び
    gap: 8px;
  }
}
```

#### 例3: フォントサイズの段階的調整

```scss
.ytomo-ticket-item {
  font-size: 16px; // デフォルト

  @media (max-width: 600px) {
    font-size: 14px; // モバイル: やや小さく
  }

  @media (max-width: 400px) {
    font-size: 13px; // 極小画面: さらに小さく
  }
}
```

#### 例4: テーブルのレスポンシブ化

```scss
.ytomo-table {
  display: table;
  width: 100%;

  @media (max-width: 600px) {
    display: block; // モバイル: ブロック表示

    .ytomo-table-row {
      display: block;
      margin-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .ytomo-table-cell {
      display: block;
      text-align: left !important;

      &:before {
        content: attr(data-label);
        font-weight: bold;
        display: inline-block;
        width: 120px;
      }
    }
  }
}
```

---

## 3. アクセシビリティ対応

### 3.1 アニメーション無効化設定を尊重

```scss
@media (prefers-reduced-motion: reduce) {
  .ytomo-button,
  .ytomo-input {
    animation: none;
    transition: none;
  }
}
```

**用途**: 視覚障害者や乗り物酔いしやすい人のためのアニメーション無効化

### 3.2 ハイコントラストモード対応

```scss
@media (prefers-contrast: high) {
  .ytomo-button:focus,
  .ytomo-input:focus {
    outline: 3px solid #000;
  }
}
```

**用途**: ハイコントラストモードでの視認性向上

---

## 4. モバイル最適化のチェックリスト

- [ ] **タッチ可能要素は最低44x44px**（Appleガイドライン準拠）
- [ ] **メディアクエリでモバイル向けレイアウト調整**
- [ ] **フォントサイズは14px以上**（読みやすさ確保）
- [ ] **スクロール領域は慣性スクロール有効化**
  ```scss
  .scrollable-area {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; // iOS慣性スクロール
  }
  ```
- [ ] **アクセシビリティメディアクエリの実装**
- [ ] **横向き・縦向き両対応**
  ```scss
  @media (orientation: landscape) and (max-width: 768px) {
    // 横向きタブレット用調整
  }
  ```

---

## 5. CSSのバンドル方法

### 5.1 style-loaderによるDOM注入

CSSは`style-loader`によりJavaScriptバンドルに埋め込まれます。

**利点**:
- 単一ファイル配布（`index.js`のみ）
- 動的にDOMに`<style>`タグを注入
- Content Scriptとして確実に動作

**欠点**:
- CSSが大きい場合、初期ロードが遅くなる可能性
- しかし本プロジェクトではCSS量が小さいため問題なし

### 5.2 manifest.jsonでのCSS指定は不使用

```json
{
  "content_scripts": [
    {
      "matches": ["https://ticket.expo2025.or.jp/*"],
      "js": ["index.js"],
      "css": [] // ← 使用しない（JSバンドルに含める）
    }
  ]
}
```

**理由**: 単一ファイル配布の方針に従う

---

**次のセクション**: [05-build-system.md](./05-build-system.md) - ビルドシステム
