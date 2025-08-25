# Vue.js移行 概要設計書

## 1. 目的と背景

### 背景
- 現行のmain-dialog-fab.tsは純粋なVanilla JavaScript/TypeScriptで実装されている
- iPhoneのSafariでProxyベースのReactiveSystemに互換性問題がある
- Vue.jsの導入によりモダンなリアクティブシステムと互換性の向上を図る

### 目的
- メインダイアログシステムをVue.js 3のComposition APIで再実装
- 既存機能を100%維持しながらコードの保守性と拡張性を向上
- iPhoneでの動作安定性を改善

## 2. 移行スコープ

### 移行対象
- `ts/modules/main-dialog-fab.ts` (MainDialogFabImpl class)
- メインダイアログのHTML構築とDOM操作部分
- リアクティブUI更新システム

### 移行除外（既存維持）
- `TicketManager`, `PavilionManager`等の基盤システム
- `ReactiveTicketManager`（Vue移行後は段階的に置き換え検討）
- 他のFABシステムやページ別機能

## 3. アーキテクチャ概要

### 現行アーキテクチャ
```
MainDialogFabImpl (Class)
├── HTML文字列テンプレート生成
├── DOM操作とイベントハンドリング
├── ReactiveTicketManagerとの連携
└── UI状態管理
```

### Vue移行後アーキテクチャ
```
Vue Main Dialog System
├── MainDialog.vue (SFC)
│   ├── Template (HTML)
│   ├── Script (Composition API)
│   └── Style (SCSS)
├── VueDialogManager.ts (Vue instance管理)
└── vue-dialog-init.ts (初期化)
```

## 4. 技術仕様

### Vue.js設定
- Vue.js 3.x (Composition API)
- Single File Component (SFC)
- TypeScript対応
- webpack Vue loader統合

### 依存関係追加
- vue@^3.x
- @vue/compiler-sfc
- vue-loader
- @vue/typescript

### ビルド設定変更
- webpack.config.js にVue loader設定追加
- tsconfig.json のtypes追加

## 5. 移行戦略

### フェーズ1: 環境準備
1. Vue.js関連依存関係追加
2. webpack設定更新
3. TypeScript設定更新
4. Vue型定義ファイル作成

### フェーズ2: コア移植
1. MainDialog.vue SFC作成
2. 既存のHTML生成ロジックをVueテンプレートに移植
3. 状態管理をComposition APIに移植
4. イベントハンドリングをVue方式に移植

### フェーズ3: 統合とテスト
1. VueDialogManager作成（Vue instance管理）
2. 既存システムとの統合テスト
3. 機能完全性検証
4. パフォーマンス検証

## 6. リスク分析

### 高リスク
- 既存の複雑なDOM操作ロジックの移植ミス
- ReactiveTicketManagerとの連携不備
- ビルドサイズ増加

### 中リスク  
- Vue.jsの学習コスト
- 既存コードとの併存期間の複雑性

### 低リスク
- 基本的なVue.js機能の利用
- 段階的移行アプローチ

## 7. 成功判定基準

### 必須要件
- [ ] 既存のメインダイアログ機能100%再現
- [ ] チケット表示・選択・フィルタリング機能完全動作
- [ ] パビリオン検索・予約機能完全動作
- [ ] iPhone Safari互換性向上確認

### 品質要件
- [ ] TypeScript型安全性維持
- [ ] ビルドサイズ20%以内の増加
- [ ] 初期表示速度維持
- [ ] メモリ使用量増加10%以内

## 8. スケジュール概算

- フェーズ1: 環境準備 - 1日
- フェーズ2: コア移植 - 3-4日
- フェーズ3: 統合とテスト - 2-3日
- 総期間: 1週間程度