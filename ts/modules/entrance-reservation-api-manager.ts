import { ref, type Ref } from 'vue'
import { loggers } from '@/utils/logger'

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

  // タイマー管理
  private reservationTimer: NodeJS.Timeout | null = null
  private waitingProgressTimer: NodeJS.Timeout | null = null
  private waitingStartTime: number | null = null
  private waitingDuration: number = 0
  private executedReservations = new Set<string>()

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
    }, 100) // 100ms間隔で更新
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

  // 35秒まで待機
  public waitUntil35Seconds(selectedTimeSlots: any[]) {
    if (!this.isReservationRunning.value) return
    
    // 次の35秒まで待機
    const now = new Date()
    const currentSeconds = now.getSeconds()
    const waitTime = currentSeconds <= 35 ? 
      (35 - currentSeconds) * 1000 : 
      (60 + 35 - currentSeconds) * 1000
    
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
  public async executeCycleStep(selectedTimeSlots: any[]) {
    try {
      if (!this.isReservationRunning.value) return

      // 未実行の時間帯のうち、最も優先度の高いものを実行
      const unexecutedSlots = selectedTimeSlots.filter(slot => 
        !this.executedReservations.has(`${slot.gate}-${slot.time}`)
      )

      if (unexecutedSlots.length === 0) {
        // すべて実行済みの場合は60秒後に再実行
        this.scheduleNextCycle(selectedTimeSlots)
        return
      }

      // 最優先の時間帯を選択（優先度の高い順）
      const topPrioritySlot = unexecutedSlots.reduce((prev, current) => 
        (prev.priority > current.priority) ? prev : current
      )
      
      const topPriorityKey = `${topPrioritySlot.gate}-${topPrioritySlot.time}`
      
      this.reservationStatus.value = {
        visible: true,
        isActive: true,
        currentAction: `予約実行中 - ${topPrioritySlot.gate}${topPrioritySlot.time}`,
        progress: 0,
        progressText: '実行中',
        statusClass: ''
      }

      // 実際の予約処理を実行
      logger.info('最優先予約実行開始', { slot: topPrioritySlot })
      this.simulateReservationSteps(topPrioritySlot)
      
      // TODO: 実際のAPI呼び出しに置き換える
      const reservationResult = await this.mockReservationCall(topPrioritySlot)
      
      if (reservationResult.success) {
        // 成功時の処理
        this.executedReservations.add(topPriorityKey)
        this.addToHistory(true, topPrioritySlot.gate, topPrioritySlot.time)
        logger.info('最優先予約成功', { slot: topPrioritySlot, result: reservationResult })
        
        // 予約成功時の処理
        this.isReservationRunning.value = false
        this.clearReservationTimer()
        
        // 日時変更情報を作成
        const originalSlots = this.reservationInfo.value.timeSlots
        const originalSlot = originalSlots.length > 0 ? originalSlots[0] : null
        const originalDateTime = originalSlot ? `${this.reservationInfo.value.date} ${originalSlot.gate}${originalSlot.time}` : this.reservationInfo.value.date
        
        const newDate = this.formatDateForDisplay(new Date())
        const newDateTime = `${newDate} ${topPrioritySlot.gate}${topPrioritySlot.time}`
        
        const dateTimeChange = originalDateTime !== newDateTime ? `${originalDateTime} → ${newDateTime}` : undefined
        
        this.reservationStatus.value = {
          visible: true,
          isActive: false,
          currentAction: `予約成功しました - ${topPrioritySlot.gate}${topPrioritySlot.time}`,
          progress: 100,
          progressText: '完了',
          statusClass: 'success',
          dateChange: dateTimeChange
        }
        
        // 実行時情報は変更しない（元の情報を保持）
        
        // 条件付き追加実行の判定
        await this.executeAdditionalReservations(selectedTimeSlots)
      } else {
        // 失敗時は次のサイクルをスケジュール
        this.addToHistory(false, topPrioritySlot.gate, topPrioritySlot.time)
        logger.warn('最優先予約失敗', { slot: topPrioritySlot, error: reservationResult.error })
        this.scheduleNextCycle(selectedTimeSlots)
      }
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

  // 次のサイクルをスケジュール
  public scheduleNextCycle(selectedTimeSlots: any[]) {
    if (!this.isReservationRunning.value) return
    
    const waitTime = 60 * 1000 // 60秒後
    
    this.reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: '待機中 60秒',
      progress: 0,
      progressText: '待機中',
      statusClass: ''
    }
    
    // 待機時間のプログレスバーを開始
    this.startWaitingProgress(waitTime, '待機中 60秒')
    
    this.reservationTimer = setTimeout(() => {
      this.executeCycleStep(selectedTimeSlots)
    }, waitTime)
  }

  // 条件付き追加実行
  public async executeAdditionalReservations(selectedTimeSlots: any[]) {
    this.reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: '条件付き追加実行判定中',
      progress: 50,
      progressText: '判定中',
      statusClass: ''
    }
    
    // 未実行の時間帯を取得
    const unexecutedSlots = selectedTimeSlots.filter(slot => 
      !this.executedReservations.has(`${slot.gate}-${slot.time}`)
    )
    
    if (unexecutedSlots.length === 0) {
      logger.info('すべての予約が完了しました')
      return
    }
    
    // 条件判定（例：特定の条件下でのみ追加実行）
    const shouldExecuteAdditional = this.shouldExecuteAdditionalReservation(unexecutedSlots)
    
    if (!shouldExecuteAdditional) {
      logger.info('条件付き追加実行：条件を満たさないため終了')
      return
    }
    
    logger.info('条件付き追加実行開始', { slots: unexecutedSlots })
    
    // 優先度順に実行する時間帯を決定（最大3つまで）
    const slotsToExecute = unexecutedSlots
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
    
    for (const [index, slot] of slotsToExecute.entries()) {
      this.reservationStatus.value = {
        visible: true,
        isActive: true,
        currentAction: `追加予約実行中 - ${slot.gate}${slot.time} (${index + 1}/${slotsToExecute.length})`,
        progress: (index / slotsToExecute.length) * 100,
        progressText: `${index + 1}/${slotsToExecute.length}`,
        statusClass: ''
      }
      
      const slotKey = `${slot.gate}-${slot.time}`
      
      try {
        const result = await this.mockReservationCall(slot)
        
        if (result.success) {
          this.executedReservations.add(slotKey)
          this.addToHistory(true, slot.gate, slot.time)
          logger.info('追加実行成功', { slot, result })
          
          // 予約成功時の処理
          this.isReservationRunning.value = false
          this.clearReservationTimer()
          
          // 日時変更情報を作成
          const originalSlots = this.reservationInfo.value.timeSlots
          const originalSlot = originalSlots.length > 0 ? originalSlots[0] : null
          const originalDateTime = originalSlot ? `${this.reservationInfo.value.date} ${originalSlot.gate}${originalSlot.time}` : this.reservationInfo.value.date
          
          const newDate = this.formatDateForDisplay(new Date())
          const newDateTime = `${newDate} ${slot.gate}${slot.time}`
          
          const dateTimeChange = originalDateTime !== newDateTime ? `${originalDateTime} → ${newDateTime}` : undefined
          
          this.reservationStatus.value = {
            visible: true,
            isActive: false,
            currentAction: `予約成功しました - ${slot.gate}${slot.time}`,
            progress: 100,
            progressText: '完了',
            statusClass: 'success',
            dateChange: dateTimeChange
          }
          
          // 最初の成功で終了
          break
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

  // 条件付き追加実行の判定
  private shouldExecuteAdditionalReservation(unexecutedSlots: any[]): boolean {
    // 例：未実行の時間帯が3つ以下の場合のみ実行
    return unexecutedSlots.length <= 3
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
  public async executeReservation(selectedTimeSlots: any[]) {
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
      return
    }

    // 選択された時間帯の検証
    if (selectedTimeSlots.length === 0) {
      logger.warn('選択された時間帯がありません')
      return
    }

    // 予約情報を表示（実行時情報として表示）
    this.reservationInfo.value = {
      visible: true,
      date: this.formatDateForDisplay(new Date()), // 今日の日付を表示用形式で
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

    logger.info('入場予約実行開始', { selectedTimeSlots })

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

  // モック予約API呼び出し
  private async mockReservationCall(slot: any): Promise<{ success: boolean; date?: string; error?: string }> {
    // 実際のAPI呼び出しの代わりのモック
    await new Promise(resolve => setTimeout(resolve, 15000)) // 15秒待機
    
    // ランダムに成功/失敗を決定（70%の確率で成功）
    const success = Math.random() < 0.7
    
    if (success) {
      return {
        success: true,
        date: new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })
      }
    } else {
      return {
        success: false,
        error: '予約に失敗しました'
      }
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
}