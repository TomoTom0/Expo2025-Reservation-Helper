/**
 * スケジュール予約管理ストア
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  ScheduledReservation, 
  ScheduleUIState, 
  ScheduleFormData,
  ScheduleExecutionState,
  ScheduleExecutionRecord,
  ScheduledTimeSlot
} from '@/types/scheduledReservation'
import { loggers } from '@/utils/logger'

const logger = loggers.ui

export const useScheduledReservationStore = defineStore('scheduledReservation', () => {
  // ストレージキー
  const STORAGE_KEY = 'ytomo-scheduled-reservations'
  const UI_STATE_KEY = 'ytomo-schedule-ui-state'

  // スケジュール予約データ
  const scheduledReservations = ref<Map<string, ScheduledReservation>>(new Map())
  
  // UI状態
  const uiState = ref<ScheduleUIState>({
    showScheduleRow: false,
    showScheduleDialog: false,
    selectedScheduleId: null,
    editingSchedule: null
  })

  // 実行状態
  const executionState = ref<ScheduleExecutionState>({
    activeSchedules: new Map(),
    currentlyExecutingTimeSlots: new Map(),
    executionHistory: [],
    isAnyScheduleRunning: false
  })

  // 計算プロパティ
  const scheduledReservationsArray = computed(() => {
    return Array.from(scheduledReservations.value.values()).sort((a, b) => 
      a.executeAt.getTime() - b.executeAt.getTime()
    )
  })

  const enabledSchedules = computed(() => {
    return scheduledReservationsArray.value.filter(schedule => schedule.isEnabled)
  })

  const selectedSchedule = computed(() => {
    if (!uiState.value.selectedScheduleId) return null
    return scheduledReservations.value.get(uiState.value.selectedScheduleId) || null
  })

  // 現在実行中の時間帯を取得
  const currentlyExecutingTimeSlots = computed(() => {
    const allTimeSlots = new Map<string, ScheduledTimeSlot>() // key: pavilionId_timeSlot
    
    for (const [scheduleId, timeSlots] of executionState.value.currentlyExecutingTimeSlots.entries()) {
      for (const slot of timeSlots) {
        const key = `${slot.pavilionId}_${slot.timeSlot}`
        allTimeSlots.set(key, slot)
      }
    }
    
    return allTimeSlots
  })

  // データ永続化
  const saveToStorage = () => {
    try {
      const data = Array.from(scheduledReservations.value.entries()).map(([id, schedule]) => [
        id, 
        {
          ...schedule,
          executeAt: schedule.executeAt.toISOString(),
          createdAt: schedule.createdAt.toISOString(),
          updatedAt: schedule.updatedAt.toISOString()
        }
      ])
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      logger.debug('スケジュール予約データを保存', { count: data.length })
    } catch (error) {
      logger.error('スケジュール予約データ保存エラー', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const data = JSON.parse(stored)
      const loadedMap = new Map()

      data.forEach(([id, schedule]: [string, any]) => {
        loadedMap.set(id, {
          ...schedule,
          executeAt: new Date(schedule.executeAt),
          createdAt: new Date(schedule.createdAt),
          updatedAt: new Date(schedule.updatedAt)
        })
      })

      scheduledReservations.value = loadedMap
      logger.info('スケジュール予約データを読み込み', { count: loadedMap.size })
    } catch (error) {
      logger.error('スケジュール予約データ読み込みエラー', error)
    }
  }

  const saveUIState = () => {
    try {
      localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState.value))
    } catch (error) {
      logger.error('UI状態保存エラー', error)
    }
  }

  const loadUIState = () => {
    try {
      const stored = localStorage.getItem(UI_STATE_KEY)
      if (stored) {
        const loaded = JSON.parse(stored)
        // ダイアログ状態とスケジュール展開状態は復元しない（起動時は必ず閉じた状態）
        uiState.value = {
          ...loaded,
          showScheduleRow: false,
          showScheduleDialog: false,
          editingSchedule: null
        }
      }
    } catch (error) {
      logger.error('UI状態読み込みエラー', error)
    }
  }

  // スケジュール予約の操作
  const createScheduledReservation = (
    formData: ScheduleFormData,
    selectedTimeSlots: ScheduledTimeSlot[]
  ): string => {
    const id = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 実行日時を作成
    const [year, month, day] = formData.executeDate.split('-').map(Number)
    const [hour, minute] = formData.executeTime.split(':').map(Number)
    const executeAt = new Date(year, month - 1, day, hour, minute)

    const now = new Date()
    const scheduledReservation: ScheduledReservation = {
      id,
      label: formData.label,
      executeAt,
      interval: formData.interval,
      maxRetries: formData.maxRetries,
      isEnabled: formData.isEnabled,
      selectedTimeSlots: [...selectedTimeSlots],
      createdAt: now,
      updatedAt: now
    }

    scheduledReservations.value.set(id, scheduledReservation)
    saveToStorage()

    logger.info('スケジュール予約を作成', { 
      id, 
      label: formData.label, 
      executeAt: executeAt.toLocaleString(),
      timeSlotsCount: selectedTimeSlots.length 
    })

    return id
  }

  const updateScheduledReservation = (
    id: string,
    formData: ScheduleFormData,
    selectedTimeSlots: ScheduledTimeSlot[]
  ): boolean => {
    const existing = scheduledReservations.value.get(id)
    if (!existing) {
      logger.error('更新対象のスケジュール予約が見つからない', { id })
      return false
    }

    // 実行日時を作成
    const [year, month, day] = formData.executeDate.split('-').map(Number)
    const [hour, minute] = formData.executeTime.split(':').map(Number)
    const executeAt = new Date(year, month - 1, day, hour, minute)

    const updated: ScheduledReservation = {
      ...existing,
      label: formData.label,
      executeAt,
      interval: formData.interval,
      maxRetries: formData.maxRetries,
      isEnabled: formData.isEnabled,
      selectedTimeSlots: [...selectedTimeSlots],
      updatedAt: new Date()
    }

    scheduledReservations.value.set(id, updated)
    saveToStorage()

    logger.info('スケジュール予約を更新', { 
      id, 
      label: formData.label,
      executeAt: executeAt.toLocaleString(),
      timeSlotsCount: selectedTimeSlots.length 
    })

    return true
  }

  const deleteScheduledReservation = (id: string): boolean => {
    const existing = scheduledReservations.value.get(id)
    if (!existing) {
      logger.error('削除対象のスケジュール予約が見つからない', { id })
      return false
    }

    // 実行中の場合は停止
    stopScheduleExecution(id)

    scheduledReservations.value.delete(id)
    saveToStorage()

    // 選択中だった場合は選択解除
    if (uiState.value.selectedScheduleId === id) {
      uiState.value.selectedScheduleId = null
    }

    logger.info('スケジュール予約を削除', { id, label: existing.label })
    return true
  }

  const duplicateScheduledReservation = (id: string, newLabel?: string): string | null => {
    const original = scheduledReservations.value.get(id)
    if (!original) {
      logger.error('複製元のスケジュール予約が見つからない', { id })
      return null
    }

    const copyLabel = newLabel || `${original.label}_COPY`
    const formData: ScheduleFormData = {
      label: copyLabel,
      executeDate: original.executeAt.toISOString().split('T')[0],
      executeTime: original.executeAt.toTimeString().substr(0, 5),
      interval: original.interval,
      maxRetries: original.maxRetries,
      isEnabled: original.isEnabled
    }

    const newId = createScheduledReservation(formData, original.selectedTimeSlots)
    logger.info('スケジュール予約を複製', { originalId: id, newId, newLabel: copyLabel })

    return newId
  }

  // UI状態の操作
  const toggleScheduleRow = () => {
    uiState.value.showScheduleRow = !uiState.value.showScheduleRow
    saveUIState()
    logger.debug('スケジュール設定行の表示切り替え', { show: uiState.value.showScheduleRow })
  }

  const showScheduleDialog = () => {
    uiState.value.showScheduleDialog = true
    logger.debug('スケジュール管理ダイアログを表示')
  }

  const hideScheduleDialog = () => {
    uiState.value.showScheduleDialog = false
    uiState.value.editingSchedule = null
    logger.debug('スケジュール管理ダイアログを非表示')
  }

  const selectSchedule = (id: string | null) => {
    uiState.value.selectedScheduleId = id
    logger.debug('スケジュール選択', { selectedId: id })
  }

  const startEditingSchedule = (schedule: ScheduledReservation) => {
    uiState.value.editingSchedule = { ...schedule }
    logger.debug('スケジュール編集開始', { id: schedule.id, label: schedule.label })
  }

  const stopEditingSchedule = () => {
    uiState.value.editingSchedule = null
    logger.debug('スケジュール編集終了')
  }

  // スケジュール実行管理
  const startScheduleExecution = (scheduleId: string) => {
    const schedule = scheduledReservations.value.get(scheduleId)
    if (!schedule || !schedule.isEnabled) {
      logger.warn('実行対象のスケジュールが無効', { scheduleId })
      return false
    }

    // 既に実行中の場合は停止してから開始
    if (executionState.value.activeSchedules.has(scheduleId)) {
      stopScheduleExecution(scheduleId)
    }

    const now = new Date()
    const delay = schedule.executeAt.getTime() - now.getTime()

    if (delay <= 0) {
      logger.warn('実行時刻が過去のスケジュール', { 
        scheduleId, 
        executeAt: schedule.executeAt.toLocaleString() 
      })
      return false
    }

    const timeoutId = setTimeout(() => {
      executeScheduledReservation(scheduleId)
    }, delay)

    executionState.value.activeSchedules.set(scheduleId, timeoutId)
    executionState.value.isAnyScheduleRunning = executionState.value.activeSchedules.size > 0

    logger.info('スケジュール実行を開始', { 
      scheduleId, 
      label: schedule.label,
      executeAt: schedule.executeAt.toLocaleString(),
      delayMs: delay 
    })

    return true
  }

  const stopScheduleExecution = (scheduleId: string) => {
    const timeoutId = executionState.value.activeSchedules.get(scheduleId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      executionState.value.activeSchedules.delete(scheduleId)
      executionState.value.isAnyScheduleRunning = executionState.value.activeSchedules.size > 0

      // 実行中時間帯もクリア
      executionState.value.currentlyExecutingTimeSlots.delete(scheduleId)

      logger.info('スケジュール実行を停止', { scheduleId })
    }
  }

  const executeScheduledReservation = async (scheduleId: string) => {
    const schedule = scheduledReservations.value.get(scheduleId)
    if (!schedule || !schedule.isEnabled) {
      logger.error('スケジュールが無効または存在しない', { scheduleId })
      return
    }

    // アクティブスケジュールから削除
    executionState.value.activeSchedules.delete(scheduleId)
    executionState.value.isAnyScheduleRunning = executionState.value.activeSchedules.size > 0

    try {
      logger.info('スケジュール予約実行開始', { 
        scheduleId, 
        label: schedule.label,
        timeSlotsCount: schedule.selectedTimeSlots.length 
      })

      // 実行中時間帯を設定
      executionState.value.currentlyExecutingTimeSlots.set(scheduleId, schedule.selectedTimeSlots)

      // 実行履歴に記録を追加
      const executionRecord: ScheduleExecutionRecord = {
        scheduleId: schedule.id,
        scheduleLabel: schedule.label,
        executedAt: new Date(),
        success: false,
        attemptNumber: 1,
        totalAttempts: schedule.maxRetries
      }

      // Sequential Reservationとの連携のためのイベントを発火
      const event = new CustomEvent('schedule-execute-reservation', {
        detail: {
          scheduleId: schedule.id,
          schedule: schedule,
          executionRecord: executionRecord
        }
      })
      window.dispatchEvent(event)
      
      // 実行履歴に追加（成功判定はSequential Reservation側で行う）
      executionState.value.executionHistory.unshift(executionRecord)
      
      // 履歴を100件に制限
      if (executionState.value.executionHistory.length > 100) {
        executionState.value.executionHistory = executionState.value.executionHistory.slice(0, 100)
      }

      logger.info('スケジュール予約実行処理完了', { scheduleId })
      
    } catch (error) {
      logger.error('スケジュール予約実行エラー', { scheduleId, error })
      
      // エラーを履歴に記録
      const errorRecord: ScheduleExecutionRecord = {
        scheduleId: schedule.id,
        scheduleLabel: schedule.label,
        executedAt: new Date(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
        attemptNumber: 1,
        totalAttempts: schedule.maxRetries
      }
      executionState.value.executionHistory.unshift(errorRecord)
    } finally {
      // 実行中時間帯をクリア
      executionState.value.currentlyExecutingTimeSlots.delete(scheduleId)
    }
  }

  const stopAllScheduleExecutions = () => {
    executionState.value.activeSchedules.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    executionState.value.activeSchedules.clear()
    executionState.value.currentlyExecutingTimeSlots.clear()
    executionState.value.isAnyScheduleRunning = false
    logger.info('全スケジュール実行を停止')
  }

  // スケジュール結果更新
  const updateScheduleExecutionResult = (scheduleId: string, success: boolean, error?: string) => {
    const latestRecord = executionState.value.executionHistory.find(record => 
      record.scheduleId === scheduleId
    )
    
    if (latestRecord) {
      latestRecord.success = success
      if (error) {
        latestRecord.error = error
      }
      
      logger.info('スケジュール実行結果更新', { 
        scheduleId, 
        success, 
        error 
      })
    }
  }

  // 有効なスケジュールを自動開始
  const startEnabledSchedules = () => {
    const now = new Date()
    const enabledSchedules = scheduledReservationsArray.value.filter(schedule => 
      schedule.isEnabled && schedule.executeAt > now
    )

    enabledSchedules.forEach(schedule => {
      startScheduleExecution(schedule.id)
    })

    logger.info('有効スケジュール自動開始', { 
      count: enabledSchedules.length 
    })
  }

  // 順次予約をスケジュール予約として登録
  const createSequentialReservation = (
    label: string,
    selectedTimeSlots: ScheduledTimeSlot[],
    interval: number,
    endlessMode: boolean,
    monitoringMode: boolean
  ): string => {
    const id = `seq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    const sequentialReservation: ScheduledReservation = {
      id,
      label: `[順次] ${label}`,
      executeAt: now, // 即座に開始
      interval,
      maxRetries: endlessMode ? 900 : 1, // 無限モードなら900回、そうでなければ1回
      isEnabled: true,
      selectedTimeSlots: [...selectedTimeSlots],
      createdAt: now,
      updatedAt: now,
      // 順次予約統合用
      isSequential: true,
      endlessMode,
      monitoringMode,
      currentAttempts: 0
    }

    scheduledReservations.value.set(id, sequentialReservation)
    saveToStorage()

    logger.info('順次予約をスケジュール予約として登録', {
      id,
      label,
      endlessMode,
      monitoringMode,
      maxRetries: sequentialReservation.maxRetries
    })

    return id
  }

  // 順次予約の実行回数を更新
  const updateSequentialAttempts = (id: string): boolean => {
    const reservation = scheduledReservations.value.get(id)
    if (!reservation || !reservation.isSequential) {
      return false
    }

    const newAttempts = (reservation.currentAttempts || 0) + 1

    // 900回上限チェック
    if (reservation.endlessMode && newAttempts >= 900) {
      logger.info('順次予約が900回上限に達したため停止', { id, attempts: newAttempts })
      stopScheduleExecution(id)
      return false
    }

    // 実行回数を更新
    const updated: ScheduledReservation = {
      ...reservation,
      currentAttempts: newAttempts,
      updatedAt: new Date()
    }

    scheduledReservations.value.set(id, updated)
    saveToStorage()

    return true
  }

  // 初期化
  const initialize = () => {
    loadFromStorage()
    loadUIState()

    // 有効なスケジュールを自動開始
    startEnabledSchedules()

    logger.info('スケジュール予約ストアを初期化', {
      schedulesCount: scheduledReservations.value.size
    })
  }

  return {
    // State
    scheduledReservations,
    uiState,
    executionState,

    // Computed
    scheduledReservationsArray,
    enabledSchedules,
    selectedSchedule,
    currentlyExecutingTimeSlots,

    // Actions - データ操作
    createScheduledReservation,
    updateScheduledReservation,
    deleteScheduledReservation,
    duplicateScheduledReservation,

    // Actions - UI操作
    toggleScheduleRow,
    showScheduleDialog,
    hideScheduleDialog,
    selectSchedule,
    startEditingSchedule,
    stopEditingSchedule,

    // Actions - 実行管理
    startScheduleExecution,
    stopScheduleExecution,
    stopAllScheduleExecutions,

    // Actions - 実行結果管理
    updateScheduleExecutionResult,
    startEnabledSchedules,

    // Actions - 順次予約統合
    createSequentialReservation,
    updateSequentialAttempts,

    // Actions - 初期化
    initialize
  }
})