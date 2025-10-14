/**
 * 継続予約管理ストア
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useScheduledReservationStore } from './scheduledReservation'
import type { ScheduledTimeSlot } from '@/types/scheduledReservation'

interface ReservationTarget {
  pavilionId: string
  pavilionName: string
  timeSlot: string
  entranceDate: string
  registeredChannel: string
  ticketIds: string[]
}

interface SequentialReservationState {
  // 予約対象管理
  reservationTargets: ReservationTarget[]
  currentTargetIndex: number
  
  // モード管理
  endlessMode: boolean
  currentMonitoringMode: boolean  // 現在実行中（変更不可、中断で即座に停止）
  nextMonitoringMode: boolean     // 次回以降（実行中に変更可能）
  
  // 時間管理
  currentTargetTime: string       // 現在実行中（変更不可、中断で即座に停止）
  nextTargetTime: string
  nextIntervalTime: number        // 実行中に変更可能
  
  // 次の予約対象
  nextReservationTarget: ReservationTarget | null
  
  // UI表示用（計算プロパティ）
  countdownText: string
  
  // 実行状態
  isRunning: boolean
  shouldShowOverlay: boolean      // オーバーレイ表示制御フラグ
  currentScheduleId?: string      // スケジュール予約ID
}

export const useSequentialReservationStore = defineStore('sequentialReservation', () => {
  const state = ref<SequentialReservationState>({
    reservationTargets: [],
    currentTargetIndex: 0,
    endlessMode: false,
    currentMonitoringMode: false,
    nextMonitoringMode: false,
    currentTargetTime: '',
    nextTargetTime: '',
    nextIntervalTime: 15,
    nextReservationTarget: null,
    countdownText: '',
    isRunning: false,
    shouldShowOverlay: true
  })

  // 継続予約開始
  const startSequentialReservation = (targets: ReservationTarget[], endlessMode: boolean = false, showOverlay: boolean = true) => {
    state.value = {
      reservationTargets: targets,
      currentTargetIndex: 0,
      endlessMode,
      currentMonitoringMode: false,
      nextMonitoringMode: false,
      currentTargetTime: '',
      nextTargetTime: '',
      nextIntervalTime: 15,
      nextReservationTarget: targets.length > 1 ? targets[1] : null,
      countdownText: '',
      isRunning: true,
      shouldShowOverlay: showOverlay
    }

    // スケジュール予約システムに登録
    const scheduledStore = useScheduledReservationStore()

    // ReservationTargetをScheduledTimeSlotに変換
    const scheduledTimeSlots: ScheduledTimeSlot[] = targets.map(target => ({
      pavilionId: target.pavilionId,
      pavilionName: target.pavilionName,
      timeSlot: target.timeSlot,
      entranceDate: target.entranceDate
    }))

    const scheduleId = scheduledStore.createSequentialReservation(
      `順次予約 ${new Date().toLocaleTimeString()}`,
      scheduledTimeSlots,
      state.value.nextIntervalTime,
      endlessMode,
      state.value.nextMonitoringMode
    )

    // スケジュールIDを保存（停止時に使用）
    state.value.currentScheduleId = scheduleId
  }

  // 継続予約停止
  const stopSequentialReservation = () => {
    state.value.isRunning = false

    // すべてのWaitingをCanceledに変更
    if (cancelAllWaitingFn) {
      cancelAllWaitingFn()
    }

    // スケジュール予約も停止
    if (state.value.currentScheduleId) {
      const scheduledStore = useScheduledReservationStore()
      scheduledStore.stopScheduleExecution(state.value.currentScheduleId)
      state.value.currentScheduleId = undefined
    }

    if (countdownTimerId) {
      clearTimeout(countdownTimerId)
      countdownTimerId = null
    }
    if (nextReservationTimerId) {
      clearTimeout(nextReservationTimerId)
      nextReservationTimerId = null
    }
  }

  // 現在の予約実行状態を更新
  const updateCurrentReservation = (targetIndex: number, targetTime: string, monitoringMode: boolean) => {
    state.value.currentTargetIndex = targetIndex
    state.value.currentTargetTime = targetTime
    state.value.currentMonitoringMode = monitoringMode
    
    // 次の予約対象を設定
    const nextIndex = targetIndex + 1
    if (nextIndex < state.value.reservationTargets.length) {
      state.value.nextReservationTarget = state.value.reservationTargets[nextIndex]
    } else if (state.value.endlessMode) {
      // ENDLESSモードの場合は最初に戻る
      state.value.nextReservationTarget = state.value.reservationTargets[0]
    } else {
      state.value.nextReservationTarget = null
    }
  }

  const updateCountdown = (countdown: string) => {
    state.value.countdownText = countdown
  }

  // 実行中の設定変更
  const setNextMonitoringMode = (isMonitoring: boolean) => {
    state.value.nextMonitoringMode = isMonitoring
  }

  const setNextInterval = (interval: number) => {
    state.value.nextIntervalTime = interval
  }

  const setEndlessMode = (isEndless: boolean) => {
    state.value.endlessMode = isEndless
  }

  const setShouldShowOverlay = (shouldShow: boolean) => {
    state.value.shouldShowOverlay = shouldShow
  }

  // 継続予約の実行処理（再帰呼び出し）
  let executeReservationFn: any = null
  let selectedSlotsData: any[] = []
  let formatTimeSlotFn: any = null
  let loggerInstance: any = null
  let allResults: any[] = []
  let countdownTimerId: NodeJS.Timeout | null = null
  let nextReservationTimerId: NodeJS.Timeout | null = null
  let onCompleteFn: any = null
  let addHistoryFn: any = null
  let updateHistoryFn: any = null
  let deleteHistoryFn: any = null
  let cancelAllWaitingFn: any = null

  const executeSequentialReservation = async (
    pavilionsStoreExecuteReservation: any,
    selectedSlots: any[],
    formatTimeSlot: (timeStr: string) => string,
    logger: any,
    addHistory?: (target: ReservationTarget, status: 'Waiting' | 'Running' | 'Succeeded' | 'Failed with 満席' | 'Failed with 無効' | 'Failed with その他' | 'Canceled') => void,
    updateHistory?: (target: ReservationTarget, newStatus: 'Waiting' | 'Running' | 'Succeeded' | 'Failed with 満席' | 'Failed with 無効' | 'Failed with その他' | 'Canceled') => void,
    deleteHistory?: (target: ReservationTarget) => void,
    cancelAllWaiting?: () => void
  ) => {
    // 実行用のデータを保存
    executeReservationFn = pavilionsStoreExecuteReservation
    selectedSlotsData = selectedSlots
    formatTimeSlotFn = formatTimeSlot
    loggerInstance = logger
    addHistoryFn = addHistory
    updateHistoryFn = updateHistory
    deleteHistoryFn = deleteHistory
    cancelAllWaitingFn = cancelAllWaiting
    allResults = []
    
    const targets = state.value.reservationTargets
    loggerInstance.temp('継続予約実行開始（再帰モード）', { totalReservations: targets.length })
    
    // 最初の予約から開始
    if (targets.length > 0) {
      await executeNextReservation()
    }
    
    return allResults
  }

  // 次の予約を実行（再帰呼び出し）
  const executeNextReservation = async (): Promise<void> => {
    loggerInstance.temp('executeNextReservation開始', {
      isRunning: state.value.isRunning,
      currentTargetIndex: state.value.currentTargetIndex,
      targetsLength: state.value.reservationTargets.length
    })
    
    if (!state.value.isRunning) {
      loggerInstance.info('継続予約が中断されました')
      return
    }

    const currentIndex = state.value.currentTargetIndex
    const targets = state.value.reservationTargets


    const target = targets[state.value.currentTargetIndex]

    // 間隔時間の待機処理（最初の予約以外）
    let hasUpdatedToRunning = false
    if (allResults.length > 0) {
      const intervalSeconds = state.value.nextIntervalTime
      loggerInstance.temp('継続予約間隔時間待機開始', {
        index: state.value.currentTargetIndex,
        intervalSeconds,
        pavilionName: target.pavilionName
      })

      if (intervalSeconds > 0) {
        const targetTime = new Date(Date.now() + intervalSeconds * 1000)

        // カウントダウン待機
        await new Promise<void>((resolve) => {
          const countdown = () => {
            if (!state.value.isRunning) {
              loggerInstance.info('カウントダウン中に中断されました')
              resolve()
              return
            }

            const remaining = Math.max(0, Math.ceil((targetTime.getTime() - Date.now()) / 1000))
            updateCountdown(`${remaining}秒`)

            // 3秒前になったらRunningに変更
            if (remaining <= 3 && !hasUpdatedToRunning && updateHistoryFn) {
              updateHistoryFn(target, 'Running')
              hasUpdatedToRunning = true
              loggerInstance.debug('3秒前にRunning表示に変更', { index: state.value.currentTargetIndex })
            }

            if (remaining <= 0) {
              updateCountdown('')
              loggerInstance.debug('継続予約間隔時間待機完了', { index: state.value.currentTargetIndex })
              resolve()
            } else {
              countdownTimerId = setTimeout(countdown, 1000)
            }
          }
          countdown()
        })
      }
    }

    if (!state.value.isRunning) return

    // 現在の予約対象を更新
    updateCurrentReservation(
      state.value.currentTargetIndex,
      new Date().toLocaleTimeString(),
      state.value.nextMonitoringMode
    )

    // 予約開始時：まだRunningになっていなければRunningに変更（最初の予約or間隔0秒の場合）
    if (updateHistoryFn && !hasUpdatedToRunning) {
      updateHistoryFn(target, 'Running')
    }

    loggerInstance.temp('継続予約1件実行開始', {
      index: state.value.currentTargetIndex + 1,
      total: targets.length,
      pavilionName: target.pavilionName,
      timeSlot: target.timeSlot,
      timestamp: new Date().toLocaleTimeString()
    })

    // TimeSlotDataを検索
    const correspondingSlot = selectedSlotsData.find(slot =>
      slot.pavilionId === target.pavilionId &&
      formatTimeSlotFn(slot.timeSlot.time) === target.timeSlot
    )

    let isSuccess = false
    let result: any = null

    if (!correspondingSlot) {
      loggerInstance.error('対応するTimeSlotDataが見つからない', { target })
      result = { success: false, message: 'TimeSlotData not found', attempts: 0 }
      allResults.push(result)
    } else {
      // 継続予約store内で予約実行
      result = await executeReservationFn(
        target.pavilionId,
        correspondingSlot.timeSlot,
        target.entranceDate,
        target.registeredChannel,
        target.ticketIds
      )
      allResults.push(result)
      isSuccess = result.success

      loggerInstance.temp('継続予約1件実行完了', {
        index: state.value.currentTargetIndex + 1,
        success: result.success,
        message: result.message,
        timestamp: new Date().toLocaleTimeString()
      })
    }

    // 予約完了時：RunningをSucceeded/Failedに更新
    if (updateHistoryFn && result) {
      const status = result.success
        ? 'Succeeded'
        : result.failureReason
          ? `Failed with ${result.failureReason}`
          : 'Failed with その他'
      updateHistoryFn(target, status)

      // 失敗なら30秒後に削除
      if (!result.success && deleteHistoryFn) {
        setTimeout(() => {
          deleteHistoryFn(target)
        }, 30000)
      }
    }

    // 次の予約へ進む（インクリメント前に上限チェック）
    let nextIndex: number
    if (state.value.currentTargetIndex + 1 >= targets.length && state.value.endlessMode) {
      nextIndex = 0
      loggerInstance.info('ENDLESSモード: 最初から継続')
    } else if (state.value.currentTargetIndex + 1 >= targets.length && !state.value.endlessMode) {
      loggerInstance.info('継続予約完了（通常モード）')
      state.value.isRunning = false
      // すべてのWaitingをCanceledに変更
      if (cancelAllWaitingFn) {
        cancelAllWaitingFn()
      }
      return
    } else {
      nextIndex = state.value.currentTargetIndex + 1
    }

    // 次の次の予約を取得して履歴に追加（無限モード対応）
    const nextNextIndex = nextIndex + 1
    if (state.value.endlessMode) {
      // 無限モード：循環して次の予約を追加
      const nextNextTarget = targets[nextNextIndex % targets.length]
      if (addHistoryFn) {
        addHistoryFn(nextNextTarget, 'Waiting')
      }
    } else if (nextNextIndex < targets.length) {
      // 通常モード：次の予約が範囲内にある場合のみ追加
      const nextNextTarget = targets[nextNextIndex]
      if (addHistoryFn) {
        addHistoryFn(nextNextTarget, 'Waiting')
      }
    }

    // インデックスを更新
    state.value.currentTargetIndex = nextIndex
    
    // 予約成功時は継続を停止
    if (isSuccess) {
      loggerInstance.info('予約成功により継続予約を終了')
      state.value.isRunning = false
      // すべてのWaitingをCanceledに変更
      if (cancelAllWaitingFn) {
        cancelAllWaitingFn()
      }
      return
    }

    // 失敗時のみ次の予約を再帰呼び出し
    nextReservationTimerId = setTimeout(async () => {
      nextReservationTimerId = null // タイマークリア
      if (!state.value.isRunning) return // 中断チェック
      await executeNextReservation()
    }, 100) // 短い遅延で次の予約へ
  }

  return {
    // State
    state,
    
    // Actions
    startSequentialReservation,
    stopSequentialReservation,
    updateCurrentReservation,
    updateCountdown,
    setNextMonitoringMode,
    setNextInterval,
    setEndlessMode,
    setShouldShowOverlay,
    executeSequentialReservation,
    executeNextReservation
  }
})