# 統一状態管理システム設計書

## 概要

現在散在している状態管理を統一し、予約と監視の対象・優先度を明確に管理するシステムを設計する。

## 現状の問題分析

### 既存の状態管理構造
- `entranceReservationState` - 予約実行状態
- `timeSlotState` - 時間帯監視状態  
- `multiTargetManager` - 複数監視対象管理
- `pageLoadingState` - ページ読み込み状態
- その他複数の状態オブジェクト

### 問題点
1. **状態分散**: 複数オブジェクトに状態が分散している
2. **予約対象の暗黙管理**: 手動選択された時間帯が明示的に管理されていない
3. **優先度ロジックの散在**: 予約優先のロジックが各所に分散
4. **状態競合**: 異なる状態オブジェクト間での整合性問題

## 統一状態管理システム設計

### 1. 基本構造

#### 実行状態（排他的）
```typescript
enum ExecutionState {
    IDLE = 'idle',                    // 待機中
    RESERVATION_RUNNING = 'reservation_running',  // 予約実行中
    MONITORING_RUNNING = 'monitoring_running'     // 監視実行中
}
```

#### 位置管理
```typescript
// indexベースの位置管理
const LOCATION_MAP: Record<number, 'east' | 'west'> = {
    0: 'east',  // 0番目のtd = 東
    1: 'west'   // 1番目のtd = 西
} as const;

const LOCATION_TO_INDEX: Record<'east' | 'west', number> = {
    'east': 0,
    'west': 1
} as const;
```

#### 対象管理
```typescript
// 予約対象（単一）
interface ReservationTarget {
    timeSlot: string;        // '11:00-'
    locationIndex: number;   // 0 or 1
    selector: string;        // DOM selector
    isValid: boolean;
}

// 監視対象（複数可能）
interface MonitoringTarget {
    timeSlot: string;        // '09:00-'
    locationIndex: number;   // 0 or 1  
    selector: string;        // DOM selector
    priority: number;        // 監視優先順位（1, 2, 3...）
    status: 'full' | 'available';
}
```

#### 優先実行モード
```typescript
enum PriorityMode {
    AUTO = 'auto',                          // 自動判定（予約優先）
    FORCE_RESERVATION = 'force_reservation', // 予約強制実行
    FORCE_MONITORING = 'force_monitoring'    // 監視強制実行
}
```

### 2. 統一状態管理クラス

```typescript
class UnifiedStateManager {
    // 実行状態
    private executionState: ExecutionState = ExecutionState.IDLE;
    
    // 対象管理
    private reservationTarget: ReservationTarget | null = null;
    private monitoringTargets: MonitoringTarget[] = [];
    
    // 優先度設定
    private priorityMode: PriorityMode = PriorityMode.AUTO;
    
    // 実行状態管理
    startReservation(): boolean;
    startMonitoring(): boolean; 
    stop(): void;
    
    // 対象管理
    setReservationTarget(timeSlot: string, locationIndex: number): void;
    addMonitoringTarget(timeSlot: string, locationIndex: number, selector: string): boolean;
    removeMonitoringTarget(timeSlot: string, locationIndex: number): boolean;
    clearMonitoringTargets(): void;
    
    // 優先度判定
    getPreferredAction(): 'reservation' | 'monitoring' | 'none';
    
    // フラグ判定
    canStartReservation(): boolean;
    canStartMonitoring(): boolean;
    canInterrupt(): boolean;
}
```

### 3. 位置管理ヘルパー

```typescript
class LocationHelper {
    // indexから東西を取得
    static getLocationFromIndex(index: number): 'east' | 'west';
    
    // 東西からindexを取得  
    static getIndexFromLocation(location: 'east' | 'west'): number;
    
    // tdSelectorからindexを抽出
    static getIndexFromSelector(selector: string): number;
    
    // DOM要素からindexを取得
    static getIndexFromElement(tdElement: HTMLTableCellElement): number;
    
    // 同じ時間帯の比較用キー生成
    static generateTimeLocationKey(timeSlot: string, locationIndex: number): string;
}
```

## 優先度ロジック

