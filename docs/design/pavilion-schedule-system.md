# パビリオン予約スケジュール実行システム 調査・設計

## 1. 現状分析

### 既存のスケジュール実行機能

#### A. 継続予約システム（Sequential Reservation）
- **場所**: `/ts/stores/sequentialReservation.ts`
- **機能**: 選択された複数の時間帯を順次予約実行
- **特徴**: 
  - 手動開始のみ（ユーザーがFABボタンクリック）
  - 予約成功時に自動停止
  - ENDLESSモードで循環実行可能
  - 間隔時間設定可能（nextIntervalTime）

#### B. 監視システム（Monitoring System）
- **場所**: `/ts/modules/monitoring-service.ts`, `/ts/modules/monitoring-scheduler.ts`
- **機能**: パビリオンの空き状況を定期監視し、空きを検知したら自動予約
- **特徴**: 
  - スケジューラーベース（固定秒数、Cron式、カスタム関数）
  - 空き検知時に自動予約実行
  - デフォルトは毎分00,15,30,45秒に実行

### 既存システムの関係性

```
PavilionTab.vue
  ↓ (予約実行ボタン押下)
SequentialReservation Store
  ↓ (executeSequentialReservation)
Pavilions Store (executeReservation)

MonitoringService
  ↓ (定期チェック)
MonitoringScheduler
  ↓ (空き検知時)
PavilionReservationCache + 予約ページ遷移
```

## 2. 要求仕様の分析

**「パビリオン予約に、スケジュール実行を導入したい」**

### 解釈される可能性のある要求：

#### A. 時刻指定予約実行
- **概要**: 指定した時刻に予約を自動実行
- **例**: 「13:00に〇〇パビリオン14:00枠を予約実行」
- **用途**: 先着順予約の開始時刻狙い撃ち

#### B. 定期予約試行
- **概要**: 定期的に予約を試行し続ける
- **例**: 「5分おきに〇〇パビリオン14:00枠の予約を試行」  
- **用途**: キャンセル待ち的な継続試行

#### C. 条件付きスケジュール実行
- **概要**: 特定条件を満たした時に予約実行
- **例**: 「空きが出たら即座に予約」「他の予約が成功したら次を実行」
- **用途**: 複雑な予約戦略の自動化

#### D. バッチ予約スケジューリング
- **概要**: 複数の予約を時系列でスケジューリング
- **例**: 「10:00に予約A、10:05に予約B、10:10に予約C」
- **用途**: 戦略的な予約実行タイミング制御

## 3. 技術的検討

### 既存機能の活用方針

#### Sequential Reservation（継続予約）の拡張
**現状**: 手動開始 → 順次実行 → 成功時停止
**拡張案**: スケジュール開始 → 条件付き実行 → 柔軟停止

#### Monitoring System（監視）の応用
**現状**: 定期監視 → 空き検知 → 自動予約
**応用案**: スケジュール監視 → 時刻/条件検知 → 予約実行

### アーキテクチャ設計

#### 案1: Sequential Reservationベース拡張
```typescript
interface ScheduledReservationTarget extends ReservationTarget {
  scheduledTime?: Date           // 実行時刻指定
  retryInterval?: number         // 再試行間隔（秒）
  maxRetries?: number           // 最大試行回数
  conditions?: {                // 実行条件
    requiresAvailability?: boolean
    dependsOn?: string[]        // 依存予約ID
  }
}
```

#### 案2: 新規Schedule Management System
```typescript
interface ScheduleConfig {
  id: string
  reservationTargets: ReservationTarget[]
  schedule: {
    type: 'fixed-time' | 'interval' | 'condition-based'
    startTime?: Date
    interval?: number
    conditions?: ScheduleCondition[]
  }
  execution: {
    mode: 'once' | 'retry' | 'continuous'
    maxAttempts?: number
    stopOnSuccess?: boolean
  }
}
```

#### 案3: Monitoring System拡張
```typescript
interface ScheduledMonitoringTarget extends MonitoringTarget {
  schedule: {
    executeAt?: Date
    retryInterval?: number
    conditions?: MonitoringCondition[]
  }
}
```

