# モジュール依存関係マップ

## 依存関係の概要
v1.0.0では15個のTypeScriptモジュールが連携し、循環依存を回避した設計を採用。

## レイヤー構造

### Layer 1: エントリーポイント
```
main.ts (エントリーポイント)
├── 全モジュールをimport
└── webpack統合バンドル生成
```

### Layer 2: ルーティング・制御
```
app-router.ts (ページ制御・モジュール初期化)
├── ページタイプ判定
├── 各機能モジュール初期化
└── 依存注入（CacheManager等）
```

### Layer 3: 機能モジュール（並列）

#### 🎫 入場予約システム
```
entrance-page-fab.ts (UI制御)
├── entrance-reservation-state-manager.ts (状態管理) ⭐️
│   └── unified-automation-manager.ts (自動処理)
├── audio-player.ts (音声通知)
└── entrance-page-core.ts (コア機能)
```

#### 🏢 パビリオン検索
```
pavilion-search-page.ts (単体完結)
```

#### 👥 同行者管理
```
companion-ticket-page.ts (単体完結)
```

### Layer 4: 共有ユーティリティ
```
├── processing-overlay.ts (UI制御)
├── entrance-page-state.ts (状態管理)
├── cache-manager.ts (永続化)
├── entrance-page-dom-utils.ts (DOM操作)
├── timeslot-status-detector.ts (状態検出)
├── entrance-page-init.ts (初期化)
└── page-utils.ts (ページ判定)
```

## 詳細依存関係

### entrance-reservation-state-manager.ts（中核）
**Imports:**
- `entrance-page-dom-utils` (DOM操作)
- `entrance-page-core` (日付取得)
- `unified-automation-manager` (自動処理)
- `../types/index.js` (型定義)

**Used by:**
- `entrance-page-fab.ts` (UI制御)
- `app-router.ts` (初期化)

### entrance-page-fab.ts（UI制御）
**Imports:**
- `audio-player` (音声通知)
- `processing-overlay` (オーバーレイ)
- `entrance-page-state` (FAB状態)
- `entrance-page-dom-utils` (DOM操作)
- `entrance-page-core` (コア機能)
- `entrance-reservation-state-manager` (状態管理)

**Used by:**
- `app-router.ts` (初期化・FAB作成)

### processing-overlay.ts（処理制御）
**Imports:**
- `page-utils` (ページ判定)

**Used by:**
- `entrance-page-fab.ts` (オーバーレイ表示制御)

### companion-ticket-page.ts（同行者機能）
**Imports:**
- なし（単体完結）

**Used by:**
- `app-router.ts` (初期化)

### pavilion-search-page.ts（パビリオン検索）
**Imports:**
- なし（単体完結）

**Used by:**
- `app-router.ts` (初期化)

## 循環依存の回避戦略

### 1. 依存注入パターン
```typescript
// app-router.ts内で依存を注入
setCacheManager(cacheManager);
setCacheManagerForSection6(cacheManager);
setCacheManagerForSection7(cacheManager);
```

### 2. インターフェース分離
```typescript
// 型定義のみimport（循環依存回避）
import type { ReservationConfig, ReservationResult } from '../types/index.js';
```

### 3. ユーティリティ分離
```typescript
// page-utils.ts作成によりapp-router.tsとの循環依存解消
export const identify_page_type = (url: string): string | null => { ... }
```

### 4. window object利用（最小限）
```typescript
// 一時的なモジュール間通信（将来改善予定）
(window as any).companionProcessManager = companionProcessManager;
```

## import/export 統計

### Export数（機能提供）
1. **companion-ticket-page.ts**: 9 exports（同行者機能）
2. **entrance-page-fab.ts**: 8 exports（入場予約UI）
3. **entrance-reservation-state-manager.ts**: 4 exports（状態管理）
4. **entrance-page-core.ts**: 多数（コアユーティリティ）
5. **processing-overlay.ts**: 2 exports（オーバーレイ）

### Import数（依存関係）
1. **app-router.ts**: 12 imports（最多：初期化制御）
2. **entrance-page-fab.ts**: 10 imports（UI統合）
3. **entrance-reservation-state-manager.ts**: 4 imports（中核機能）

## 依存関係の健全性

### ✅ 良好な設計
- **単方向依存**: 循環依存なし
- **レイヤー分離**: 明確な階層構造
- **疎結合**: インターフェース経由の連携

### ⚠️ 改善予定
- **window object依存**: 一部でwindow経由通信（将来改善）
- **型安全性**: 一部で `any` 型使用

### 🎯 設計原則
1. **責務の分離**: 1モジュール1責務
2. **依存の最小化**: 必要最小限のimport
3. **インターフェース統一**: 共通型定義活用
4. **可読性優先**: 明確な命名・構造