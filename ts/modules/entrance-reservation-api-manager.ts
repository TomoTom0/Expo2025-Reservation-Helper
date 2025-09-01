import { ref, type Ref } from 'vue'
import { loggers } from '@/utils/logger'
import { useTicketsStore } from '@/stores/tickets'

const logger = loggers.entranceReservation

// 実行情報の型定義
export interface ReservationStatus {
  visible: boolean
  isActive: boolean
  currentAction: string
  progress: number
  progressText: string
  statusClass: string
  dateChange?: string
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

export class EntranceReservationApiManager {
  // 状態管理
  public reservationStatus: Ref<ReservationStatus>
  public reservationInfo: Ref<ReservationInfo>
  public isReservationRunning: Ref<boolean>
  public reservationHistory: Ref<ReservationResult[]>
  
  // 選択解除用のコールバック
  private clearSelectionCallback: (() => void) | null = null

  // 既存予約ID（変更予約の場合に使用）
  private existingReservationId: number | null = null

  // タイマー管理
  private reservationTimer: NodeJS.Timeout | null = null
  private waitingProgressTimer: NodeJS.Timeout | null = null
  private waitingStartTime: number | null = null
  private waitingDuration: number = 0
  private executedReservations = new Set<string>()
  private flag_first = ref(true)

  constructor() {
    this.reservationStatus = ref({
      visible: false,
      isActive: false,
      currentAction: '',
      progress: 0,
      progressText: '',
      statusClass: '',
      dateChange: undefined
    })

    this.reservationInfo = ref({
      visible: false,
      date: '',
      timeSlots: [],
      completed: false
    })

    this.isReservationRunning = ref(false)
    this.reservationHistory = ref([])
  }

  // 待機時間プログレスバーの開始
  private startWaitingProgress(durationMs: number, actionText: string) {
    this.waitingStartTime = Date.now()
    this.waitingDuration = durationMs
    
    // 既存のタイマーをクリア
    if (this.waitingProgressTimer) {
      clearInterval(this.waitingProgressTimer)
    }
    
    // プログレスバーを定期的に更新
    this.waitingProgressTimer = setInterval(() => {
      if (!this.waitingStartTime || !this.reservationStatus.value.visible) {
        clearInterval(this.waitingProgressTimer!)
        this.waitingProgressTimer = null
        return
      }
      
      const elapsed = Date.now() - this.waitingStartTime
      const remaining = Math.max(0, this.waitingDuration - elapsed)
      const progress = Math.min(100, (elapsed / this.waitingDuration) * 100)
      
      this.reservationStatus.value.progress = progress
      this.reservationStatus.value.progressText = `${Math.floor(progress)}%`
      this.reservationStatus.value.currentAction = `待機中 ${Math.ceil(remaining / 1000)}秒`
      
      // 待機時間終了
      if (remaining <= 0) {
        clearInterval(this.waitingProgressTimer!)
        this.waitingProgressTimer = null
        this.waitingStartTime = null
      }
    }, 500) // 500ms間隔で更新
  }

  // 待機プログレスバーのクリア
  private clearWaitingProgress() {
    if (this.waitingProgressTimer) {
      clearInterval(this.waitingProgressTimer)
      this.waitingProgressTimer = null
    }
    this.waitingStartTime = null
    this.waitingDuration = 0
  }

  // サイクル処理を停止
  public clearReservationTimer() {
    if (this.reservationTimer) {
      clearTimeout(this.reservationTimer)
      this.reservationTimer = null
    }
    this.clearWaitingProgress()
    this.executedReservations.clear()
  }

  // 予約履歴をクリア
  public clearReservationHistory() {
    this.reservationHistory.value = []
    logger.info('予約履歴をクリアしました')
  }

