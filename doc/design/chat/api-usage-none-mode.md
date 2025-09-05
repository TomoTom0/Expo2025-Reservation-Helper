# API利用なしモードの設計

## 概要

`ytomo-api-usage-mode` が `"none"` に設定されている場合の完全非API動作モードの実装設計。

## 要件

### ユーザー要求（原文）
> api利用なしになっている場合の実装をまじめに行う。まずメインダイアログやytomoページで他タブ以外を表示しないし事前を含めて初期化などもしない。さらにapi関数で常に実行せずにエラーを返すし、認証エラーを検知しても何もしない

### 基本方針
- **API呼び出しを一切行わない**
- **初期化処理も最小限に抑制**
- **UI表示も必要最小限に制限**
- **エラーハンドリングも簡素化**

### 具体的な制限事項

#### 1. メインダイアログとYtomoページの制限
- **他タブ（チケット、入場、パビリオン）は表示しない**
- **設定タブ（Others）のみ表示**
- **タブ切り替えUI自体を非表示化**

#### 2. 初期化処理の制限
- **事前初期化を含めて一切の初期化を行わない**
- **チケット情報の取得なし**
- **認証状態の確認なし**
- **キャッシュの読み込みなし**
- **ストアの初期化なし**

#### 3. API関数の動作変更
- **全てのAPI関数で即座にエラーを返す**
- **実際のHTTPリクエストは送信しない**
- **統一されたエラーメッセージを返却**

#### 4. 認証エラー処理の無効化
- **認証エラーを検知しても何もしない**
- **再認証プロンプトを表示しない**
- **認証関連の通知を出さない**

## 実装方針

### 1. API利用モード判定の実装場所
```typescript
// utils/apiUsageMode.ts (新規作成)
export function getApiUsageMode(): string {
  return localStorage.getItem('ytomo-api-usage-mode') || 'full'
}

export function isApiUsageDisabled(): boolean {
  return getApiUsageMode() === 'none'
}
```

### 2. メインダイアログのタブ制限
```typescript
// components/MainDialog.vue
// isApiUsageDisabled() === true の場合
// - activeTab を 'others' 固定
// - タブ切り替えボタンを非表示
// - 他タブのコンポーネント自体をマウントしない
```

### 3. API関数の統一エラー返却
```typescript
// 全API関数の冒頭で
if (isApiUsageDisabled()) {
  throw new Error('API利用が無効化されています')
}
```

### 4. 初期化処理のスキップ
```typescript
// stores/tickets.ts, stores/pavilions.ts など
// init() 関数の冒頭で
if (isApiUsageDisabled()) {
  logger.info('API利用なしモードのため初期化をスキップ')
  return
}
```

### 5. 認証エラーハンドリングの無効化
```typescript
// utils/authManager.ts など
if (isApiUsageDisabled()) {
  // 認証エラーを無視
  return
}
```

## 実装優先順位

### Phase 1: 基盤整備
1. `utils/apiUsageMode.ts` の作成
2. 既存のAPI関数への統一エラー返却の追加

### Phase 2: UI制限
3. メインダイアログのタブ制限実装
4. 初期化処理のスキップ実装

### Phase 3: 詳細調整
5. 認証エラーハンドリングの無効化
6. ログメッセージの調整
7. テスト・検証

## 期待効果

- **完全なオフライン動作**: API呼び出しによるエラーの排除
- **軽量な動作**: 不要な初期化処理の削減
- **明確なUI**: 使用できない機能の非表示化
- **保守性向上**: API利用モードの一元管理

## 注意事項

- **設定の変更は即座に反映**: ページリロード不要
- **既存機能への影響最小化**: 他のモード（full, suppressed）は従来通り
- **デバッグ情報の維持**: ログレベルでの状況把握を継続