### 基本原則
1. **予約優先**: 予約可能な場合は監視より優先
2. **モード強制**: 明示的にモードを指定可能
3. **排他実行**: 予約と監視の同時実行は不可

### 判定フロー
```
1. 実行中状態チェック
   - RESERVATION_RUNNING → 中断可能
   - MONITORING_RUNNING → 中断可能
   - IDLE → 次のステップへ

2. 優先度モード判定
   - FORCE_RESERVATION → 予約可能なら予約実行
   - FORCE_MONITORING → 監視可能なら監視実行  
   - AUTO → 予約可能なら予約、不可なら監視

3. 実行可能性チェック
   - 予約: 時間帯選択済み + 来場日時ボタン有効
   - 監視: 監視対象設定済み
```

## 既存コードとの移行計画

### Phase 1: 新システム実装
- [ ] `UnifiedStateManager`クラス作成
- [ ] `LocationHelper`クラス作成
- [ ] 既存データ移行メソッド実装

### Phase 2: 段階的置き換え
- [ ] `multiTargetManager` → `UnifiedStateManager.monitoringTargets`
- [ ] 暗黙的予約対象 → `UnifiedStateManager.reservationTarget`
- [ ] `getCurrentMode()` → `UnifiedStateManager.getPreferredAction()`
- [ ] 分散状態判定 → 統一状態判定

### Phase 3: 統合・最適化
- [ ] FABボタン状態管理の統一
- [ ] 不要な状態オブジェクトの削除
- [ ] 重複ロジックの削除

## 既存コード対応表

| 既存 | 新システム |
|------|------------|
| `multiTargetManager.getTargets()` | `unifiedState.getMonitoringTargets()` |
| `multiTargetManager.addTarget()` | `unifiedState.addMonitoringTarget()` |
| `multiTargetManager.hasTargets()` | `unifiedState.hasMonitoringTargets()` |
| `entranceReservationState.isRunning` | `unifiedState.getExecutionState() === 'reservation_running'` |
| `timeSlotState.isMonitoring` | `unifiedState.getExecutionState() === 'monitoring_running'` |
| 手動時間帯選択 | `unifiedState.setReservationTarget()` |

## UI状態管理との連携

### FABボタン状態
```typescript
getFabButtonState(): 'enabled' | 'disabled' | 'running' | 'monitoring' {
    switch (this.executionState) {
        case ExecutionState.RESERVATION_RUNNING:
            return 'running';
        case ExecutionState.MONITORING_RUNNING:
            return 'monitoring';
        case ExecutionState.IDLE:
            const preferredAction = this.getPreferredAction();
            return preferredAction !== 'none' ? 'enabled' : 'disabled';
    }
}
```

### 表示テキスト
```typescript
getFabButtonText(): string {
    switch (this.executionState) {
        case ExecutionState.RESERVATION_RUNNING:
            return '予約\n中断';
        case ExecutionState.MONITORING_RUNNING:
            return '監視\n中断';
        case ExecutionState.IDLE:
            const preferredAction = this.getPreferredAction();
            switch (preferredAction) {
                case 'reservation': return '予約\n開始';
                case 'monitoring': return '監視\n開始';
                default: return '待機中';
            }
    }
}
```

## 実装上の注意点

### 1. 互換性の維持
- 段階的移行により既存機能を破壊しない
- 移行期間中は両システムを並行稼働

### 2. 状態整合性
- 状態変更時は必ずUI更新をトリガー
- 外部からの状態変更を適切に検出

### 3. パフォーマンス
- 状態変更の最小化
- 不要な再計算の回避

### 4. デバッグ性
- 状態変更のログ出力
- 現在状態の可視化機能

## 検証項目

### 機能テスト
- [ ] 予約優先ロジックの動作確認
- [ ] 監視対象の追加・削除
- [ ] 状態遷移の正常性
- [ ] UI反映の正確性

### 統合テスト  
- [ ] 既存機能との互換性
- [ ] キャッシュ機能との連携
- [ ] エラーハンドリング

### パフォーマンステスト
- [ ] 状態変更の応答性
- [ ] メモリ使用量の確認
- [ ] UI更新頻度の最適化