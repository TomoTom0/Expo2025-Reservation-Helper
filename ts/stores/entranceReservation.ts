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

// UUID生成関数
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

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
  id: string // UUID for tracking
  status: 'pending' | 'success' | 'failed' // execution status
  date: string
  gate: string
  time: string
  failureReason?: '満席' | '無効' | 'その他'
  timestamp: number // 履歴追加時刻（UnixTime秒）
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
  const selectedDate = ref('')

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

  // 履歴自動削除タイマー
  const historyCleanupTimer = ref<NodeJS.Timeout | null>(null)

  // 目標時間をstoreのattributeとして管理
  const targetUpdateTime = ref<number>(35)

  // 追加目標時間（3個）
  const additionalTargetTimes = ref<number[]>([0, 0, 0])

  // 予約モード（謙虚/貪欲）
  const reservationMode = ref<'humble' | 'greedy'>('humble')

  // 貪欲待機時間（秒）
  const greedyWaitTime = ref<number>(5)

  // 貪欲巡回（目標時間での優先度リセット）
  const greedyCycle = ref<boolean>(true)

  // ユーティリティメソッド
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  // 予約対象の表示用フォーマット（例: "9/29東10:00"）
  const formatReservationTarget = (slot: any): string => {
    const date = new Date(slot.date + 'T00:00:00')
    const month = date.getMonth() + 1
    const day = date.getDate()
    const gate = slot.gate === 'east' ? '東' : slot.gate
    return `${month}/${day}${gate}${slot.time}`
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
    if (time >= 0 && time <= 59) {
      targetUpdateTime.value = time
    }
  }

  // 追加目標時間を取得
  const getAdditionalTargetTimes = (): number[] => {
    return additionalTargetTimes.value
  }

  // 追加目標時間を設定
  const setAdditionalTargetTimes = (times: number[]): void => {
    if (Array.isArray(times) && times.length === 3) {
      additionalTargetTimes.value = times.map(time => Math.max(0, Math.min(59, time)))
    }
  }

  // 予約モードを取得
  const getReservationMode = (): 'humble' | 'greedy' => {
    return reservationMode.value
  }

  // 予約モードを設定
  const setReservationMode = (mode: 'humble' | 'greedy'): void => {
    reservationMode.value = mode
    logger.info('予約モード変更', { mode })
  }

  const getGreedyCycle = (): boolean => {
    return greedyCycle.value
  }

  const setGreedyCycle = (enabled: boolean): void => {
    greedyCycle.value = enabled
    logger.info('貪欲巡回設定', { enabled })
  }


  // 貪欲モード用：統合目標時間リストを生成（5秒未満間隔除外、基準時間は必須）
  const generateTargetTimesList = (): number[] => {
    const mainTime = targetUpdateTime.value // 基準時間（必ず含む）
    const additionalTimes = additionalTargetTimes.value.filter(time => time > 0) // 0は除外

    // 追加時間のみを並び替えて5秒未満間隔をチェック
    const sortedAdditionalTimes = additionalTimes.sort((a, b) => a - b)

    const filteredTimes: number[] = [mainTime] // 基準時間は必ず含む

    for (const time of sortedAdditionalTimes) {
      // 既に含まれている全ての時間との距離をチェック
      let canAdd = true

      for (const existingTime of filteredTimes) {
        const diff = Math.abs(time - existingTime)
        const cyclicDiff = Math.min(diff, 60 - diff) // 60秒での循環を考慮

        if (cyclicDiff < 5) {
          canAdd = false
          logger.info('目標時間省略（5秒未満間隔）', {
            省略時間: time,
            既存時間: existingTime,
            間隔: cyclicDiff
          })
          break
        }
      }

      if (canAdd) {
        filteredTimes.push(time)
      }
    }

    // 最終的に時間順に並び替え
    filteredTimes.sort((a, b) => a - b)


    return filteredTimes
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
      currentAction: `次の${targetUpdateTime.value}秒まで待機中 ${Math.ceil(waitTime / 1000)}秒`,
      progress: 0,
      progressText: '待機中',
      statusClass: ''
    }

    // 待機時間のプログレスバーを開始
    startWaitingProgress(waitTime, `次の${targetUpdateTime.value}秒まで待機中 ${Math.ceil(waitTime / 1000)}秒`)

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

  // 貪欲モード専用：予約実行ロジック（正しい仕様）
  const executeGreedyMode = async (selectedTimeSlots: any[]) => {
    try {
      const targetTimes = generateTargetTimesList()
      let currentPriority = 1


      // 10秒ルール：開始時チェック
      const now = Math.floor(Date.now() / 1000)
      const currentSecond = now % 60
      const nextTargetTime = findNextTargetTime(targetTimes, currentSecond)

      if (nextTargetTime !== null) {
        const timeToNextTarget = calculateTimeToTarget(currentSecond, nextTargetTime)

        if (timeToNextTarget >= 10) {
          logger.info('10秒ルール適用：即座に実行開始')
          // TODO: 共通の予約実行関数を作成して使用
        }
      }

      // メインの予約実行ループ
      await executeGreedyCycle(selectedTimeSlots, targetTimes, currentPriority)

    } catch (error) {
      logger.error('貪欲モード実行エラー', error)
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

  // 貪欲モードのメインサイクル（目標時間ベース）
  const executeGreedyCycle = async (selectedTimeSlots: any[], targetTimes: number[], initialPriority: number) => {
    let currentPriority = 1 // 常に優先度1から開始
    let lastExecutionTime = Date.now()


    // 最初に現在時刻に最も近い目標時間のインデックスを取得
    const now = Math.floor(Date.now() / 1000)
    const currentSecond = now % 60
    const firstTargetTime = findNextTargetTime(targetTimes, currentSecond)
    if (!firstTargetTime) return

    let currentTargetIndex = targetTimes.indexOf(firstTargetTime)

    while (isReservationRunning.value) {
      // 待機中チェック：待機中の場合は予約実行をスキップ
      if (waitInfo.value.isWaiting) {
        logger.info('予約待機中のため実行をスキップ')
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1秒待機してから再チェック
        continue
      }

      const targetTime = targetTimes[currentTargetIndex]
      const nowInLoop = Math.floor(Date.now() / 1000)
      const currentSecondInLoop = nowInLoop % 60
      const timeToTarget = calculateTimeToTarget(currentSecondInLoop, targetTime)


      // 10秒ルール：10秒以上待機時間がある場合は即座に実行
      if (timeToTarget >= 10) {
        logger.info('10秒ルール適用：即座に実行', { timeToTarget })
        const result = await executeReservationsByPriority(selectedTimeSlots, currentPriority)
        lastExecutionTime = Date.now()

        if (result.success) {
          // 予約成功時は停止
          isReservationRunning.value = false
          return
        }

        // 次の優先度は実行した優先度の最大値+1
        const targets = selectedTimeSlots
          .filter(slot => slot.priority >= currentPriority)
          .sort((a, b) => a.priority - b.priority)
          .slice(0, 3)

        if (targets.length > 0) {
          const maxPriority = Math.max(...targets.map(t => t.priority))
          currentPriority = maxPriority + 1
        } else {
          currentPriority = 1 // リセット
        }

        // 貪欲待機時間による実行間隔制御
        const timeSinceLastExecution = Date.now() - lastExecutionTime
        const waitTimeMs = greedyWaitTime.value * 1000
        if (timeSinceLastExecution < waitTimeMs) {
          await new Promise(resolve => setTimeout(resolve, waitTimeMs - timeSinceLastExecution))
        }

        // 10秒ルール適用後も目標時間での処理を続行（continue削除）
      }

      // 目標時間まで待機
      if (timeToTarget > 0) {
        await waitUntilTargetTime(targetTime)
        if (!isReservationRunning.value) return
      }

      // 目標時間到達：必ず優先度リセット処理を実行
      const oldPriority = currentPriority
      if (greedyCycle.value) {
        currentPriority = 1
      } else {
      }

      // 目標時間での実行（待機チェック）
      if (!waitInfo.value.isWaiting) {
        const targetResult = await executeReservationsByPriority(selectedTimeSlots, currentPriority)
        lastExecutionTime = Date.now()

        if (targetResult.success) return

        // 目標時間実行後に五秒待機
        const waitTimeMs = greedyWaitTime.value * 1000
        await new Promise(resolve => setTimeout(resolve, waitTimeMs))
        if (!isReservationRunning.value) return

        // 次の優先度は実行した優先度の最大値+1
        const targets = selectedTimeSlots
          .filter(slot => slot.priority >= currentPriority)
          .sort((a, b) => a.priority - b.priority)
          .slice(0, 3)

        if (targets.length > 0) {
          const maxPriority = Math.max(...targets.map(t => t.priority))
          currentPriority = maxPriority + 1
        } else {
          currentPriority = 1 // リセット
        }
      }

      // 次の目標時間まで継続実行
      while (isReservationRunning.value) {
        // 待機中チェック：待機中の場合は実行をスキップ
        if (waitInfo.value.isWaiting) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }

        // 実行（待機チェック）
        if (!waitInfo.value.isWaiting) {
          const result = await executeReservationsByPriority(selectedTimeSlots, currentPriority)
          lastExecutionTime = Date.now()

          if (result.success) {
          // 予約成功時は停止
          isReservationRunning.value = false
          return
        }

          // 予約実行完了後に五秒待機
          const waitTimeMs = greedyWaitTime.value * 1000
          await new Promise(resolve => setTimeout(resolve, waitTimeMs))
          if (!isReservationRunning.value) return

          // 五秒待機完了後に時間判定
          const nextTargetIndex = (currentTargetIndex + 1) % targetTimes.length
          const nextTargetTimeSecond = targetTimes[nextTargetIndex]
          const nextTargetTimeUnix = calculateNextTargetTimeUnix(nextTargetTimeSecond)
          const nowForCheck = Math.floor(Date.now() / 1000)
          const timeToNextTarget = nextTargetTimeUnix - nowForCheck

          // 次の目標時間まで5秒未満または過ぎている場合は継続実行を終了
          if (timeToNextTarget < 5) {
            break // 次の目標時間に移行
          }

          // 次の優先度は実行した優先度の最大値+1
          const targets = selectedTimeSlots
            .filter(slot => slot.priority >= currentPriority)
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 3)

          if (targets.length > 0) {
            const maxPriority = Math.max(...targets.map(t => t.priority))
            currentPriority = maxPriority + 1
          } else {
            currentPriority = 1 // リセット
          }

        }
      }

      // 継続実行終了後、次の目標時間まで待機
      const oldIndex = currentTargetIndex
      currentTargetIndex = (currentTargetIndex + 1) % targetTimes.length
      const nextTargetTime = targetTimes[currentTargetIndex]


      // 次の目標時間まで待機
      await waitUntilTargetTime(nextTargetTime)
      if (!isReservationRunning.value) return
    }
  }

  // 特定の目標時間まで待機
  const waitUntilTargetTime = async (targetTime: number) => {
    while (isReservationRunning.value) {
      const now = Math.floor(Date.now() / 1000)
      const currentSecond = now % 60
      const timeToTarget = calculateTimeToTarget(currentSecond, targetTime)

      if (timeToTarget <= 0) {
        // 目標時間到達
        break
      }

      // 待機表示
      reservationStatus.value = {
        visible: true,
        isActive: true,
        currentAction: `${targetTime}秒まで待機中 ${timeToTarget}秒`,
        progress: 25,
        progressText: '待機中',
        statusClass: ''
      }

      // 最大1秒待機（精度確保）
      const waitTime = Math.min(timeToTarget * 1000, 1000)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }


  // 優先度ベースで予約を実行（貪欲モード用）
  const executeReservationsByPriority = async (
    selectedTimeSlots: any[],
    startPriority: number
  ): Promise<{ success: boolean }> => {
    // 開始優先度から3つの予約対象を選択
    const targets = selectedTimeSlots
      .filter(slot => slot.priority >= startPriority)
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3)

    if (targets.length === 0) {
      logger.warn('予約対象が見つかりません', { startPriority })
      return { success: false }
    }

    logger.info('優先度ベース予約実行開始', {
      targets: targets.map(t => `${t.priority}:${t.gate}${t.time}`),
      startPriority
    })

    // 予約実行中の表示を更新（モード別表示）
    const mode = getReservationMode()
    let displayAction = '予約実行中'
    if (mode === 'greedy') {
      const minPriority = Math.min(...targets.map(t => t.priority))
      const maxPriority = Math.max(...targets.map(t => t.priority))
      displayAction = `予約実行中 (${minPriority}-${maxPriority})`
    } else {
      // 謙虚モードでは実行対象の詳細表示
      const targetDisplays = targets.map(slot => formatReservationTarget(slot))
      displayAction = `予約実行中 ${targetDisplays.join(' ')}`
    }

    reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: displayAction,
      progress: 50,
      progressText: '実行中',
      statusClass: ''
    }

    // 1秒ずつずらして非同期実行（executeReservationSlotを使用）
    const promises = targets.map((slot, index) =>
      executeReservationSlotWithDelay(slot, index * 1000)
    )

    // 全結果を待機
    const results = await Promise.allSettled(promises)

    // 成功があるかチェック
    let hasSuccess = false
    let successSlot = null
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const slot = targets[i]

      if (result.status === 'fulfilled' && result.value?.success) {
        hasSuccess = true
        successSlot = slot
        logger.info('予約成功検出', { result: result.value, slot: successSlot })

        // 予約成功時の履歴を追加
        reservationHistory.value.unshift({
          id: generateUUID(),
          status: 'success',
          date: slot.date,
          gate: slot.gate,
          time: slot.time,
          timestamp: Date.now()
        })

        // 予約成功時にチケット情報を再取得
        const ticketsStore = useTicketsStore()
        try {
          await ticketsStore.loadAllTickets()
          logger.info('予約成功後のチケット情報再取得完了')
        } catch (error) {
          logger.warn('予約成功後のチケット情報再取得失敗', error)
        }

        // 予約成功時の表示を更新（成功時間も表示）
        const successTime = new Date().toLocaleTimeString('ja-JP', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        reservationStatus.value = {
          visible: true,
          isActive: false,
          currentAction: `予約成功 ${slot.date} ${slot.gate} ${slot.time} (${successTime})`,
          progress: 100,
          progressText: '成功',
          statusClass: 'success'
        }
        break
      }
    }

    return { success: hasSuccess }
  }

  // 指定遅延後にexecuteReservationSlotを実行
  const executeReservationSlotWithDelay = async (slot: any, delayMs: number): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, delayMs))

    if (!isReservationRunning.value) {
      logger.info('予約実行がキャンセルされました')
      return { success: false }
    }

    logger.info('遅延予約実行', { slot: `${slot.gate}${slot.time}`, delayMs })

    return await executeReservationSlot(slot)
  }


  // 次の目標時間を検索
  const findNextTargetTime = (targetTimes: number[], currentSecond: number): number | null => {
    // 現在時刻以降の最初の目標時間
    for (const targetTime of targetTimes) {
      if (targetTime > currentSecond) {
        return targetTime
      }
    }

    // 見つからない場合は次の分の最初の目標時間
    return targetTimes.length > 0 ? targetTimes[0] : null
  }

  // 目標時間までの時間を計算
  const calculateTimeToTarget = (currentSecond: number, targetSecond: number): number => {
    if (targetSecond > currentSecond) {
      return targetSecond - currentSecond
    } else if (targetSecond === currentSecond) {
      return 0  // 同一時刻の場合は0秒
    } else {
      return (60 + targetSecond - currentSecond)
    }
  }

  // 次の目標時間のunixtime計算
  const calculateNextTargetTimeUnix = (targetSecond: number): number => {
    const now = Math.floor(Date.now() / 1000)
    const currentMinute = Math.floor(now / 60) * 60
    const currentSecond = now % 60

    // 今の分での目標時間
    let targetTime = currentMinute + targetSecond

    // 既に過ぎている場合は次の分
    if (targetSecond <= currentSecond) {
      targetTime += 60
    }

    return targetTime
  }

  // 次の分まで待機
  const waitUntilNextMinute = async (): Promise<void> => {
    const now = new Date()
    const currentSecond = now.getSeconds()
    const waitTime = (60 - currentSecond) * 1000

    reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: `次の分まで待機中 ${60 - currentSecond}秒`,
      progress: 0,
      progressText: '待機中',
      statusClass: ''
    }

    await new Promise(resolve => setTimeout(resolve, waitTime))
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
      currentAction: `次の${targetUpdateTime.value}秒まで待機中 ${Math.ceil(waitTime / 1000)}秒`,
      progress: 0,
      progressText: '待機中',
      statusClass: ''
    }

    // 待機時間のプログレスバーを開始
    startWaitingProgress(waitTime, `次の${targetUpdateTime.value}秒まで待機中 ${Math.ceil(waitTime / 1000)}秒`)

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
      currentAction: '最優先予約実行中',
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
        addCompletedToHistory(false, primarySlot.date, primarySlot.gate, primarySlot.time, result.failureReason || 'その他')
        return { success: false, slot: primarySlot, result }
      }
    } catch (error) {
      logger.error('最優先予約実行エラー', error)
      addCompletedToHistory(false, primarySlot.date, primarySlot.gate, primarySlot.time, 'その他')
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

  // 予約開始時に「実行中」エントリを追加
  const addPendingToHistory = (date: string, gate: string, time: string): string => {
    const id = generateUUID()
    const timestamp = Math.floor(Date.now() / 1000)

    reservationHistory.value.unshift({ // 新しいものを上に
      id,
      status: 'pending',
      date,
      gate,
      time,
      timestamp
    })

    logger.info('実行中履歴追加', { id, date, gate, time, timestamp })
    return id
  }

  // 予約完了時にエントリを更新
  const updateHistoryResult = (id: string, success: boolean, failureReason?: '満席' | '無効' | 'その他') => {
    const entry = reservationHistory.value.find(item => item.id === id)
    if (entry) {
      entry.status = success ? 'success' : 'failed'
      entry.failureReason = failureReason

      logger.info('履歴結果更新', { id, success, failureReason })

      // 履歴自動削除タイマーを開始（1分後）
      setTimeout(() => {
        removeExpiredHistory(entry.timestamp)
      }, 60000) // 60秒後
    } else {
      logger.warn('履歴更新対象が見つからない', { id })
    }
  }

  // 新しいパターンでの予約実行（履歴管理付き）
  const executeReservationSlot = async (slot: any): Promise<{ success: boolean; result?: any }> => {
    // 実行開始時に履歴追加
    const historyId = addPendingToHistory(slot.date, slot.gate, slot.time)

    try {
      const result = await callActualReservationAPI(slot)

      // 結果に応じて履歴を更新
      updateHistoryResult(historyId, result.success, result.failureReason)

      return result
    } catch (error) {
      // エラー時は失敗として履歴を更新
      updateHistoryResult(historyId, false, 'その他')
      throw error
    }
  }

  // 旧形式の直接履歴追加（予約結果確定時のみ使用）
  const addCompletedToHistory = (success: boolean, date: string, gate: string, time: string, failureReason?: '満席' | '無効' | 'その他') => {
    const id = generateUUID()
    const timestamp = Math.floor(Date.now() / 1000)

    reservationHistory.value.unshift({ // 新しいものを上に
      id,
      status: success ? 'success' : 'failed',
      date,
      gate,
      time,
      failureReason,
      timestamp
    })

    // 履歴自動削除タイマーを開始（1分後）
    setTimeout(() => {
      removeExpiredHistory(timestamp)
    }, 60000) // 60秒後

    logger.info('履歴追加（直接完了）', { success, date, gate, time, timestamp, 現在の履歴数: reservationHistory.value.length })
  }

  // 期限切れ履歴を削除
  const removeExpiredHistory = (targetTimestamp: number) => {
    const initialCount = reservationHistory.value.length
    reservationHistory.value = reservationHistory.value.filter(item => item.timestamp !== targetTimestamp)
    const removedCount = initialCount - reservationHistory.value.length

    if (removedCount > 0) {
      logger.info('履歴自動削除', { removedCount, targetTimestamp })
    }
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
    addCompletedToHistory(true, slot.date, slot.gate, slot.time)
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
        currentAction: `追加予約実行中 (${index + 1}/${availableSlots.length})`,
        progress: 75 + ((index + 1) / availableSlots.length) * 25,
        progressText: `2/2 追加${index + 1}`,
        statusClass: ''
      }

      const slotKey = `${slot.gate}-${slot.time}`
      executedReservations.value.add(slotKey)

      try {
        const result = await callActualReservationAPI(slot)

        if (result.success) {
          addCompletedToHistory(true, slot.date, slot.gate, slot.time)
          logger.info('追加予約成功', { slot, result })
          // 予約成功時は即座に処理終了
          await handleReservationSuccess(slot, result)
          return
        } else {
          addCompletedToHistory(false, slot.date, slot.gate, slot.time, result.failureReason || 'その他')
          logger.error('追加予約失敗', { slot, result })
        }
      } catch (error) {
        addCompletedToHistory(false, slot.date, slot.gate, slot.time, 'その他')
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
      // 待機中チェック：待機中の場合は処理を開始しない
      if (waitInfo.value.isWaiting) {
        logger.info('予約待機中のため実行を延期')
        reservationStatus.value = {
          visible: true,
          isActive: false,
          currentAction: '待機中 - 実行待ち',
          progress: waitInfo.value.progress,
          progressText: '待機中',
          statusClass: 'waiting'
        }
        return
      }

      // モード判定：謙虚モードと貪欲モードで分岐
      const currentMode = getReservationMode()

      if (currentMode === 'greedy') {
        logger.info('貪欲モードで予約実行開始')
        await executeGreedyMode(timeSlots)
      } else {
        logger.info('謙虚モードで予約実行開始')
        // 従来の35秒まで待機してから実行開始
        await waitUntil35Seconds(timeSlots)
      }
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
      currentAction: '予約中断',
      progress: 0,
      progressText: '中断',
      statusClass: 'cancelled'
    }

    // 実行済みリストもクリアして完全に初期状態に戻す
    executedReservations.value.clear()
  }

  const startWait = () => {
    logger.info('待機開始', { waitMinutes: waitInfo.value.waitMinutes })

    // 進行中の予約実行を停止
    if (reservationTimer.value) {
      clearTimeout(reservationTimer.value)
      reservationTimer.value = null
      logger.info('予約実行タイマーを停止（待機開始）')
    }

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
    waitTimer.value = setInterval(() => {
      const now = new Date()
      const remaining = Math.max(0, Math.ceil((waitInfo.value.waitEndTime!.getTime() - now.getTime()) / (60 * 1000)))

      waitInfo.value.remainingMinutes = remaining
      waitInfo.value.progress = ((waitInfo.value.waitMinutes - remaining) / waitInfo.value.waitMinutes) * 100

      if (remaining > 0) {
        reservationStatus.value.currentAction = `待機中 残り${remaining}分`
        reservationStatus.value.progress = waitInfo.value.progress
      } else {
        // 待機完了
        clearInterval(waitTimer.value!)
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
    // 待機タイマーも停止
    if (waitTimer.value) {
      clearInterval(waitTimer.value)
      waitTimer.value = null
      waitInfo.value.isWaiting = false
      logger.info('待機タイマーを停止')
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
      waitInfo.value.waitMinutes = Math.max(0, Math.min(720, waitInfo.value.waitMinutes + minutes))

      logger.info('待機時間設定変更', {
        新しい設定時間: waitInfo.value.waitMinutes
      })
    }
  }

  // 日付選択処理
  const selectDate = async (dateString: string, options: {
    onMonthChange?: (newMonth: Date) => void,
    onLoadTimeSlots?: (dateString: string) => Promise<void>
  } = {}) => {
    logger.info('カレンダー日付選択詳細', {
      dateString
    })

    selectedDate.value = dateString

    // カレンダーの月を選択日付に連動させる
    const selectedDateObj = new Date(dateString + 'T00:00:00')

    // 月変更のコールバックがあれば実行
    if (options.onMonthChange) {
      const newMonth = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1)
      options.onMonthChange(newMonth)
      logger.info('カレンダー月を選択日付に同期', {
        selectedDate: dateString,
        newMonth: `${selectedDateObj.getFullYear()}年${selectedDateObj.getMonth() + 1}月`
      })
    }

    logger.info('日付選択', { date: dateString })

    // 時間帯データ読み込みのコールバックがあれば実行
    if (options.onLoadTimeSlots) {
      await options.onLoadTimeSlots(dateString)
    }
  }

  return {
    // State
    reservationStatus,
    reservationInfo,
    selectedDate,
    targetUpdateTime,
    additionalTargetTimes,
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
    setTargetUpdateTime,
    getAdditionalTargetTimes,
    setAdditionalTargetTimes,
    getReservationMode,
    setReservationMode,
    getGreedyCycle,
    setGreedyCycle,
    greedyWaitTime,
    generateTargetTimesList,
    selectDate,
    addPendingToHistory,
    updateHistoryResult,
    executeReservationSlot
  }
}, {
  persist: {
    key: 'ytomo-entrance-reservation-store',
    pick: ['targetUpdateTime', 'reservationInfo', 'additionalTargetTimes', 'reservationMode', 'greedyCycle']
  }
})