## 4. 推奨設計

### アプローチ: Sequential Reservation拡張

**理由**:
- 既存のUI（PavilionTab.vue）との親和性が高い
- 予約実行ロジックがすでに実装済み
- ユーザーの選択→実行フローを維持できる

### 実装方針

#### 4.1 データ構造拡張
```typescript
// 既存ReservationTargetを拡張
interface ScheduledReservationTarget extends ReservationTarget {
  schedule?: {
    executeAt?: Date              // 指定時刻実行
    retryInterval?: number        // 再試行間隔（分）
    maxRetries?: number          // 最大試行回数
    retryUntil?: Date           // 試行期限
  }
}

// スケジュール実行状態管理
interface ScheduleExecutionState {
  scheduledTargets: ScheduledReservationTarget[]
  pendingExecutions: Map<string, NodeJS.Timeout>
  executionHistory: ExecutionRecord[]
  isScheduleActive: boolean
}
```

#### 4.2 UI拡張
```vue
<!-- PavilionTab.vue の時間帯ボタン拡張 -->
<div class="ytomo-time-slot-schedule">
  <input type="datetime-local" 
         v-if="showScheduleInput" 
         v-model="scheduleTime"
         :min="minScheduleTime">
  <button @click="addToSchedule">
    📅 スケジュール予約
  </button>
</div>
```

#### 4.3 実行エンジン拡張
```typescript
// SequentialReservationStore拡張
const scheduleReservationExecution = (
  targets: ScheduledReservationTarget[]
) => {
  targets.forEach(target => {
    if (target.schedule?.executeAt) {
      const delay = target.schedule.executeAt.getTime() - Date.now()
      const timeoutId = setTimeout(() => {
        executeScheduledReservation(target)
      }, delay)
      
      state.value.pendingExecutions.set(target.id, timeoutId)
    }
  })
}
```

## 5. 実装計画

### Phase 1: 基盤拡張
1. **ScheduledReservationTarget型定義追加**
2. **SequentialReservationStore拡張**
   - スケジュール実行機能追加
   - 実行履歴管理
   - キャンセル機能

### Phase 2: UI実装
1. **PavilionTab.vue拡張**
   - スケジュール設定UI追加
   - 実行予定表示
   - スケジュール管理パネル
2. **新規コンポーネント作成**
   - ScheduleManagementPanel.vue
   - ScheduleHistoryView.vue

### Phase 3: 高度機能
1. **条件付き実行**
   - 空き状況チェック連携
   - 依存予約管理
2. **リトライ機能**
   - 自動再試行
   - エラー処理強化

### Phase 4: 統合・最適化
1. **Monitoring Systemとの連携**
2. **パフォーマンス最適化**
3. **ユーザビリティ向上**

## 6. 考慮事項

### 技術的制約
- **ブラウザタブ制限**: タブが非アクティブな場合のスケジューラー動作
- **API Rate Limit**: 短時間での多数リクエスト防止
- **メモリ効率**: 長期間のスケジュール管理

### ユーザビリティ
- **設定の複雑さ**: 直感的なスケジュール設定UI
- **実行状況の可視化**: 現在の実行状態の明確な表示
- **エラーハンドリング**: 失敗時の分かりやすいフィードバック

### セキュリティ
- **入力検証**: スケジュール時刻の妥当性チェック
- **リソース保護**: 過度なAPI呼び出し防止

## 7. 次のステップ

1. **要求仕様の明確化**: 具体的にどのようなスケジュール実行が必要か確認
2. **Phase 1の実装開始**: 基盤となるデータ構造とロジックの拡張
3. **プロトタイプ作成**: 最小限の機能でのPoC実装
4. **ユーザーフィードバック**: 実際の使用感に基づく改善

## 8. まとめ

パビリオン予約システムへのスケジュール実行機能導入は、既存のSequential Reservation システムを拡張する形で実装することが最適と判断される。これにより、既存のUIと予約ロジックを活用しながら、柔軟で高機能なスケジュール実行システムを構築できる。