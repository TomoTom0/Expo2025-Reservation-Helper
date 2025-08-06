# 統一状態管理への移行設計

## 目標
古い状態管理システムを統一状態管理（UnifiedStateManager）に段階的に移行し、状態の一元化を実現する。

## 最優先修正: 監視継続問題の解決

### 現在の問題
```typescript
// section5.ts:869 - 監視継続を阻害している条件
if (!timeSlotState.isMonitoring || !unifiedStateManager || !unifiedStateManager.hasMonitoringTargets()) {
    return; // リロード処理がスキップされる
}
```

### 修正方針
timeSlotState.isMonitoringの代わりにUnifiedStateManagerの状態を使用する

### 修正内容
```typescript
// 修正前
if (!timeSlotState.isMonitoring || !unifiedStateManager || !unifiedStateManager.hasMonitoringTargets()) {
    return;
}

// 修正後
if (!unifiedStateManager || unifiedStateManager.getExecutionState() !== ExecutionState.MONITORING_RUNNING) {
    return;
}
```

## Phase 1: 緊急修正（今すぐ実行）

### 1.1 監視継続処理の修正
**ファイル**: section5.ts
**対象**: checkSlotAvailabilityAndReload関数（869行目）
**内容**: 条件分岐をUnifiedStateManagerベースに変更

### 1.2 監視開始処理の修正
**ファイル**: section5.ts
**対象**: startSlotMonitoring関数
**内容**: timeSlotState.modeとisMonitoringの設定をUnifiedStateManagerに移行

## Phase 2: timeSlotStateの段階的移行（後日実行）

### 2.1 監視状態の統一
**対象プロパティ**:
- `timeSlotState.mode` → `unifiedStateManager.getExecutionState()`
- `timeSlotState.isMonitoring` → `unifiedStateManager.getExecutionState() === MONITORING_RUNNING`

### 2.2 UI更新処理の修正
**ファイル**: section6.ts
**対象**: updateMainButtonDisplay関数
**内容**: timeSlotStateの参照をUnifiedStateManagerに変更

### 2.3 試行回数管理の検討
**timeSlotState.retryCount**の扱い:
- 現在は監視処理専用
- UnifiedStateManagerに統合するか独立維持するか要検討

## Phase 3: 他の状態管理の整理（後日検討）

### 3.1 entranceReservationStateの統合検討
**現在の機能**:
- 予約処理の実行状態管理
- 試行回数・実行時間の記録

**統合案**:
- UnifiedStateManagerの予約状態に統合
- または独立性を維持

### 3.2 軽微な状態管理の保持
**保持対象**:
- reloadCountdownState: カウントダウン表示専用
- calendarWatchState: カレンダー監視専用  
- pageLoadingState: ページ読み込み状態専用

**理由**: 統合によるメリットが少なく、独立性を保つ方が適切

## 実装手順

### Step 1: 緊急修正の実行
1. section5.ts:869の条件分岐を修正
2. startSlotMonitoring関数でUnifiedStateManagerの状態更新を追加
3. ビルド確認・動作テスト

### Step 2: 段階的移行の計画
1. 各使用箇所の詳細分析
2. 移行の優先順位決定
3. テストケースの準備

### Step 3: 移行の実行
1. 高頻度使用箇所から順次移行
2. 各修正後にビルド確認
3. 動作テストで回帰確認

## 期待される効果

### 即効性のある改善
1. 監視継続処理の正常化
2. 状態不整合の解消
3. UI表示の改善

### 長期的なメリット  
1. 保守性の向上
2. バグ修正の効率化
3. 新機能開発の簡素化

## リスク管理

### 修正時のリスク
- 既存機能の破綻
- 新たな不整合の発生
- パフォーマンスの劣化

### 対策
- 段階的な修正
- 各段階でのビルド確認
- 十分な動作テスト
- バックアップの保持