  // 35秒まで待機
  public async waitUntil35Seconds(selectedTimeSlots: any[]) {
    if (!this.isReservationRunning.value) return
    
    // 次の35秒まで待機
    const now = new Date()
    const currentSeconds = now.getSeconds()
    const waitTime = currentSeconds <= 35 ? 
      (35 - currentSeconds) * 1000 : 
      (60 + 35 - currentSeconds) * 1000
    
    // 初回のみ：10秒以上の待機時間の場合は即座に1回実行
    if (this.flag_first.value && waitTime >= 10000) {
      logger.info('初回実行：10秒以上の待機時間のため即座に実行開始', { waitTime })
      this.flag_first.value = false
      
      // 即座にサイクルステップを実行
      await this.executeCycleStep(selectedTimeSlots)
      
      // 実行後は通常通り次の35秒まで待機してから継続
      return
    }
    
    this.reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: `待機中 ${Math.ceil(waitTime / 1000)}秒`,
      progress: 0,
      progressText: '待機中',
      statusClass: ''
    }
    
    // 待機時間のプログレスバーを開始
    this.startWaitingProgress(waitTime, `待機中 ${Math.ceil(waitTime / 1000)}秒`)
    
    this.reservationTimer = setTimeout(() => {
      this.executeCycleStep(selectedTimeSlots)
    }, waitTime)
  }

  // サイクルステップを実行（毎分35秒に実行）
  // 正しい仕様に基づくexecuteCycleStep実装
  public async executeCycleStep(selectedTimeSlots: any[]) {
    try {
      if (!this.isReservationRunning.value) {
        logger.info('予約実行がキャンセルされました')
        return
      }

      // 1. 並行実行：最優先の予約実行 と 空き情報取得
      const availabilityData = await this.executeParallelTasks(selectedTimeSlots)
      
      if (!this.isReservationRunning.value) return

      // 2. 条件付き追加実行（最大2つの目標）
      await this.executeAdditionalReservations(selectedTimeSlots, availabilityData)
      
      if (!this.isReservationRunning.value) return

      // 3. 次の分の35秒まで待機
      this.scheduleNextMinute35(selectedTimeSlots)

      
    } catch (error) {
      logger.error('サイクルステップエラー', error)
      this.reservationStatus.value = {
        visible: true,
        isActive: false,
        currentAction: 'エラーが発生しました',
        progress: 0,
        progressText: 'エラー',
        statusClass: 'error'
      }
    }
  }

  // 並行実行：最優先予約実行 と 空き情報取得
  private async executeParallelTasks(selectedTimeSlots: any[]) {
    const topPrioritySlot = selectedTimeSlots.find(slot => 
      !this.executedReservations.has(`${slot.gate}-${slot.time}`) &&
      slot.priority === 1
    )

    if (!topPrioritySlot) return

    // 並行実行（EntranceTab.vueと同じ関数を使用）
    const [reservationResult, availabilityData] = await Promise.all([
      this.executeTopPriorityReservation(topPrioritySlot),
      this.getAvailabilityInfo()
    ])
    
    logger.info('並行実行完了', { 
      reservationSuccess: reservationResult?.success, 
      availabilityDataReceived: !!availabilityData 
    })

    // 空き情報取得でstoreは既に更新済み（getEntranceScheduleDataで強制更新実行）
    logger.info('空き情報取得完了（store更新済み）', { availabilityDataReceived: !!availabilityData })

    if (reservationResult?.success) {
      // 予約成功時の処理
      this.handleReservationSuccess(topPrioritySlot, reservationResult)
    } else if (reservationResult?.error) {
      this.addToHistory(false, topPrioritySlot.gate, topPrioritySlot.time)
    }
    
    // 空き情報を返す
    return availabilityData
  }

  // 最優先予約の実行
  private async executeTopPriorityReservation(slot: any) {
    if (!this.isReservationRunning.value) return null

    const slotKey = `${slot.gate}-${slot.time}`
    this.reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: `最優先予約実行中 - ${slot.gate}${slot.time}`,
      progress: 25,
      progressText: '実行中',
      statusClass: ''
    }

