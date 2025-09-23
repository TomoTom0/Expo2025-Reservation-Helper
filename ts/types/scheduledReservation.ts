/**
 * スケジュール予約関連の型定義
 */

export interface ScheduledTimeSlot {
  pavilionId: string
  pavilionName: string
  timeSlot: string
  entranceDate: string
}

export interface ScheduledReservation {
  id: string
  label: string
  executeAt: Date                    // 実行時刻
  interval: number                   // 間隔（秒）
  maxRetries: number                // 繰り返し回数
  isEnabled: boolean                // 有効/無効
  selectedTimeSlots: ScheduledTimeSlot[] // 選択された時間帯
  createdAt: Date
  updatedAt: Date
  // 順次予約統合用
  isSequential?: boolean            // 順次予約かどうか
  endlessMode?: boolean             // 無限モード（900回上限）
  monitoringMode?: boolean          // 監視モード
  currentAttempts?: number          // 現在の実行回数
}

export interface ScheduleUIState {
  showScheduleRow: boolean          // スケジュール設定行の表示状態
  showScheduleDialog: boolean       // ダイアログの表示状態
  selectedScheduleId: string | null // 左サイドバーで選択中のスケジュールID
  editingSchedule: ScheduledReservation | null // 編集中のスケジュール
}

export interface ScheduleFormData {
  label: string
  executeTime: string              // HH:MM形式
  executeDate: string              // YYYY-MM-DD形式
  interval: number                 // 秒数
  maxRetries: number              // 1-200
  isEnabled: boolean
}

// スケジュール実行状態
export interface ScheduleExecutionState {
  activeSchedules: Map<string, NodeJS.Timeout> // 実行中のスケジュールID -> タイマーID
  currentlyExecutingTimeSlots: Map<string, ScheduledTimeSlot[]> // 実行中の時間帯 scheduleId -> time slots
  executionHistory: ScheduleExecutionRecord[]
  isAnyScheduleRunning: boolean
}

export interface ScheduleExecutionRecord {
  scheduleId: string
  scheduleLabel: string
  executedAt: Date
  success: boolean
  error?: string
  attemptNumber: number
  totalAttempts: number
}