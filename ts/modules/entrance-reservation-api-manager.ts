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
  timestamp: string
}

export class EntranceReservationApiManager {
  // 状態管理
  public reservationStatus: Ref<ReservationStatus>
  public reservationInfo: Ref<ReservationInfo>
  public isReservationRunning: Ref<boolean>
  public reservationHistory: Ref<ReservationResult[]>
  
  // 選択解除用のコールバック
  private clearSelectionCallback: (() => void) | null = null

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

    // 並行実行
    const [reservationResult, availabilityData] = await Promise.all([
      this.executeTopPriorityReservation(topPrioritySlot),
      this.refreshAvailabilityInfo()
    ])
    
    logger.info('並行実行完了', { 
      reservationSuccess: reservationResult?.success, 
      availabilityDataReceived: !!availabilityData 
    })

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

  // 空き情報取得
  private async refreshAvailabilityInfo() {
    try {
      logger.info('空き情報取得実行中')
      
      // 現在の年月を取得
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      
      // 入場予約スケジュール取得API呼び出し
      const response = await fetch(`/api/d/schedules/${year}/${month}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
        }
      })
      
      if (response.ok) {
        const scheduleData = await response.json()
        logger.info('空き情報取得成功', { year, month, dataSize: JSON.stringify(scheduleData).length })
        return scheduleData
      } else {
        logger.warn('空き情報取得失敗', { status: response.status, year, month })
        return null
      }
    } catch (error) {
      logger.error('空き情報取得エラー', error)
      return null
    }
  }

  // 予約成功時の処理
  private handleReservationSuccess(slot: any, result: any) {
    this.isReservationRunning.value = false
    this.clearReservationTimer()
    
    const originalSlots = this.reservationInfo.value.timeSlots
    const originalSlot = originalSlots.length > 0 ? originalSlots[0] : null
    const originalDateTime = originalSlot ? `${this.reservationInfo.value.date} ${originalSlot.gate}${originalSlot.time}` : this.reservationInfo.value.date
    
    const newDate = this.formatDateForDisplay(new Date())
    const newDateTime = `${newDate} ${slot.gate}${slot.time}`
    
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
    
    // 次の分の35秒までの待機時間を計算
    const waitTimeMs = ((60 - currentSecond) + 35) * 1000
    
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
        
        // 空き情報がある場合は満員でないかチェック
        if (availabilityData && availabilityData.states) {
          const dateKey = this.reservationInfo.value.date.split('/')[1] // MM/DD → DD
          const gateKey = slot.gate === '東' ? '1' : '2'
          const timeKey = this.convertTimeToAPIFormat(slot.time)
          
          const timeState = availabilityData.states[dateKey]?.[gateKey]?.[timeKey]?.time_state
          // time_state: 0=空きあり, 1=残り少ない, 2=満席, 4=利用不可
          // 満席(2)と利用不可(4)は除外
          if (timeState === 2 || timeState === 4) {
            logger.info('満員/利用不可のため追加実行から除外', { slot, timeState })
            return false
          }
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
          logger.warn('追加実行失敗', { slot, error: result.error })
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
      time,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
  public async executeReservation(selectedTimeSlots: any[], selectedDate?: string) {
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
      timeSlots: selectedTimeSlots,
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
      
      // 日付を取得（reservationInfo.dateから）
      const entranceDate = this.reservationInfo.value.date
      const gateType = slot.gate === '東' ? '1' : '2'
      
      logger.info('万博予約API呼び出し開始', {
        ticketIds: selectedTickets,
        entranceDate,
        time: slot.time,
        gateType,
        slot
      })
      
      const response = await fetch('/api/d/user_visiting_reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
          'X-Api-Lang': 'ja'
        },
        body: JSON.stringify({
          ticket_ids: selectedTickets,
          start_time: slot.time,
          gate_type: gateType,
          entrance_date: entranceDate.replace(/[\/\-]/g, '') // MM/DD or YYYY-MM-DD → YYYYMMDD
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        logger.info('予約API成功', result)
        
        // verified-api-analysis.mdに基づく予約成功判定
        logger.info('予約API結果確認', { hasReservationIds: !!result.user_visiting_reservation_ids, idsLength: result.user_visiting_reservation_ids?.length })
        if (result.user_visiting_reservation_ids && result.user_visiting_reservation_ids.length > 0) {
          logger.info('結果確認待機開始', { waitTime: '2秒' })
          // API成功後、サーバー処理完了を待ってマイチケット情報で実際の変更を確認（ドキュメント必須要件）
          await new Promise(resolve => setTimeout(resolve, 2000)) // 2秒待機
          logger.info('結果確認待機完了')
          const confirmationResult = await this.confirmReservationSuccess(result.user_visiting_reservation_ids)
          if (confirmationResult.confirmed) {
            return { 
              success: true, 
              date: entranceDate,
              reservationIds: result.user_visiting_reservation_ids
            }
          } else {
            return { 
              success: false, 
              error: '予約APIは成功しましたが、実際の予約が確認できませんでした' 
            }
          }
        } else {
          return { 
            success: false, 
            error: '予約IDが取得できませんでした（予約が作成されていません）' 
          }
        }
      } else {
        const error = await response.json()
        logger.warn('予約API失敗', error)
        
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
      
      const response = await fetch('/api/d/my/tickets/?count=1', {
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

  // 時間表示形式をAPI形式に変換（例：11:00 → 1000）
  private convertTimeToAPIFormat(time: string): string {
    return time.replace(':', '')
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