    try {
      const result = await this.callActualReservationAPI(slot)
      
      if (result.success) {
        this.executedReservations.add(slotKey)
        this.addToHistory(true, slot.gate, slot.time)
      }
      
      return result
    } catch (error) {
      logger.error('最優先予約実行エラー', error)
      return { success: false, error: (error as Error).message }
    }
  }

  // 空き情報取得（EntranceTab.vueと同じ実装）
  private async getAvailabilityInfo() {
    try {
      const targetDate = this.reservationInfo.value.date // MM/DD形式
      if (!targetDate) return null
      
      const month = parseInt(targetDate.split('/')[0])
      const year = new Date().getFullYear() // MM/DD形式には年がないので現在年を使用
      
      // EntranceTab.vueと同じ関数を使用
      const ticketsStore = useTicketsStore()
      const scheduleData = await ticketsStore.getEntranceScheduleData(year, month, true)
      
      // 指定日の時間帯情報を取得（EntranceTab.vueと同じ処理）
      const dayOfMonth = targetDate.split('/')[1].padStart(2, '0') // MM/DD → DD（0埋め）
      const dayData = scheduleData?.states?.[dayOfMonth]
      
      logger.info('空き情報取得結果', { year, month, dayOfMonth, hasDayData: !!dayData })
      return dayData
      
    } catch (error) {
      logger.error('空き情報取得エラー', error)
      return null
    }
  }

  // 予約成功時の処理
  private handleReservationSuccess(slot: any, result: any) {
    this.isReservationRunning.value = false
    this.clearReservationTimer()
    
    // 変更前後の情報を正しく設定
    const originalDateTime = this.reservationInfo.value.timeSlots.length > 0 
      ? `${this.reservationInfo.value.date} ${this.reservationInfo.value.timeSlots[0].gate}${this.reservationInfo.value.timeSlots[0].time}`
      : this.reservationInfo.value.date
    
    // 変更後の情報（予約対象の日付を使用）
    const newDateTime = `${this.reservationInfo.value.date} ${slot.gate}${slot.time}`
    
    const dateTimeChange = originalDateTime !== newDateTime ? `${originalDateTime} → ${newDateTime}` : undefined
    
    this.reservationStatus.value = {
      visible: true,
      isActive: false,
      currentAction: '予約が完了しました',
      progress: 100,
      progressText: '完了',
      statusClass: 'success',
      dateChange: dateTimeChange
    }
    
    // 選択解除コールバックを実行
    if (this.clearSelectionCallback) {
      this.clearSelectionCallback()
    }
  }

  // 次の分の35秒まで待機
  private async scheduleNextMinute35(selectedTimeSlots: any[]) {
    if (!this.isReservationRunning.value) return
    
    const now = new Date()
    const currentMinute = now.getMinutes()
    const currentSecond = now.getSeconds()
    
    // 次の35秒までの待機時間を計算（5-65秒の範囲）
    let waitTimeSeconds = (35 - currentSecond + 60) % 60
    if (waitTimeSeconds < 5) {
      waitTimeSeconds += 60  // 5秒未満の場合は次の分まで待機
    }
    const waitTimeMs = waitTimeSeconds * 1000
    
    // 初回実行は waitUntil35Seconds で処理済み
    
    // flag_firstをfalseに設定（2回目以降の実行）
    this.flag_first.value = false
    
    this.reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: `待機中 ${Math.ceil(waitTimeMs / 1000)}秒`,
      progress: 0,
      progressText: '待機中',
      statusClass: ''
    }
    
    this.startWaitingProgress(waitTimeMs, `待機中 ${Math.ceil(waitTimeMs / 1000)}秒`)
    
    this.reservationTimer = setTimeout(() => {
      if (this.isReservationRunning.value) {
        this.executeCycleStep(selectedTimeSlots)
      }
    }, waitTimeMs)
  }

  // 条件付き追加実行
  public async executeAdditionalReservations(selectedTimeSlots: any[], availabilityData: any = null) {
    // 未実行の時間帯のうち、満員でない時間帯から優先度の高い順に最大2つを取得（最優先のpriority=1を除く）
    const unexecutedSlots = selectedTimeSlots
      .filter(slot => {
        // 基本条件：未実行かつ最優先でない
        if (this.executedReservations.has(`${slot.gate}-${slot.time}`) || slot.priority === 1) {
          return false
        }
        
        // 空き情報がある場合は満員でないかチェック（EntranceTab.vueと同じ構造）
        if (availabilityData) {
          const gateKey = slot.gate === '東' ? '1' : '2'
          const timeKey = this.convertTimeToAPIFormat(slot.time)
          
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
      if (!this.isReservationRunning.value) return
      
      this.reservationStatus.value = {
        visible: true,
        isActive: true,
        currentAction: `追加予約実行中 - ${slot.gate}${slot.time} (${index + 1}/${unexecutedSlots.length})`,
        progress: 50 + (index / unexecutedSlots.length) * 25,
        progressText: `追加${index + 1}/${unexecutedSlots.length}`,
        statusClass: ''
      }
      
      const slotKey = `${slot.gate}-${slot.time}`
      
      try {
        const result = await this.callActualReservationAPI(slot)
        
        if (result.success) {
          this.executedReservations.add(slotKey)
          this.addToHistory(true, slot.gate, slot.time)
          logger.info('追加実行成功', { slot, result })
          
          // 予約成功時は全体処理を完了
          this.handleReservationSuccess(slot, result)
          return
        } else {
          this.addToHistory(false, slot.gate, slot.time)
          logger.warn('予約失敗', { 
            日時: `${slot.date} ${slot.gate}ゲート ${slot.time}`,
            理由: result.error || '予約実行に失敗しました'
          })
          // 失敗した場合は次のスロットを試行
          continue
        }
      } catch (error) {
        logger.error('追加実行エラー', { slot, error })
        continue
      }
    }
  }


  // 予約結果を履歴に追加
  private addToHistory(success: boolean, gate: string, time: string) {
    const result: ReservationResult = {
      success,
      gate,
      time
    }
    
    // 最新の結果を先頭に追加し、3つまでに制限
    this.reservationHistory.value.unshift(result)
    if (this.reservationHistory.value.length > 3) {
      this.reservationHistory.value = this.reservationHistory.value.slice(0, 3)
    }
  }

  // 日付を表示用形式（8/31形式）でフォーマット
  private formatDateForDisplay(date: Date): string {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  // 予約実行を開始
  public async executeReservation(selectedTimeSlots: any[], selectedDate?: string, existingReservationId?: number | null, originalReservationInfo?: any) {
    // 既存予約IDを保存
    this.existingReservationId = existingReservationId || null
    
    if (this.isReservationRunning.value) {
      // 予約中断処理
      this.isReservationRunning.value = false
      this.clearReservationTimer()
      this.reservationStatus.value = {
        visible: true,
        isActive: false,
        currentAction: '予約を中断しました',
        progress: 0,
        progressText: '中断',
        statusClass: 'cancelled'
      }
      
      // 実行済みリストもクリアして完全に初期状態に戻す
      this.executedReservations.clear()
      
      logger.info('予約処理を中断しました')
      return
    }

    // 選択された時間帯の検証
    if (selectedTimeSlots.length === 0) {
      logger.warn('選択された時間帯がありません')
      return
    }

    // 予約開始時に履歴をクリア
    this.clearReservationHistory()

    // flag_firstを予約開始時にtrueにリセット
    this.flag_first.value = true

    // 選択日付を使用（フォールバックとして今日の日付）
    const targetDate = selectedDate || new Date().toISOString().split('T')[0]
    
    // 予約情報を表示（実行時情報として表示）
    this.reservationInfo.value = {
      visible: true,
      date: this.formatDateForDisplay(new Date(targetDate + 'T00:00:00')),
      timeSlots: originalReservationInfo ? [originalReservationInfo] : selectedTimeSlots,
      completed: false
    }

    // 予約実行状態を開始
    this.isReservationRunning.value = true
    this.reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: '予約実行準備中',
      progress: 0,
      progressText: '準備中',
      statusClass: ''
    }

    logger.info('入場予約実行開始', { selectedTimeSlots, targetDate })

    try {
      // 35秒まで待機してから実行開始
      this.waitUntil35Seconds(selectedTimeSlots)
    } catch (error) {
      logger.error('予約実行エラー', error)
      this.isReservationRunning.value = false
      this.clearReservationTimer()
      this.reservationStatus.value = {
        visible: true,
        isActive: false,
        currentAction: 'エラーが発生しました',
        progress: 0,
        progressText: 'エラー',
        statusClass: 'error'
      }
    }
  }

  // 予約処理のシミュレーション（段階的進行）
  private simulateReservationSteps(slot: any) {
    const stages = [
      { action: 'アクセス中...', progress: 20, progressText: '1/5' },
      { action: 'ページ遷移中...', progress: 40, progressText: '2/5' },
      { action: '予約フォーム入力中...', progress: 60, progressText: '3/5' },
      { action: '送信中...', progress: 80, progressText: '4/5' },
      { action: '結果確認中...', progress: 100, progressText: '5/5' }
    ]

    stages.forEach((stage, index) => {
      setTimeout(() => {
        if (this.reservationStatus.value.visible) {
          this.reservationStatus.value.currentAction = stage.action
          this.reservationStatus.value.progress = stage.progress
          this.reservationStatus.value.progressText = stage.progressText
          
          if (index === stages.length - 1) {
            // 最後のステージ後、実行結果確認中に変更
            setTimeout(() => {
              if (this.reservationStatus.value.visible) {
                this.reservationStatus.value.currentAction = '実行結果確認中...'
                this.reservationStatus.value.isActive = true
                this.reservationStatus.value.progress = 100
                this.reservationStatus.value.progressText = '確認中'
              }
            }, 2000)
          }
        }
      }, (index + 1) * 3000)
    })
  }

  // 実際の万博予約API呼び出し
  private async callActualReservationAPI(slot: any): Promise<{ success: boolean; date?: string; error?: string; reservationIds?: number[] }> {
    try {
      // 選択されたチケットIDを取得
      const selectedTickets = Array.from(this.getSelectedTicketIds())
      if (selectedTickets.length === 0) {
        return { success: false, error: '選択されたチケットがありません' }
      }
      
      // 日付を取得（reservationInfo.dateから）MM/DD形式をYYYYMMDD形式に変換
      const rawDate = this.reservationInfo.value.date // MM/DD形式
      const currentYear = new Date().getFullYear()
      const [month, day] = rawDate.split('/')
      const entranceDate = `${currentYear}${month.padStart(2, '0')}${day.padStart(2, '0')}`
      const gateType = slot.gate === '東' ? '1' : '2'
      
      logger.info('万博予約API呼び出し開始', {
        ticketIds: selectedTickets,
        rawDate,
        entranceDate,
        time: slot.time,
        gateType,
        slot
      })
      
      // 新規予約か変更予約かを判定
      const isChangeReservation = this.existingReservationId && this.existingReservationId > 0
      const method = isChangeReservation ? 'PUT' : 'POST'
      
      let body: any
      if (isChangeReservation) {
        // 変更予約（PUT）のパラメータ
        body = {
          user_visiting_reservation_ids: [this.existingReservationId],
          start_time: this.convertTimeToAPIFormat(slot.time),
          gate_type: gateType,
          entrance_date: entranceDate
        }
      } else {
        // 新規予約（POST）のパラメータ
        body = {
          ticket_ids: selectedTickets,
          start_time: this.convertTimeToAPIFormat(slot.time),
          gate_type: gateType,
          entrance_date: entranceDate
        }
      }

      const response = await fetch('/api/d/user_visiting_reservations', {
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
        
        // verified-api-analysis.mdに基づく成功判定
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
          // 予約変更：doing: false + マイチケット確認（ドキュメント必須要件）
          if (result.doing === false) {
            logger.info('予約変更申請完了 - マイチケット確認開始', { waitTime: '2秒' })
            await new Promise(resolve => setTimeout(resolve, 2000))
            // 既存予約IDが変更されているかマイチケット情報で確認
            const confirmationResult = await this.confirmReservationSuccess([body.user_visiting_reservation_ids[0]])
            if (confirmationResult.confirmed) {
              return { 
                success: true, 
                date: entranceDate
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
              error: '予約変更申請が完了していません' 
            }
          }
        }
      } else {
        const error = await response.json()
        logger.warn('予約失敗', { 
          日時: `${slot.date} APIレベル`,
          理由: error.message || 'API呼び出しに失敗しました'
        })
        
        // エラー時も一定時間待機してから次の処理へ
        logger.info('エラー後待機開始', { waitTime: '1秒' })
        await new Promise(resolve => setTimeout(resolve, 1000))
        logger.info('エラー後待機完了')
        
        return { 
          success: false, 
          error: error.message || '予約に失敗しました' 
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

  // verified-api-analysis.md必須要件：マイチケット情報で実際の予約変更を確認
  private async confirmReservationSuccess(reservationIds: number[]): Promise<{ confirmed: boolean; error?: string }> {
    try {
      logger.info('予約確認開始', { reservationIds })
      
      const response = await fetch('/api/d/my/tickets/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
        }
      })
      
      if (!response.ok) {
        return { confirmed: false, error: 'マイチケット情報の取得に失敗しました' }
      }
      
      const ticketsData = await response.json()
      
      // 新規作成された予約IDがマイチケット情報に含まれているかチェック
      const allReservationIds = ticketsData.list.flatMap((ticket: any) => 
        ticket.schedules?.map((schedule: any) => schedule.user_visiting_reservation_id) || []
      )
      
      const allConfirmed = reservationIds.every(id => allReservationIds.includes(id))
      
      if (allConfirmed) {
        logger.info('予約確認成功', { reservationIds, confirmed: true })
        return { confirmed: true }
      } else {
        logger.warn('予約確認失敗', { reservationIds, allReservationIds, confirmed: false })
        return { confirmed: false, error: '作成された予約IDがマイチケット情報に見つかりませんでした' }
      }
      
    } catch (error) {
      logger.error('予約確認エラー', error)
      return { confirmed: false, error: '予約確認処理でエラーが発生しました' }
    }
  }

  // 時間表示形式をAPI形式に変換（ドキュメントの実証済みマッピング）
  private convertTimeToAPIFormat(time: string): string {
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
  
  // 選択されたチケットIDを取得するヘルパーメソッド
  private getSelectedTicketIds(): string[] {
    try {
      const ticketsStore = useTicketsStore()
      return ticketsStore.selectedTickets.map(ticket => ticket.ticket_id)
    } catch (error) {
      logger.error('選択チケットID取得エラー', error)
      return []
    }
  }

  // 状態リセット
  public resetState() {
    this.isReservationRunning.value = false
    this.clearReservationTimer()
    this.reservationStatus.value = {
      visible: false,
      isActive: false,
      currentAction: '',
      progress: 0,
      progressText: '',
      statusClass: ''
    }
    this.reservationInfo.value = {
      visible: false,
      date: '',
      timeSlots: [],
      completed: false
    }
    this.executedReservations.clear()
    this.reservationHistory.value = []
  }

  // 選択解除用コールバックを設定
  public setClearSelectionCallback(callback: () => void) {
    this.clearSelectionCallback = callback
  }
}