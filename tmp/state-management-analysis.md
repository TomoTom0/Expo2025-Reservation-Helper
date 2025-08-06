# 古い状態管理システム調査結果

## 概要
統一状態管理（UnifiedStateManager）への移行が不完全で、複数の古い状態管理システムが残存している。

## 発見された古い状態管理システム

### 1. timeSlotState（最も使用頻度が高い）
**使用箇所**: 38箇所
**主な機能**: 時間帯監視の状態管理
**プロパティ**:
- `mode`: 'idle' | 'selecting' | 'monitoring' | 'trying'
- `isMonitoring`: boolean
- `retryCount`: number
- `reloadInterval`: number（30000ms）
- `monitoringInterval`: タイマーID

**使用ファイル**:
- section5.ts: 23箇所（メイン使用箇所）
- section6.ts: 24箇所（UI更新で参照）
- section7.ts: 6箇所（予約処理で参照）
- section3.ts: 2箇所（キャッシュ保存で参照）

### 2. entranceReservationState
**使用箇所**: 13箇所
**主な機能**: 入場予約処理の実行状態管理
**プロパティ**:
- `isRunning`: boolean
- `shouldStop`: boolean
- `startTime`: number | null
- `attempts`: number

**使用ファイル**:
- section7.ts: 11箇所（予約実行処理）
- section6.ts: 2箇所（UI表示で参照）

### 3. reloadCountdownState
**使用箇所**: 14箇所
**主な機能**: リロードカウントダウンの状態管理
**プロパティ**:
- `totalSeconds`: number
- `secondsRemaining`: number | null
- `startTime`: number | null
- `countdownInterval`: タイマーID | null
- `reloadTimer`: タイマーID | null

**使用ファイル**:
- section6.ts: 13箇所（カウントダウン表示・制御）
- section5.ts: 1箇所（タイマー設定）

### 4. calendarWatchState
**使用箇所**: 6箇所
**主な機能**: カレンダー変更監視の状態管理
**プロパティ**:
- `isWatching`: boolean
- `currentSelectedDate`: string | null
- `observer`: MutationObserver | null

**使用ファイル**:
- section7.ts: 6箇所（カレンダー監視処理）

### 5. pageLoadingState
**使用箇所**: 3箇所
**主な機能**: ページ読み込み状態管理
**プロパティ**:
- `isLoading`: boolean
- `startTime`: number | null

**使用ファイル**:
- section6.ts: 3箇所（ページ読み込み状態制御）

## 問題分析

### 1. 二重管理による不整合
- UnifiedStateManagerで監視状態を管理
- timeSlotStateでも同様の状態を管理
- 両者の同期が取れず、不整合が発生

### 2. 監視継続処理の問題
現在の監視継続チェック：
```typescript
if (!timeSlotState.isMonitoring || !unifiedStateManager || !unifiedStateManager.hasMonitoringTargets()) {
    return; // リロード処理をスキップ
}
```

**問題**: timeSlotState.isMonitoringがfalseの場合、統一状態管理で監視対象があってもリロードされない

### 3. 状態の分散
- 5つの独立した状態管理オブジェクト
- それぞれが独自のライフサイクル
- 統一されたアクセス方法がない

## 統一状態管理システムとの比較

### UnifiedStateManagerの機能
- ExecutionState（実行状態）: IDLE, RESERVATION_RUNNING, MONITORING_RUNNING
- 予約対象管理（単一）
- 監視対象管理（複数）
- 優先度判定
- UI連携用メソッド

### 古いシステムの重複機能
1. **timeSlotState.mode** ↔ **UnifiedStateManager.executionState**
2. **timeSlotState.isMonitoring** ↔ **UnifiedStateManager.getExecutionState() === MONITORING_RUNNING**
3. **監視対象管理** ↔ **UnifiedStateManager.monitoringTargets**

## 影響範囲

### 直接的影響
- 監視継続処理が正常に動作しない
- 状態の不整合によるUI表示エラー
- 重複した状態更新によるパフォーマンス低下

### 保守性への影響
- 新機能追加時に複数箇所の修正が必要
- バグ修正時の影響範囲が不明確
- テストの複雑化

## 推奨解決策

### Phase 1: timeSlotStateの段階的移行
1. 重要度の高い使用箇所から順次UnifiedStateManagerに移行
2. 特に監視継続処理（section5.ts:869）を最優先で修正

### Phase 2: 他の状態管理の統合検討
1. entranceReservationState → UnifiedStateManagerの予約状態に統合
2. reloadCountdownState, calendarWatchState → 独立性を維持するか検討
3. pageLoadingState → 軽微なため統合の優先度は低い

### Phase 3: レガシーコードの削除
1. 移行完了後に古い状態管理オブジェクトを削除
2. 参照箇所の完全削除
3. テストケースの更新