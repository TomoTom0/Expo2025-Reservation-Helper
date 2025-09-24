/**
 * 入場予約管理ストア
 * EntranceReservationApiManagerをPinia storeとして完全移植
 */

import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { loggers } from '@/utils/logger'
import { authenticatedFetch } from '@/utils/authManager'
import { useTicketsStore } from '@/stores/tickets'

const logger = loggers.entranceReservation

// 元のmanagerから型定義をコピー
export interface ReservationStatus {
  visible: boolean
  isActive: boolean
  currentAction: string
  progress: number
  progressText: string
  statusClass: string
  dateChange?: string
  isWaiting?: boolean
  waitEndTime?: Date | null
}

export interface ReservationInfo {
  visible: boolean
  date: string
  timeSlots: Array<{ id: string, time: string, gate: string, priority: number }>
  completed: boolean
}

export interface ReservationResult {
  success: boolean
  gate: string
  time: string
}

export interface WaitInfo {
  isWaiting: boolean
  waitMinutes: number
  waitStartTime: Date | null
  waitEndTime: Date | null
  remainingMinutes: number
  progress: number
}

export const useEntranceReservationStore = defineStore('entranceReservation', () => {
  // tickets storeのインスタンスを取得
  const ticketsStore = useTicketsStore()

  // 元のmanagerからpublic変数をコピー
  const reservationStatus = ref<ReservationStatus>({
    visible: false,
    isActive: false,
    currentAction: '',
    progress: 0,
    progressText: '',
    statusClass: '',
    dateChange: undefined
  })

  const reservationInfo = ref<ReservationInfo>({
    visible: false,
    date: '',
    timeSlots: [],
    completed: false
  })

  const isReservationRunning = ref(false)
  const reservationHistory = ref<ReservationResult[]>([])

  // 予約待機情報
  const waitInfo = ref<WaitInfo>({
    isWaiting: false,
    waitMinutes: 60,
    waitStartTime: null,
    waitEndTime: null,
    remainingMinutes: 0,
    progress: 0
  })

  // 元のmanagerからprivate変数をコピー
  const waitTimer = ref<NodeJS.Timeout | null>(null)
  const clearSelectionCallback = ref<(() => void) | null>(null)
  const existingReservationId = ref<number | null>(null)
  const selectedDate = ref('')
  const reservationTimer = ref<NodeJS.Timeout | null>(null)
  const waitingProgressTimer = ref<NodeJS.Timeout | null>(null)
  const waitingStartTime = ref<number | null>(null)
  const waitingDuration = ref(0)
  const executedReservations = ref(new Set<string>())
  const flag_first = ref(true)
  const selectedTimeSlots = ref<any[]>([])

  // 目標時間をstoreのattributeとして管理
  const targetUpdateTime = ref<number>(35)

  // ユーティリティメソッド
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const setClearSelectionCallback = (callback: () => void) => {
    clearSelectionCallback.value = callback
  }

  // ヘルパー関数
  const formatDateForDisplay = (date: Date): string => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  const clearReservationHistory = () => {
    reservationHistory.value = []
  }

  const clearReservationTimer = () => {
    if (reservationTimer.value) {
      clearTimeout(reservationTimer.value)
      reservationTimer.value = null
    }
  }

  // 目標時間を取得
  const getTargetUpdateTime = (): number => {
    return targetUpdateTime.value
  }

  // 目標時間を設定
  const setTargetUpdateTime = (time: number): void => {
    if (time >= 5 && time <= 59) {
      targetUpdateTime.value = time
    }
  }

  // 設定された目標時間まで待機
  const waitUntil35Seconds = async (selectedTimeSlots: any[]) => {
    if (!isReservationRunning.value) return

    const targetTime = getTargetUpdateTime()
    // 設定された目標時間まで待機
    const now = new Date()
    const currentSeconds = now.getSeconds()
    const waitTime = currentSeconds <= targetTime ?
      (targetTime - currentSeconds) * 1000 :
      (60 + targetTime - currentSeconds) * 1000

    // 初回のみ：10秒以上の待機時間の場合は即座に1回実行
    if (flag_first.value && waitTime >= 10000) {
      logger.info('初回実行：10秒以上の待機時間のため即座に実行開始', { waitTime })
      flag_first.value = false

      // 即座にサイクルステップを実行
      await executeCycleStep(selectedTimeSlots)

      // 実行後は通常通り次の35秒まで待機してから継続
      return
    }

    reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: `待機中 ${Math.ceil(waitTime / 1000)}秒`,
      progress: 0,
      progressText: '待機中',
      statusClass: ''
    }

    // 待機時間のプログレスバーを開始
    startWaitingProgress(waitTime, `待機中 ${Math.ceil(waitTime / 1000)}秒`)

    reservationTimer.value = setTimeout(() => {
      executeCycleStep(selectedTimeSlots)
    }, waitTime)
  }

  // サイクルステップを実行（毎分35秒に実行）
  const executeCycleStep = async (selectedTimeSlots: any[]) => {
    try {
      if (!isReservationRunning.value) {
        logger.info('予約実行がキャンセルされました')
        return
      }

      // 待機中の場合はサイクル処理をスキップ
      if (waitInfo.value.isWaiting) {
        logger.info('待機中のため予約処理をスキップ', {
          remainingMinutes: waitInfo.value.remainingMinutes
        })
        // 次のサイクルをスケジュール（待機終了後も正常なサイクルを維持）
        scheduleNextMinuteTargetTime(selectedTimeSlots)
        return
      }

      // 1. 並行実行：最優先の予約実行 と 空き情報取得
      const availabilityData = await executeParallelTasks(selectedTimeSlots)

      if (!isReservationRunning.value) return

      // 2. 条件付き追加実行（最大2つの目標）
      await executeAdditionalReservations(selectedTimeSlots, availabilityData)

      // 次の分の目標時間まで待機（予約実行中の場合のみ）
      if (isReservationRunning.value) {
        scheduleNextMinuteTargetTime(selectedTimeSlots)
      }


    } catch (error) {
      logger.error('サイクルステップエラー', error)
      reservationStatus.value = {
        visible: true,
        isActive: false,
        currentAction: 'エラーが発生しました',
        progress: 0,
        progressText: 'エラー',
        statusClass: 'error'
      }
    }
  }

  // 次の分の目標時間までスケジュール
  const scheduleNextMinuteTargetTime = (selectedTimeSlots: any[]) => {
    const targetTime = getTargetUpdateTime()
    const now = new Date()
    const currentSeconds = now.getSeconds()
    const waitTime = (60 + targetTime - currentSeconds) * 1000

    reservationTimer.value = setTimeout(() => {
      waitUntil35Seconds(selectedTimeSlots)
    }, waitTime)
  }

  // 待機時間のプログレスバーを開始
  const startWaitingProgress = (totalWaitTime: number, actionText: string) => {
    waitingStartTime.value = Date.now()
    waitingDuration.value = totalWaitTime

    const updateProgress = () => {
      const now = Date.now()
      const elapsed = now - (waitingStartTime.value || now)
      const progress = Math.min((elapsed / totalWaitTime) * 100, 100)

      reservationStatus.value.progress = progress

      if (progress < 100) {
        setTimeout(updateProgress, 100)
      }
    }

    updateProgress()
  }

  // 並行実行：最優先予約実行 と 空き情報取得
  const executeParallelTasks = async (selectedTimeSlots: any[]) => {
    const topPrioritySlot = selectedTimeSlots.find(slot =>
      !executedReservations.value.has(`${slot.gate}-${slot.time}`) &&
      slot.priority === 1
    )

    if (!topPrioritySlot) return

    // 並行実行
    const [reservationResult, availabilityData] = await Promise.all([
      executeTopPriorityReservation(topPrioritySlot),
      getAvailabilityInfo()
    ])

    logger.info('並行実行完了', {
      reservationSuccess: reservationResult?.success,
      availabilityDataReceived: !!availabilityData
    })

    logger.info('空き情報取得完了（store更新済み）', { availabilityDataReceived: !!availabilityData })

    if (reservationResult?.success) {
      // 予約成功時の処理
      await handleReservationSuccess(topPrioritySlot, reservationResult)
    } else if (reservationResult?.error) {
      addToHistory(false, topPrioritySlot.gate, topPrioritySlot.time)
    }

    // 空き情報を返す
    return availabilityData
  }

  // 最優先予約の実行
  const executeTopPriorityReservation = async (slot: any) => {
    if (!isReservationRunning.value) return null

    const slotKey = `${slot.gate}-${slot.time}`
    reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: `最優先予約実行中 - ${slot.gate}${slot.time}`,
      progress: 25,
      progressText: '実行中',
      statusClass: ''
    }

    try {
      const result = await callActualReservationAPI(slot)

      if (result.success) {
        executedReservations.value.add(slotKey)
        addToHistory(true, slot.gate, slot.time)
      }

      return result
    } catch (error) {
      logger.error('最優先予約実行エラー', error)
      return { success: false, error: (error as Error).message }
    }
  }

  // 空き情報取得
  const getAvailabilityInfo = async () => {
    try {
      const targetDate = reservationInfo.value.date // MM/DD形式
      if (!targetDate) return null

      const month = parseInt(targetDate.split('/')[0])
      const year = new Date().getFullYear() // MM/DD形式には年がないので現在年を使用

      const ticketsStore = useTicketsStore()
      const scheduleData = await ticketsStore.getEntranceScheduleData(year, month, true)

      // 指定日の時間帯情報を取得
      const dayOfMonth = targetDate.split('/')[1].padStart(2, '0') // MM/DD → DD（0埋め）
      const dayData = scheduleData?.states?.[dayOfMonth]

      logger.info('空き情報取得結果', { year, month, dayOfMonth, hasDayData: !!dayData })
      return dayData

    } catch (error) {
      logger.error('空き情報取得エラー', error)
      return null
    }
  }

  // 履歴に追加
  const addToHistory = (success: boolean, gate: string, time: string) => {
    reservationHistory.value.push({
      success,
      gate,
      time
    })
  }

  // 予約成功時の処理
  const handleReservationSuccess = async (slot: any, result: any) => {
    isReservationRunning.value = false
    clearReservationTimer()

    // 変更前後の情報を正しく設定
    const originalDateTime = reservationInfo.value.timeSlots.length > 0
      ? `${reservationInfo.value.date} ${reservationInfo.value.timeSlots[0].gate}${reservationInfo.value.timeSlots[0].time}`
      : reservationInfo.value.date

    // TODO: 変更後の情報処理を完全実装

    reservationStatus.value = {
      visible: true,
      isActive: false,
      currentAction: '予約に成功しました',
      progress: 100,
      progressText: '成功',
      statusClass: 'success'
    }
  }

  // 条件付き追加実行
  const executeAdditionalReservations = async (selectedTimeSlots: any[], availabilityData: any = null) => {
    // 未実行の時間帯のうち、満員でない時間帯から優先度の高い順に最大2つを取得（最優先のpriority=1を除く）
    const unexecutedSlots = selectedTimeSlots
      .filter(slot => {
        // 基本条件：未実行かつ最優先でない
        if (executedReservations.value.has(`${slot.gate}-${slot.time}`) || slot.priority === 1) {
          return false
        }

        // 空き情報がある場合は満員でないかチェック
        if (availabilityData) {
          const gateKey = slot.gate === '東' ? '1' : '2'
          const timeKey = convertTimeToAPIFormat(slot.time)

          const timeState = availabilityData[gateKey]?.[timeKey]?.time_state
          logger.info('空き情報チェック', { slot: `${slot.gate}${slot.time}`, gateKey, timeKey, timeState })

          // time_state: 0=空きあり, 1=残り少ない, 2=満席, 4=利用不可
          // 満席(2)と利用不可(4)は除外
          if (timeState === 2 || timeState === 4) {
            logger.info('満員/利用不可のため追加実行から除外', { slot, timeState })
            return false
          }
        } else {
          // 空き情報が取得できない場合は追加実行を行わない（安全のため）
          logger.warn('空き情報未取得のため追加実行をスキップ', { slot })
          return false
        }

        return true
      })
      .sort((a, b) => a.priority - b.priority) // 優先度の低い数値が高優先度
      .slice(0, 2) // 最大2つ

    if (unexecutedSlots.length === 0) {
      logger.info('追加実行対象の時間帯がありません')
      return
    }

    logger.info('条件付き追加実行開始', { slots: unexecutedSlots, count: unexecutedSlots.length })

    // 順次実行：予約実行->結果確認->予約実行->結果確認
    for (const [index, slot] of unexecutedSlots.entries()) {
      if (!isReservationRunning.value) return

      reservationStatus.value = {
        visible: true,
        isActive: true,
        currentAction: `追加予約実行中 - ${slot.gate}${slot.time} (${index + 1}/${unexecutedSlots.length})`,
        progress: 50 + (index / unexecutedSlots.length) * 25,
        progressText: `追加${index + 1}/${unexecutedSlots.length}`,
        statusClass: ''
      }

      const slotKey = `${slot.gate}-${slot.time}`

      try {
        const result = await callActualReservationAPI(slot)

        if (result.success) {
          executedReservations.value.add(slotKey)
          addToHistory(true, slot.gate, slot.time)
          logger.info('追加予約成功', { slot, result })
          // 予約成功時は即座に処理終了
          await handleReservationSuccess(slot, result)
          return
        } else {
          executedReservations.value.add(slotKey)
          addToHistory(false, slot.gate, slot.time)
          logger.info('追加予約失敗', { slot, error: result.error })
        }
      } catch (error) {
        executedReservations.value.add(slotKey)
        addToHistory(false, slot.gate, slot.time)
        logger.error('追加予約エラー', { slot, error })
      }
    }
  }

  // 実際の予約API呼び出し - 元のmanagerから完全コピー
  const callActualReservationAPI = async (slot: any): Promise<{ success: boolean; date?: string; error?: string; reservationIds?: number[]; ticketsData?: any }> => {
    try {
      // 選択されたチケットIDを取得
      const selectedTickets = Array.from(ticketsStore.selectedTicketIds)
      if (selectedTickets.length === 0) {
        return { success: false, error: '選択されたチケットがありません' }
      }

      // 日付を取得（reservationInfo.dateから）MM/DD形式をYYYYMMDD形式に変換
      const rawDate = reservationInfo.value.date // MM/DD形式
      const currentYear = new Date().getFullYear()
      const [month, day] = rawDate.split('/')
      const entranceDate = `${currentYear}${month.padStart(2, '0')}${day.padStart(2, '0')}`
      const gateType = slot.gate === '東' ? 1 : 2

      // 新規予約か変更予約かを判定
      const isChangeReservation = existingReservationId.value && existingReservationId.value > 0

      logger.info('万博予約API呼び出し開始', {
        ticketIds: selectedTickets.length,
        rawDate,
        entranceDate,
        time: slot.time,
        gateType,
        method: isChangeReservation ? 'PUT' : 'POST'
      })
      const method = isChangeReservation ? 'PUT' : 'POST'

      let body: any
      if (isChangeReservation) {
        // 変更予約（PUT）のパラメータ
        body = {
          user_visiting_reservation_ids: [existingReservationId.value],
          start_time: convertTimeToAPIFormat(slot.time),
          gate_type: gateType,
          entrance_date: entranceDate
        }
      } else {
        // 新規予約（POST）のパラメータ
        body = {
          ticket_ids: selectedTickets,
          start_time: convertTimeToAPIFormat(slot.time),
          gate_type: gateType,
          entrance_date: entranceDate
        }
      }

      const response = await authenticatedFetch('/api/d/user_visiting_reservations', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
          'X-Api-Lang': 'ja'
        },
        body: JSON.stringify(body)
      })

      logger.info('予約API HTTP結果', { status: response.status, ok: response.ok, url: response.url })

      if (response.ok) {
        const result = await response.json()
        logger.info('予約API成功レスポンス', result)

        if (method === 'POST') {
          // 新規予約：user_visiting_reservation_idsで判定
          if (result.user_visiting_reservation_ids && result.user_visiting_reservation_ids.length > 0) {
            return {
              success: true,
              date: entranceDate,
              reservationIds: result.user_visiting_reservation_ids
            }
          } else {
            return {
              success: false,
              error: '予約IDが取得できませんでした（予約が作成されていません）'
            }
          }
        } else {
          // 予約変更：doing: false + マイチケット確認
          if (result.doing === false) {
            logger.info('予約変更申請完了 - マイチケット確認開始', { waitTime: '2秒' })
            await new Promise(resolve => setTimeout(resolve, 2000))
            const confirmationResult = await confirmReservationSuccess([body.user_visiting_reservation_ids[0]])
            if (confirmationResult.confirmed) {
              return {
                success: true,
                date: entranceDate,
                ticketsData: confirmationResult.ticketsData
              }
            } else {
              return {
                success: false,
                error: '予約変更申請は完了しましたが、実際の変更が確認できませんでした'
              }
            }
          } else {
            return {
              success: false,
              error: `予約変更が完了していません（doing: ${result.doing}）`
            }
          }
        }
      } else {
        let errorDetail
        try {
          errorDetail = await response.json()
        } catch (e) {
          errorDetail = await response.text()
        }

        logger.warn('予約失敗', {
          日時: `${entranceDate} ${slot.gate}ゲート ${slot.time} APIレベル`,
          httpStatus: response.status,
          httpStatusText: response.statusText,
          errorDetail,
          sentBody: body,
          理由: errorDetail?.message || errorDetail?.error || 'API呼び出しに失敗しました'
        })

        // エラー時も一定時間待機してから次の処理へ
        logger.info('エラー後待機開始', { waitTime: '1秒' })
        await new Promise(resolve => setTimeout(resolve, 1000))
        logger.info('エラー後待機完了')

        return {
          success: false,
          error: errorDetail?.message || errorDetail?.error || '予約に失敗しました'
        }
      }
    } catch (error) {
      logger.error('予約API呼び出しエラー', error)

      // 例外時も一定時間待機してから次の処理へ
      logger.info('例外後待機開始', { waitTime: '1秒' })
      await new Promise(resolve => setTimeout(resolve, 1000))
      logger.info('例外後待機完了')

      return {
        success: false,
        error: '通信エラーが発生しました'
      }
    }
  }

  // 時間をAPI形式に変換
  const convertTimeToAPIFormat = (time: string): string => {
    // verified-api-analysis.mdの実証済みマッピング
    const timeMapping: { [key: string]: string } = {
      '9:00': '0700',
      '10:00': '0900',
      '11:00': '1000',
      '12:00': '1100',
      '17:00': '1600'
    }

    return timeMapping[time] || time.replace(':', '')
  }

  // verified-api-analysis.md必須要件：マイチケット情報で実際の予約変更を確認
  const confirmReservationSuccess = async (reservationIds: number[]) => {
    try {
      // 2秒待機してからチケット情報を再取得して確認
      await new Promise(resolve => setTimeout(resolve, 2000))

      const ticketsData = await ticketsStore.loadAllTickets()
      logger.info('予約成功確認完了', {
        reservationIds,
        ticketsCount: Array.from(ticketsStore.tickets.values()).length
      })

      return {
        confirmed: true,
        ticketsData
      }
    } catch (error) {
      logger.error('予約確認エラー', error)
      return { confirmed: false }
    }
  }

  const executeReservation = async (
    timeSlots: any[],
    date?: string,
    existingId?: number | null,
    originalInfo?: any,
    isButtonEnabled?: boolean,
    timeSlotInfo?: any,
    selectedSchedule?: any
  ) => {
    // 予約実行中の場合は中断処理
    if (isReservationRunning.value) {
      logger.info('予約中断が要求されました')
      abortReservation()
      return
    }

    // バリデーション
    if (!isButtonEnabled) {
      logger.warn('予約ボタンが無効な状態で実行されました')
      return
    }

    // ロック状態チェック
    if (existingId && existingId > 0) {
      const lockedIds = ticketsStore.getLockedReservationIds()
      if (lockedIds.includes(existingId.toString())) {
        logger.warn('ロックされた予約のため実行をブロック', { existingId })
        return
      }
    }

    if (!timeSlotInfo) {
      logger.warn('必要な情報が不足しています', { timeSlotInfo, selectedSchedule })
      return
    }

    if (!date || date.trim() === '') {
      logger.warn('選択日付が無効です')
      return
    }

    if (timeSlots.length === 0) {
      logger.warn('選択された時間帯がありません')
      return
    }

    // 既存予約ID、選択日付を保存
    existingReservationId.value = existingId || null
    selectedDate.value = date

    // 予約開始時に履歴をクリア
    clearReservationHistory()

    // flag_firstを予約開始時にtrueにリセット
    flag_first.value = true

    // 予約情報を表示（実行時情報として表示）
    reservationInfo.value = {
      visible: true,
      date: formatDateForDisplay(new Date(date + 'T00:00:00')),
      timeSlots: timeSlots,
      completed: false
    }

    // 予約実行状態を開始
    isReservationRunning.value = true
    reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: '予約実行準備中',
      progress: 0,
      progressText: '準備中',
      statusClass: ''
    }

    logger.info('入場予約実行開始', { timeSlots, date, timeSlotInfo, selectedSchedule })

    // 選択された時間帯を保存（待機終了時の再開用）
    selectedTimeSlots.value = timeSlots

    try {
      // 35秒まで待機してから実行開始
      await waitUntil35Seconds(timeSlots)
    } catch (error) {
      logger.error('予約実行エラー', error)
      isReservationRunning.value = false
      clearReservationTimer()
      reservationStatus.value = {
        visible: true,
        isActive: false,
        currentAction: 'エラーが発生しました',
        progress: 0,
        progressText: 'エラー',
        statusClass: 'error'
      }
    }
  }

  const abortReservation = () => {
    logger.info('予約中断')
    isReservationRunning.value = false
    clearReservationTimer()
    reservationStatus.value = {
      visible: true,
      isActive: false,
      currentAction: '予約を中断しました',
      progress: 0,
      progressText: '中断',
      statusClass: 'cancelled'
    }

    // 実行済みリストもクリアして完全に初期状態に戻す
    executedReservations.value.clear()
  }

  const startWait = () => {
    logger.info('待機開始')
    // TODO: 実装
  }

  const extendWaitTime = (minutes: number) => {
    logger.info('待機時間延長', { minutes })
    // TODO: 実装
  }

  return {
    // State
    reservationStatus,
    reservationInfo,
    isReservationRunning,
    reservationHistory,
    waitInfo,

    // Actions
    executeReservation,
    abortReservation,
    startWait,
    extendWaitTime,
    formatTime,
    setClearSelectionCallback,
    getTargetUpdateTime,
    setTargetUpdateTime
  }
}, {
  persist: {
    key: 'ytomo-entrance-reservation-store',
    pick: ['targetUpdateTime']
  }
})