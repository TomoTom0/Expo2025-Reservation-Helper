# Phase 4実装計画: JavaScript分割とコンパイル環境構築

## 現在の状況

### コード構造の詳細分析
- **総行数**: 3,893行
- **8セクション**: 既に構造整理済み
- **テスト基盤**: 152テスト（100%成功率）
- **Unit Test実装率**: 50%

### セクション構成（行範囲）
1. **基本機能・ユーティリティ** (13-499行): 486行
2. **状態管理オブジェクト** (500-627行): 127行
3. **キャッシュ・永続化システム** (628-810行): 182行
4. **DOM要素セレクタ・検索** (811-975行): 164行
5. **時間帯監視・分析システム** (976-1891行): 915行
6. **カレンダー・UI状態管理** (1892-3136行): 1,244行
7. **FAB・メインUI** (3137-3771行): 634行
8. **ページ判定・初期化** (3772-3893行): 121行

## 分割実行戦略

### Step 1: ディレクトリ構造作成
```
src-modules/
├── core/
│   └── utils.js           # 基本機能・ユーティリティ
├── state/
│   └── manager.js         # 状態管理オブジェクト
├── cache/
│   └── manager.js         # キャッシュ・永続化システム
├── dom/
│   └── selectors.js       # DOM要素セレクタ・検索
├── monitor/
│   └── timeSlot.js        # 時間帯監視・分析システム
├── calendar/
│   └── watcher.js         # カレンダー・UI状態管理
├── ui/
│   └── fab.js             # FAB・メインUI
├── main/
│   └── init.js            # ページ判定・初期化
└── pavilion/
    └── search.js          # パビリオン検索機能（core/utilsから抽出）
```

### Step 2: 依存関係順序の分割
1. **core/utils.js**: 他モジュールから参照される基本関数
2. **state/manager.js**: 状態管理オブジェクト（coreに依存）
3. **cache/manager.js**: キャッシュシステム（core, stateに依存）
4. **dom/selectors.js**: DOM操作関数（coreに依存）
5. **pavilion/search.js**: パビリオン検索機能（core, domに依存）
6. **monitor/timeSlot.js**: 時間帯監視システム（全モジュールに依存）
7. **calendar/watcher.js**: カレンダー監視（core, state, cache, domに依存）
8. **ui/fab.js**: FAB UI（monitor, calendar, state, cacheに依存）
9. **main/init.js**: エントリーポイント（全モジュールに依存）

### Step 3: モジュール出力形式
各モジュールファイルは以下の形式で作成：
```javascript
// モジュール: core/utils.js
// 基本機能・ユーティリティ

// スタイル挿入
export const insert_style = () => {
    // 実装内容
};

// フィルター準備
export const prepare_filter = (input) => {
    // 実装内容
};

// その他のユーティリティ
export const getRandomWaitTime = () => {
    // 実装内容
};
```

### Step 4: webpack設定によるコンパイル環境
package.jsonにビルドスクリプトを追加：
```json
{
  "scripts": {
    "build": "webpack --mode production",
    "build:dev": "webpack --mode development",
    "watch": "webpack --mode development --watch"
  },
  "devDependencies": {
    "webpack": "^5.0.0",
    "webpack-cli": "^5.0.0"
  }
}
```

webpack.config.js設定：
```javascript
module.exports = {
  entry: './src-modules/main/init.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'src'),
    iife: true, // UserScript形式のためIIFE包装
  },
  mode: 'production',
  optimization: {
    minimize: false, // UserScriptの可読性維持
  }
};
```

## 検証・テスト計画

### Step 5: 分割後の検証手順
1. **個別モジュールテスト**: 各モジュールのexport/import確認
2. **結合テスト**: webpack buildによる1ファイル生成確認
3. **機能テスト**: 既存の152テスト全通過確認
4. **互換性テスト**: 元のindex.jsと同一動作確認

### Step 6: 品質保証
- **eslint**: コード品質チェック
- **prettier**: コードフォーマット統一
- **テストカバレッジ**: 現在の50%維持以上
- **ファイルサイズ**: コンパイル後のサイズ確認

## リスク管理

### 潜在的問題と対策
1. **依存関係の循環**: 事前分析で回避
2. **UserScript互換性**: IIFE包装で対応
3. **ファイルサイズ増加**: treeshaking設定で最小化
4. **テスト失敗**: 段階的分割で早期検出

### ロールバック戦略
- 各段階でgitコミット実行
- 元のindex.jsをindex-backup.jsとして保持
- テスト失敗時は即座に前段階に戻す

## 成功指標
- [ ] 8モジュール作成完了
- [ ] webpack環境構築完了
- [ ] 152テスト全通過維持
- [ ] 1ファイル結合成功
- [ ] UserScript動作確認完了