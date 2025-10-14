# プロジェクト構成の特徴

## 1. UserScript形式での統合

本プロジェクトの最大の特徴は、**Chrome拡張機能をUserScript形式で統合している**点です。

### 1.1 なぜUserScript形式なのか

| 理由 | 説明 |
|------|------|
| **単一ファイル配布** | `src/index.js` 1ファイルで完結 |
| **iOS Safari互換性** | Stayアプリ等のUserScript実行環境で動作 |
| **管理の容易さ** | webpackで全モジュールを1つのバンドルに統合 |
| **可読性維持** | minimizeせずに配布（デバッグ・検証容易） |

### 1.2 webpack設定: UserScriptヘッダー自動生成

ビルド時に動的にUserScriptヘッダーを生成します。

```javascript
// webpack.config.js
const generateUserScriptHeader = () => {
  const version = getVersionFromFile(); // version.datから読み取り
  const buildTime = new Date().toLocaleString('ja-JP', {...});

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
```

**重要ポイント**:
- `version.dat`からバージョン番号を読み取り（手動管理）
- ビルド時刻を自動記録（デバッグ時の識別用）
- `@match`でURL限定（不要なページでの実行を防止）

### 1.3 webpack BannerPluginでの挿入

```javascript
// webpack.config.js
plugins: [
  new webpack.BannerPlugin({
    banner: generateUserScriptHeader(),
    raw: true, // コメント形式として扱わない
    entryOnly: true // エントリーポイントのみに挿入
  }),
  // ...
]
```

### 1.4 ビルド出力設定

```javascript
// webpack.config.js
output: {
  filename: 'index.js',
  path: path.resolve(__dirname, 'src'), // src/index.js に出力
  library: {
    type: 'umd', // Universal Module Definition
    name: 'YtomoExtension'
  },
  globalObject: 'this'
},
mode: 'development', // 可読性維持
optimization: {
  minimize: false, // 圧縮しない（UserScriptの可読性維持）
  splitChunks: false, // chunk分割無効化（単一ファイル出力）
}
```

**なぜこの設定なのか**:
- `minimize: false`: デバッグ・検証を容易にするため
- `splitChunks: false`: UserScript制約（単一ファイル必須）
- `type: 'umd'`: ブラウザ環境で確実に動作

---

## 2. Chrome Storage APIを使用しない設計

本プロジェクトは**Chrome Storage APIを一切使用していません**。

### 2.1 代替手段: Pinia + pinia-plugin-persistedstate

**状態管理**: Pinia（Vue.js公式）
**永続化**: `pinia-plugin-persistedstate`

```typescript
// ts/stores/index.ts
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

export const pinia = createPinia()
pinia.use(createPersistedState())

if (typeof window !== 'undefined') {
  (window as any).__pinia__ = pinia
}
```

### 2.2 ストレージメカニズム

| 項目 | 内容 |
|------|------|
| **デフォルトストレージ** | `localStorage`（同期的） |
| **対応可能** | `sessionStorage`も利用可能 |
| **非対応** | IndexedDB（非同期ストレージは未サポート） |

### 2.3 主要ストア一覧

```
ts/stores/
├── index.ts                  # Pinia初期化
├── tickets.ts                # チケット管理
├── pavilions.ts              # パビリオン管理
├── entranceReservation.ts    # 入場予約
├── scheduledReservation.ts   # スケジュール予約
├── mainDialog.ts             # メインダイアログUI
├── overlays.ts               # オーバーレイUI
├── sequentialReservation.ts  # 連続予約
└── others.ts                 # その他設定
```

### 2.4 なぜlocalStorageを選択したか

| 理由 | 説明 |
|------|------|
| **iOS Safari完全互換** | iOS Safariでも確実に動作する同期的ストレージ |
| **シンプル性** | Chrome Storage APIの非同期処理・パーミッション不要 |
| **Pinia統合** | `pinia-plugin-persistedstate`がデフォルトサポート |
| **リアルタイム性** | 同期的な読み書きで状態整合性を保証 |
| **クロスオリジン不要** | Content Script内で完結 |

### 2.5 IndexedDBを使用しない理由

`pinia-plugin-persistedstate`は**同期的ストレージのみ対応**:

- Piniaの`$subscribe`メソッドが同期的に動作
- 非同期ストレージ（IndexedDB）を使うとデータ競合リスク
- IndexedDB対応には別プラグイン（`pinia-plugin-indexedDB`等）が必要

**結論**: localStorageの容量（5-10MB）で十分なため、シンプルさを優先

---

## 3. モジュール構成

### 3.1 ディレクトリ構造

```
ts/
├── modules/          # 機能モジュール（TypeScript）
├── components/       # Vueコンポーネント（.vue）
├── stores/           # Piniaストア（TypeScript）
├── composables/      # Vue Composition API
├── services/         # API/ビジネスロジック
├── utils/            # ユーティリティ
├── types/            # 型定義
└── styles/           # スタイル（SCSS）
```

### 3.2 エントリーポイント（`ts/modules/main.ts`）

```typescript
// 各モジュールをimportすることで、webpackが統合バンドルを作成
import { loggers } from '@/utils/logger';
import { authManager } from '@/utils/authManager';

// すべてのモジュールをimport（副作用importも含む）
import './pavilion-search-page';
import './entrance-page-init';
import './entrance-page-state';
import './cache-manager';
// ...

// グローバル予約結果通知チェック
const checkGlobalReservationResult = (): void => { /* ... */ }

// 認証監視開始
authManager.startAuthMonitoring();
```

**重要**: 各モジュールは`import`されるだけで自動実行（副作用import）。

---

**次のセクション**: [03-logging-system.md](./03-logging-system.md) - ログシステム
