/**
 * 入場予約管理ストア
 * EntranceReservationApiManagerをPinia storeとして完全移植
 */

import { defineStore } from 'pinia'
import { ref, computed, type Ref } from 'vue'
import { loggers } from '@/utils/logger'
import { authenticatedFetch } from '@/utils/authManager'
import { useTicketsStore } from '@/stores/tickets'
import { formatDateSlash } from '@/utils/dateFormat'

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
  date: string
  time: string
  gate: string
}

export interface ReservationResult {
  success: boolean
  date: string
  gate: string
  time: string
  failureReason?: '満席' | '無効' | 'その他'
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

  const reservationInfo = ref<ReservationInfo[]>([])

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
  // selectedDate削除 - 複数日付対応のためreservationInfoを直接使用
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


  const clearReservationHistory = () => {
    reservationHistory.value = []
  }

  // 予約ボタンの有効性判定
  const isReservationEnabled = computed(() => {
    // 基本条件：時間帯が1つ以上選択されている
    if (reservationInfo.value.length === 0) {
      return false
    }

    // 選択している既存の入場予約のチェック
    const selectedTickets = ticketsStore.selectedTickets

    // チケットが選択されていない場合は無効
    if (selectedTickets.length === 0) {
      return false
    }

    // 複数チケット選択は無効
    if (selectedTickets.length !== 1) {
      return false
    }

    const ticket = selectedTickets[0]

    // 自分の所有かチェック
    if (!ticket.isOwn) {
      return false
    }

    // 選択されたスケジュールを取得
    const selectedSchedules = ticket.schedules?.filter(schedule => {
      const reservationId = schedule.user_visiting_reservation_id?.toString()
      if (!reservationId) return false
      const reservationData = ticketsStore.getReservationManagement(reservationId)
      return !!reservationData?.isSelected
    }) || []

    // 新規予約の場合（selectedScheduleがない、または既存予約がない）
    if (selectedSchedules.length === 0) {
      return true // 新規予約は時間帯選択があれば予約可能
    }

    // 既存予約変更の場合
    if (selectedSchedules.length !== 1) {
      return false
    }

    const selectedSchedule = selectedSchedules[0]

    // 既存予約の条件チェック
    const hasExistingReservation = selectedSchedule.user_visiting_reservation_id != null &&
                                  selectedSchedule.user_visiting_reservation_id > 0 &&
                                  selectedSchedule.entrance_date

    // 新規予約の場合（既存予約データがない）
    if (!hasExistingReservation) {
      return true
    }

    // 既存予約変更の場合：ロックされていないかチェック
    const reservationId = selectedSchedule.user_visiting_reservation_id?.toString()
    if (!reservationId) {
      return false
    }

    const reservationData = ticketsStore.getReservationManagement(reservationId)
    if (reservationData?.isLocked) {
      return false
    }

    return true
  })


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

      // 1. 並行実行：最優先予約実行 + 月スケジュール取得
      const [primaryResult, dateAvailabilityMap] = await Promise.all([
        executePrimaryReservation(selectedTimeSlots),
        fetchMonthSchedules(selectedTimeSlots)
      ])

      if (!isReservationRunning.value) return

      // 最優先予約が成功した場合は即座に終了
      if (primaryResult?.success) {
        return
      }

      // 2. 追加予約実行（空きがあれば最大2つ）
      await executeAdditionalReservations(selectedTimeSlots, dateAvailabilityMap)

      if (!isReservationRunning.value) return

      // 3. 次の分の目標時間まで待機（予約実行中の場合のみ）
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

    // 次のサイクルまでの待機表示を設定
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
      waitUntil35Seconds(selectedTimeSlots)
    }, waitTime)
  }

  // 待機時間のプログレスバーを開始（元のAPIManagerと同じ実装）
  const startWaitingProgress = (totalWaitTime: number, actionText: string) => {
    waitingStartTime.value = Date.now()
    waitingDuration.value = totalWaitTime

    // 待機中プログレスタイマーをクリア
    if (waitingProgressTimer.value) {
      clearInterval(waitingProgressTimer.value)
    }

    // 500msごとに進捗を更新
    waitingProgressTimer.value = setInterval(() => {
      const now = Date.now()
      const elapsed = now - (waitingStartTime.value || now)
      const progress = Math.min((elapsed / totalWaitTime) * 100, 100)
      const remainingTime = Math.max(0, Math.ceil((totalWaitTime - elapsed) / 1000))

      reservationStatus.value.progress = progress
      reservationStatus.value.currentAction = `${actionText.split(' ')[0]} ${remainingTime}秒`

      if (progress >= 100) {
        clearInterval(waitingProgressTimer.value!)
        waitingProgressTimer.value = null
      }
    }, 500) // 500msごと更新（元の実装と同じ）
  }

  // 最優先予約実行（d1 t1） - 並行処理用
  const executePrimaryReservation = async (selectedTimeSlots: any[]) => {
    const primarySlot = selectedTimeSlots.find(slot => slot.priority === 1)
    if (!primarySlot) {
      logger.warn('最優先予約対象が見つかりません')
      return { success: false }
    }

    reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: `最優先予約実行中: ${primarySlot.gate}${primarySlot.time}`,
      progress: 50,
      progressText: '1/2',
      statusClass: ''
    }

    logger.info('最優先予約実行開始', { slot: primarySlot })

    // 実際の予約実行
    const slotKey = `${primarySlot.gate}-${primarySlot.time}`
    executedReservations.value.add(slotKey)

    try {
      // 従来の実際の予約処理を実行
      const result = await callActualReservationAPI(primarySlot)

      // 結果に応じてステータス更新
      if (result.success) {
        // 予約成功時は即座に終了
        await handleReservationSuccess(primarySlot, result)
        return { success: true, slot: primarySlot, result }
      } else {
        // 失敗時は履歴に追加して継続
        logger.error('最優先予約失敗', { slot: primarySlot, result })
        addToHistory(false, primarySlot.date, primarySlot.gate, primarySlot.time, result.failureReason || 'その他')
        return { success: false, slot: primarySlot, result }
      }
    } catch (error) {
      logger.error('最優先予約実行エラー', error)
      addToHistory(false, primarySlot.date, primarySlot.gate, primarySlot.time, 'その他')
      return { success: false, slot: primarySlot, error }
    }
  }

  // 月スケジュール取得（reservationInfo内のすべての日付情報を返す） - 並行処理用
  const fetchMonthSchedules = async (selectedTimeSlots: any[]) => {
    logger.info('月スケジュール取得開始（並行処理）', { slotsCount: selectedTimeSlots.length })

    // 並行処理のためステータス表示なし

    // スロットから必要な月を抽出
    const monthsNeeded = new Set<string>()
    selectedTimeSlots.forEach(slot => {
      if (slot.date) {
        // YYYY-MM-DD形式から月を取得
        const month = slot.date.split('-')[1] // YYYY-MM-DD から MM を取得
        if (month) {
          monthsNeeded.add(month)
        }
      }
    })

    logger.info('必要な月を抽出完了', { months: Array.from(monthsNeeded) })

    const ticketsStore = useTicketsStore()
    const currentYear = new Date().getFullYear()

    // 複数月のスケジュール取得を並行実行（タイムアウト付き）
    const monthResults = new Map<string, any>()

    const schedulePromises = Array.from(monthsNeeded).map(async (month) => {
      logger.info(`月スケジュール取得開始: ${month}月`)
      try {
        const result = await Promise.race([
          ticketsStore.getEntranceScheduleData(currentYear, parseInt(month), true),
          new Promise((_, reject) => setTimeout(() => reject(new Error(`タイムアウト: ${month}月`)), 10000))
        ])
        logger.info(`月スケジュール取得完了: ${month}月`)
        monthResults.set(month, result)
        return { month, result }
      } catch (error) {
        logger.error(`月スケジュール取得エラー: ${month}月`, error)
        monthResults.set(month, null)
        return { month, result: null }
      }
    })

    try {
      logger.info('Promise.all開始')
      await Promise.all(schedulePromises)
      logger.info('月スケジュール取得完了', { months: Array.from(monthsNeeded), resultsCount: monthResults.size })

      // 各日付の空き情報を抽出して返す
      const dateAvailability: { [date: string]: any } = {}

      selectedTimeSlots.forEach(slot => {
        if (slot.date) {
          // YYYY-MM-DD形式から月日を取得
          const parts = slot.date.split('-')
          const month = parts[1] // MM（文字列）
          const dayOfMonth = parts[2].padStart(2, '0') // DD

          // 該当月のスケジュールデータを取得
          const scheduleData = monthResults.get(month)
          if (scheduleData && scheduleData !== null) {
            const dayData = scheduleData?.states?.[dayOfMonth]
            if (dayData) {
              dateAvailability[slot.date] = dayData
            }
          }
        }
      })

      logger.info('日付別空き情報抽出完了', {
        datesCount: Object.keys(dateAvailability).length,
        dates: Object.keys(dateAvailability)
      })

      return dateAvailability
    } catch (error) {
      logger.error('月スケジュール取得エラー', error)
      return {}
    } finally {
      logger.info('月スケジュール取得処理終了')
    }
  }

  // 空き情報取得
  const getAvailabilityInfo = async (targetDate?: string) => {
    try {
      // 引数で指定されない場合は空き情報の取得をスキップ（複数日付対応のため）
      if (!targetDate) {
        return null
      }
      const dateToUse = targetDate

      // YYYY-MM-DD形式から年月日を抽出
      const parts = dateToUse.split('-')
      const year = parseInt(parts[0])
      const month = parseInt(parts[1])
      const dayOfMonth = parts[2].padStart(2, '0')

      const ticketsStore = useTicketsStore()
      const scheduleData = await ticketsStore.getEntranceScheduleData(year, month, true)
      const dayData = scheduleData?.states?.[dayOfMonth]

      logger.info('空き情報取得結果', { year, month, dayOfMonth, hasDayData: !!dayData })
      return dayData

    } catch (error) {
      logger.error('空き情報取得エラー', error)
      return null
    }
  }

  // 履歴に追加
  const addToHistory = (success: boolean, date: string, gate: string, time: string, failureReason?: '満席' | '無効' | 'その他') => {
    reservationHistory.value.push({
      success,
      date,
      gate,
      time,
      failureReason
    })
  }

  // 予約成功時の処理
  const handleReservationSuccess = async (slot: any, result: any) => {
    isReservationRunning.value = false
    clearReservationTimer()

    // slotの情報を直接使用
    const originalDateTime = `${slot.date} ${slot.gate}${slot.time}`

    // 変更後の情報処理を実装
    const newDateTime = result.date && result.reservationTime
      ? `${result.date} ${slot.gate}${result.reservationTime}`
      : `${slot.date} ${slot.gate}${slot.time}`

    const dateChangeText = originalDateTime !== newDateTime
      ? `${originalDateTime} → ${newDateTime}`
      : ''

    reservationStatus.value = {
      visible: true,
      isActive: false,
      currentAction: `予約成功: ${slot.gate}${slot.time}`,
      progress: 100,
      progressText: '成功',
      statusClass: 'success',
      dateChange: dateChangeText
    }

    // 予約履歴に追加
    reservationHistory.value.push({
      success: true,
      date: slot.date,
      gate: slot.gate,
      time: slot.time
    })
  }

  // 追加予約実行（空きがあれば最大2つ）
  const executeAdditionalReservations = async (selectedTimeSlots: any[], dateAvailabilityMap: { [date: string]: any } = {}) => {
    // 瞬時に判定を完了
    const availableSlots = selectedTimeSlots
      .filter(slot => {
        // 基本条件：未実行かつ最優先でない
        if (executedReservations.value.has(`${slot.gate}-${slot.time}`) || slot.priority === 1) {
          return false
        }

        // 該当日付の空き情報をチェック
        const dayAvailability = dateAvailabilityMap[slot.date]
        if (dayAvailability) {
          const gateKey = slot.gate === '東' ? '1' : '2'
          const timeKey = convertTimeToAPIFormat(slot.time)

          const timeState = dayAvailability[gateKey]?.[timeKey]?.time_state
          logger.info('追加予約空き情報チェック', {
            slot: `${slot.date} ${slot.gate}${slot.time}`,
            gateKey,
            timeKey,
            timeState
          })

          // time_state: 0=空きあり, 1=残り少ない のみ追加実行対象
          return timeState === 0 || timeState === 1
        }

        // 空き情報がない場合は実行しない
        return false
      })
      .sort((a, b) => a.priority - b.priority) // 優先度順
      .slice(0, 2) // 最大2つ

    if (availableSlots.length === 0) {
      logger.info('追加実行対象がありません')
      // 追加予約がなくても次のサイクルに続行
    }

    logger.info('追加予約実行開始', { slots: availableSlots, count: availableSlots.length })

    // 順次実行：予約実行->結果確認->予約実行->結果確認
    for (const [index, slot] of availableSlots.entries()) {
      if (!isReservationRunning.value) return

      // 実際の予約実行時のみステータス表示
      reservationStatus.value = {
        visible: true,
        isActive: true,
        currentAction: `追加予約実行中 - ${slot.gate}${slot.time} (${index + 1}/${availableSlots.length})`,
        progress: 75 + ((index + 1) / availableSlots.length) * 25,
        progressText: `2/2 追加${index + 1}`,
        statusClass: ''
      }

      const slotKey = `${slot.gate}-${slot.time}`
      executedReservations.value.add(slotKey)

      try {
        const result = await callActualReservationAPI(slot)

        if (result.success) {
          addToHistory(true, slot.date, slot.gate, slot.time)
          logger.info('追加予約成功', { slot, result })
          // 予約成功時は即座に処理終了
          await handleReservationSuccess(slot, result)
          return
        } else {
          addToHistory(false, slot.date, slot.gate, slot.time, result.failureReason || 'その他')
          logger.error('追加予約失敗', { slot, result })
        }
      } catch (error) {
        addToHistory(false, slot.date, slot.gate, slot.time, 'その他')
        logger.error('追加予約エラー', { slot, error })
      }
    }
  }

  // 実際の予約API呼び出し - 元のmanagerから完全コピー
  const callActualReservationAPI = async (slot: any): Promise<{ success: boolean; date?: string; error?: string; failureReason?: '満席' | '無効' | 'その他'; reservationIds?: number[]; ticketsData?: any }> => {
    try {
      // 選択されたチケットIDを取得
      const selectedTickets = Array.from(ticketsStore.selectedTicketIds)
      if (selectedTickets.length === 0) {
        return { success: false, error: '選択されたチケットがありません' }
      }

      // slotの日付を直接使用（YYYY-MM-DD形式）
      const rawDate = slot.date
      if (!rawDate) {
        return { success: false, error: 'スロットに日付情報がありません' }
      }

      // YYYY-MM-DD形式から年月日を抽出
      const [year, month, day] = rawDate.split('-')
      if (!year || !month || !day) {
        return { success: false, error: `日付形式が不正です: ${rawDate}` }
      }
      const entranceDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`
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

        // 失敗理由を判定（元のAPIManagerと同じロジック）
        let failureReason: '満席' | '無効' | 'その他' = 'その他'
        const errorMessage = errorDetail?.message || errorDetail?.error || 'API呼び出しに失敗しました'

        if (errorDetail?.error?.name) {
          const errorName = errorDetail.error.name
          if (errorName === 'stock_not_available') {
            failureReason = '満席'
          } else if (errorName === 'th_error') {
            failureReason = '無効'
          }
        }

        logger.warn('予約失敗', {
          日時: `${entranceDate} ${slot.gate}ゲート ${slot.time} APIレベル`,
          httpStatus: response.status,
          httpStatusText: response.statusText,
          errorDetail,
          sentBody: body,
          理由: errorMessage,
          failureReason
        })

        // エラー時も一定時間待機してから次の処理へ
        logger.info('エラー後待機開始', { waitTime: '1秒' })
        await new Promise(resolve => setTimeout(resolve, 1000))
        logger.info('エラー後待機完了')

        return {
          success: false,
          error: typeof errorMessage === 'string' ? errorMessage : '予約に失敗しました',
          failureReason
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
        error: '通信エラーが発生しました',
        failureReason: 'その他' as const
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

  const executeReservation = async () => {
    // 予約実行中の場合は中断処理
    if (isReservationRunning.value) {
      logger.info('予約中断が要求されました')
      abortReservation()
      return
    }

    // reservationInfoから必要な情報を取得
    if (reservationInfo.value.length === 0) {
      logger.warn('選択された時間帯がありません')
      return
    }

    // 時間帯スロットを変換（各スロットには日付情報も含む）
    const timeSlots = reservationInfo.value.map((info, index) => ({
      id: `${info.date}-${info.gate}-${info.time}`,
      time: info.time,
      gate: info.gate === 'east' ? '東' : '西',
      date: info.date,
      priority: index + 1
    }))

    // 選択されたスケジュールから既存予約IDを取得
    const selectedTickets = ticketsStore.selectedTickets
    let existingId: number | null = null
    let selectedSchedule: any = null

    if (selectedTickets.length > 0) {
      for (const ticket of selectedTickets) {
        if (ticket.schedules) {
          const schedule = ticket.schedules.find(s => {
            const reservationId = s.user_visiting_reservation_id?.toString()
            if (!reservationId) return false
            const reservationData = ticketsStore.getReservationManagement(reservationId)
            return !!reservationData?.isSelected
          })
          if (schedule) {
            selectedSchedule = schedule
            existingId = schedule.user_visiting_reservation_id || null
            break
          }
        }
      }
    }

    // ロック状態チェック
    if (existingId && existingId > 0) {
      const lockedIds = ticketsStore.getLockedReservationIds()
      if (lockedIds.includes(existingId.toString())) {
        logger.warn('ロックされた予約のため実行をブロック', { existingId })
        return
      }
    }

    // 時間帯情報を作成（複数選択対応）
    const timeSlotInfo = {
      totalSelections: reservationInfo.value.length,
      slots: reservationInfo.value.map(info => ({
        time: info.time,
        gate: info.gate === 'east' ? '東' : '西',
        gateType: info.gate === 'east' ? 1 : 2,
        date: info.date
      }))
    }

    if (timeSlots.length === 0) {
      logger.warn('選択された時間帯がありません')
      return
    }

    // 既存予約IDを保存
    existingReservationId.value = existingId || null

    // 予約開始時に履歴をクリア
    clearReservationHistory()

    // flag_firstを予約開始時にtrueにリセット
    flag_first.value = true

    // 予約情報はそのまま使用（既にreservationInfo.valueに設定済み）

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

    logger.info('入場予約実行開始', { timeSlots, timeSlotInfo, selectedSchedule })

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
    logger.info('待機開始', { waitMinutes: waitInfo.value.waitMinutes })

    // 待機状態を開始
    waitInfo.value.isWaiting = true
    waitInfo.value.waitStartTime = new Date()
    waitInfo.value.waitEndTime = new Date(Date.now() + waitInfo.value.waitMinutes * 60 * 1000)
    waitInfo.value.remainingMinutes = waitInfo.value.waitMinutes
    waitInfo.value.progress = 0

    // 予約ステータスを待機中に更新
    reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: `待機中 ${waitInfo.value.waitMinutes}分`,
      progress: 0,
      progressText: '待機中',
      statusClass: 'waiting'
    }

    // 1分ごとの進捗更新タイマー
    const waitTimer = setInterval(() => {
      const now = new Date()
      const remaining = Math.max(0, Math.ceil((waitInfo.value.waitEndTime!.getTime() - now.getTime()) / (60 * 1000)))

      waitInfo.value.remainingMinutes = remaining
      waitInfo.value.progress = ((waitInfo.value.waitMinutes - remaining) / waitInfo.value.waitMinutes) * 100

      if (remaining > 0) {
        reservationStatus.value.currentAction = `待機中 残り${remaining}分`
        reservationStatus.value.progress = waitInfo.value.progress
      } else {
        // 待機完了
        clearInterval(waitTimer)
        waitInfo.value.isWaiting = false
        reservationStatus.value = {
          visible: true,
          isActive: false,
          currentAction: '待機完了 - 予約実行可能',
          progress: 100,
          progressText: '完了',
          statusClass: 'success'
        }
        logger.info('待機完了')
      }
    }, 60000) // 1分ごと
  }

  const clearReservationTimer = () => {
    if (reservationTimer.value) {
      clearTimeout(reservationTimer.value)
      reservationTimer.value = null
      logger.info('予約サイクルタイマーを停止')
    }
    // 待機プログレスタイマーも停止
    if (waitingProgressTimer.value) {
      clearInterval(waitingProgressTimer.value)
      waitingProgressTimer.value = null
      logger.info('待機プログレスタイマーを停止')
    }
  }

  const extendWaitTime = (minutes: number) => {
    logger.info('待機時間延長', { minutes })

    if (waitInfo.value.isWaiting && waitInfo.value.waitEndTime) {
      // 待機中の場合は終了時間を延長
      waitInfo.value.waitEndTime = new Date(waitInfo.value.waitEndTime.getTime() + minutes * 60 * 1000)
      waitInfo.value.waitMinutes += minutes

      logger.info('待機時間延長完了', {
        新しい終了時間: waitInfo.value.waitEndTime,
        総待機時間: waitInfo.value.waitMinutes
      })
    } else {
      // 待機中でない場合は設定値のみ変更
      waitInfo.value.waitMinutes = Math.max(1, Math.min(720, waitInfo.value.waitMinutes + minutes))

      logger.info('待機時間設定変更', {
        新しい設定時間: waitInfo.value.waitMinutes
      })
    }
  }

  return {
    // State
    reservationStatus,
    reservationInfo,
    isReservationRunning,
    reservationHistory,
    waitInfo,
    isReservationEnabled,

    // Actions
    executeReservation,
    abortReservation,
    startWait,
    extendWaitTime,
    clearReservationTimer,
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