<template>
  <div class="ytomo-others-tab">
    <!-- 拡張機能設定セクション -->
    <div class="ytomo-section">
      <h3 class="ytomo-section-title">拡張機能設定</h3>
      
      <div class="ytomo-setting-item">
        <label class="ytomo-setting-label">API利用</label>
        <select 
          class="ytomo-select-inline"
          v-model="apiUsageMode"
          @change="handleApiUsageChange"
        >
          <option value="full">あり</option>
          <option value="suppressed">抑制</option>
          <option value="none">なし</option>
        </select>
      </div>
      
      <div class="ytomo-setting-item ytomo-target-time-setting">
        <label class="ytomo-setting-label">入場予約実行目標秒時間</label>

        <!-- 1行目：既存の目標時間設定 -->
        <div class="ytomo-main-target-row">
          <input
            type="number"
            class="ytomo-input-inline"
            v-model.number="mainTargetTime"
            @input="updateMainTargetTime"
            min="0"
            max="59"
            placeholder="目標時間"
            style="width: 60px;"
          >
          <span class="ytomo-setting-unit">秒</span>
        </div>

        <!-- 2行目：自動ボタン + 3つの追加時間 -->
        <div class="ytomo-additional-target-row">
          <button
            @click="generateAutoTimes"
            class="ytomo-auto-btn"
            title="目標時間から15秒ずつずれた時間を自動生成"
          >
            自動
          </button>
          <input
            v-for="(time, index) in additionalTimes"
            :key="index"
            type="number"
            class="ytomo-input-inline ytomo-additional-time"
            v-model.number="additionalTimes[index]"
            @input="updateAdditionalTimes"
            min="0"
            max="59"
            :placeholder="`+${index + 1}`"
            style="width: 50px;"
          >
        </div>
      </div>
    </div>
    
    <!-- 調査機能セクション -->
    <div v-if="apiUsageMode !== 'none'" class="ytomo-section">
      <h3 class="ytomo-section-title">タイミング調査</h3>
      
      <div class="ytomo-investigation-section">
        <p class="ytomo-description">
          入場予約システムの空き情報更新タイミングを調査し、最適な予約実行時間を見つけます。
        </p>
        
        <div class="ytomo-investigation-controls">
          <button 
            class="ytomo-investigate-button" 
            :class="{ 'cancel-mode': othersStore.isInvestigationRunning }"
            @click="executeInvestigation"
          >
            <span v-if="othersStore.isInvestigationRunning" class="ytomo-loading-icon">⏳</span>
            {{ othersStore.isInvestigationRunning ? '調査中断' : '調査' }}
          </button>
          
        </div>
        
        <!-- 調査状況表示 -->
        <div v-if="othersStore.isInvestigationRunning || othersStore.investigationStatusText" class="ytomo-investigation-status">
          <div class="ytomo-status-content">
            <div v-if="othersStore.isInvestigationRunning" class="ytomo-status-icon spinning">
              <svg viewBox="0 0 24 24">
                <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
              </svg>
            </div>
            <div class="ytomo-status-details">
              <div v-if="othersStore.phaseLabel" class="ytomo-phase-info">
                <span class="phase-label">{{ othersStore.phaseLabel }}</span>
                <span class="detection-info">{{ othersStore.detectionDisplay }}</span>
              </div>
              <div v-if="othersStore.investigationWaitingText" class="ytomo-waiting-info">{{ othersStore.investigationWaitingText }}</div>
              <div class="ytomo-status-current">{{ othersStore.investigationStatusText }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOthersStore } from '@/stores/others'
import { useTicketsStore } from '@/stores/tickets'
import { useEntranceReservationStore } from '@/stores/entranceReservation'
import { loggers } from '@/utils/logger'
import { logApiUsageModeChange, type ApiUsageMode } from '@/utils/apiUsageMode'

const logger = loggers.ui
const othersStore = useOthersStore()
const ticketsStore = useTicketsStore()
const entranceStore = useEntranceReservationStore()

// API利用設定
const apiUsageMode = ref('none')

// メイン目標時間
const mainTargetTime = ref<number>(entranceStore.targetUpdateTime || 35)

// 追加時間（3個）
const additionalTimes = ref<number[]>([0, 0, 0])

// 調査開始可能かどうか
const canStartInvestigation = computed(() => {
  return !othersStore.isInvestigationRunning
})

// API利用変更ハンドラ
const handleApiUsageChange = () => {
  logger.info('API利用モード変更', { apiUsageMode: apiUsageMode.value })
  localStorage.setItem('ytomo-api-usage-mode', apiUsageMode.value)
  
  // 設定変更をログに記録
  logApiUsageModeChange(apiUsageMode.value as ApiUsageMode)
  
  // CustomEventでMainDialogなど他のコンポーネントに通知
  const event = new CustomEvent('ytomo-api-usage-mode-changed', {
    detail: { newMode: apiUsageMode.value }
  })
  window.dispatchEvent(event)
}

// メイン目標時間更新
const updateMainTargetTime = () => {
  entranceStore.setTargetUpdateTime(mainTargetTime.value)
  localStorage.setItem('ytomo-main-target-time', mainTargetTime.value.toString())

  logger.info('メイン目標時間更新', {
    mainTargetTime: mainTargetTime.value
  })
}

// 追加時間更新
const updateAdditionalTimes = () => {
  // 入場予約storeに追加時間を保存
  entranceStore.setAdditionalTargetTimes(additionalTimes.value)
  localStorage.setItem('ytomo-additional-times', JSON.stringify(additionalTimes.value))

  logger.info('追加時間更新', {
    additionalTimes: additionalTimes.value
  })
}

// 自動時間生成
const generateAutoTimes = () => {
  const baseTime = mainTargetTime.value
  additionalTimes.value = [
    (baseTime + 15) % 60,
    (baseTime + 30) % 60,
    (baseTime + 45) % 60
  ]
  updateAdditionalTimes()

  logger.info('自動時間生成', {
    baseTime,
    generatedTimes: additionalTimes.value
  })
}

// 調査実行
const executeInvestigation = async () => {
  if (othersStore.isInvestigationRunning) {
    // 調査中断
    othersStore.isInvestigationRunning = false
    othersStore.lastComparison = '調査が中断されました'
    logger.info('タイミング調査を中断しました')
    return
  }
  
  try {
    othersStore.isInvestigationRunning = true
    othersStore.lastComparison = '調査開始...'
    othersStore.clearInvestigationResults()
    logger.info('タイミング調査開始')
    
    await performTimeInvestigation()
    
  } catch (error) {
    logger.error('調査実行エラー', error)
    othersStore.lastComparison = '調査でエラーが発生しました'
  } finally {
    if (othersStore.isInvestigationRunning) {
      othersStore.isInvestigationRunning = false
    }
  }
}

// 4段階調査の実行
const performTimeInvestigation = async () => {
  logger.info('4段階タイミング調査開始')
  
  // フェーズ1: 粗調査 (15秒刻み)
  othersStore.currentPhase = 1
  othersStore.currentRound = 0
  othersStore.investigationRange = null
  const phase1Result = await phase1CoarseInvestigation()
  logger.temp('Phase1実行結果', { phase1Result, isRunning: othersStore.isInvestigationRunning })
  if (!othersStore.isInvestigationRunning || !phase1Result) return
  
  // フェーズ2: 中調査 (5秒刻み)
  othersStore.currentPhase = 2
  othersStore.currentRound = 0
  // Phase2の検出結果をリセット
  othersStore.updatePhaseStatus(2, [])
  const phase2Result = await phase2MediumInvestigation(phase1Result)
  if (!othersStore.isInvestigationRunning || !phase2Result) return
  
  // フェーズ3: 精密調査 (1秒刻み)
  othersStore.currentPhase = 3
  othersStore.currentRound = 0
  // Phase3の検出結果をリセット
  othersStore.updatePhaseStatus(3, [])
  const phase3Result = await phase3PreciseInvestigation(phase2Result)
  if (!othersStore.isInvestigationRunning || !phase3Result) return
  
  // フェーズ4: 最終確認 (1秒刻み)
  othersStore.currentPhase = 4
  othersStore.currentRound = 0
  // Phase4の検出結果をリセット
  othersStore.updatePhaseStatus(4, [])
  const finalResult = await phase4FinalConfirmation(phase3Result)
  
  if (finalResult) {
    entranceStore.setTargetUpdateTime(finalResult.end) // 変更区間の終了時間を更新目標時間にする
    othersStore.lastComparison = `調査完了: ${finalResult.start}-${finalResult.end}秒に設定されました`
    logger.info('4段階調査完了', { finalResult })
  } else {
    othersStore.lastComparison = '調査完了: 更新タイミングが特定できませんでした'
  }
}

// フェーズ1: 粗調査 (15秒刻み、2周)
const phase1CoarseInvestigation = async () => {
  // フェーズ1の調査間隔と開始位置を決定（unixtimeベース）
  const nowUnixTime = Math.floor(Date.now() / 1000)
  const currentSeconds = nowUnixTime % 60
  
  // 次の15秒の倍数を取得
  let nextInterval = Math.floor(currentSeconds / 15 + 1) * 15
  if (nextInterval >= 60) {
    nextInterval = 15 // 次の分の15秒から開始
  }
  const startSecond = nextInterval
  
  logger.temp('Phase1開始計算', { 
    currentSeconds, 
    nextInterval, 
    startSecond 
  })
  
  // 開始時刻情報は状態から自動生成される
  othersStore.lastComparison = ''
  
  
  // 最大5周実行
  for (let round = 1; round <= 5; round++) {
    othersStore.currentRound = round
    
    if (!othersStore.isInvestigationRunning) return null
    
    // 各周回で時刻配列を再生成（現在時刻ベース）
    const intervals = generateUnixTimeArray(startSecond, 15, 5)
    
    // 非同期API実行システムを使用
    await executeApisAtSeconds(intervals, 1, round)
    
    if (!othersStore.isInvestigationRunning) return null
    
    // 周回終了後に最多検出範囲をチェック
    const mostDetected = othersStore.getMostDetectedRange(1)
    if (mostDetected) {
      othersStore.updatePhaseStatus(1, mostDetected)
      othersStore.lastComparison = ''
      return { start: mostDetected[0], end: mostDetected[1] }
    }
    
    // 1秒待機してから次の周回
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  
  // 5周回完了後も検出できなかった場合は重み付き平均を計算
  const weightedAverage = othersStore.getWeightedAverageRange(1)
  if (weightedAverage) {
    othersStore.updatePhaseStatus(1, weightedAverage)
    othersStore.lastComparison = ''
    return { start: weightedAverage[0], end: weightedAverage[1] }
  }
  
  othersStore.lastComparison = '終了: 変化区間未検出'
  return null
}

// Phase2,3,4共通実行関数
const executePhase = async (
  prevResult: { start: number, end: number }, 
  phaseNum: number, 
  expandStart: number, 
  expandEnd: number, 
  interval: number
) => {
  logger.temp(`Phase${phaseNum}開始`, { prevResult })
  // 範囲拡大計算（unixTimeベース）
  const nowUnixTime = Math.floor(Date.now() / 1000)
  const currentSecond = nowUnixTime % 60
  
  // 拡大後のstartSecondが現在より後なら現在の分、前なら次の分を使用
  const expandedStartSecond = prevResult.start + expandStart
  let baseUnixTime
  if (expandedStartSecond > currentSecond) {
    baseUnixTime = nowUnixTime - currentSecond // 現在の分の0秒
  } else {
    baseUnixTime = nowUnixTime - currentSecond + 60 // 次の分の0秒
  }
  
  const startUnixTime = baseUnixTime + prevResult.start
  const endUnixTime = baseUnixTime + prevResult.end
  
  const expandedStartUnix = startUnixTime + expandStart
  const expandedEndUnix = endUnixTime + expandEnd
  
  const expandedStart = ((expandedStartUnix % 60) + 60) % 60
  const expandedEnd = ((expandedEndUnix % 60) + 60) % 60
  
  // 調査範囲をstoreに設定
  othersStore.investigationRange = { start: expandedStart, end: expandedEnd }
  
  // 最大5周実行
  for (let round = 1; round <= 5; round++) {
    othersStore.currentRound = round
    
    if (!othersStore.isInvestigationRunning) return null
    
    // 各周回で時刻配列を再生成（現在時刻ベース）
    const nowUnixTime = Math.floor(Date.now() / 1000)
    const currentSecond = nowUnixTime % 60
    
    // 拡大後のstartSecondが現在より後なら現在の分、前なら次の分を使用
    const expandedStartSecond = prevResult.start + expandStart
    let baseUnixTime
    if (expandedStartSecond > currentSecond) {
      baseUnixTime = nowUnixTime - currentSecond // 現在の分の0秒
    } else {
      baseUnixTime = nowUnixTime - currentSecond + 60 // 次の分の0秒
    }
    
    const startUnixTime = baseUnixTime + prevResult.start
    const endUnixTime = baseUnixTime + prevResult.end
    
    const expandedStartUnix = startUnixTime + expandStart
    const expandedEndUnix = endUnixTime + expandEnd
    
    // 指定間隔で時刻配列を生成（現在時刻ベース）
    const intervalCount = Math.floor((expandedEndUnix - expandedStartUnix) / interval) + 1
    const intervals = []
    for (let i = 0; i < intervalCount; i++) {
      let targetTime = expandedStartUnix + (i * interval)
      // 過去の時刻になる場合は次の分に調整
      if (targetTime <= nowUnixTime) {
        targetTime += 60
      }
      intervals.push(targetTime)
    }
    
    // 非同期API実行システムを使用
    await executeApisAtSeconds(intervals, phaseNum, round)
    
    if (!othersStore.isInvestigationRunning) return null
    
    // 周回終了後に最多検出範囲をチェック
    const mostDetected = othersStore.getMostDetectedRange(phaseNum)
    if (mostDetected) {
      othersStore.updatePhaseStatus(phaseNum, mostDetected)
      othersStore.lastComparison = ''
      return { start: mostDetected[0], end: mostDetected[1] }
    }
    
    // 1秒待機してから次の周回
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // 5周回完了後も検出できなかった場合は重み付き平均を計算
  const weightedAverage = othersStore.getWeightedAverageRange(phaseNum)
  if (weightedAverage) {
    othersStore.updatePhaseStatus(phaseNum, weightedAverage)
    othersStore.lastComparison = ''
    return { start: weightedAverage[0], end: weightedAverage[1] }
  }
  
  othersStore.lastComparison = '終了: 変化区間未検出'
  return null
}

// フェーズ2: 中調査 (5秒刻み、2周)
const phase2MediumInvestigation = async (phase1Result: { start: number, end: number }) => {
  return await executePhase(phase1Result, 2, -2, 3, 5)
}

// フェーズ3: 精密調査 (1秒刻み、2周)
const phase3PreciseInvestigation = async (phase2Result: { start: number, end: number }) => {
  return await executePhase(phase2Result, 3, -2, 2, 1)
}

// フェーズ4: 最終確認 (1秒刻み、2周)
const phase4FinalConfirmation = async (phase3Result: { start: number, end: number }) => {
  return await executePhase(phase3Result, 4, -2, 2, 1)
}

// 汎用unixtime配列生成関数
const generateUnixTimeArray = (startSecond: number, interval: number, count: number): number[] => {
  const nowUnixTime = Math.floor(Date.now() / 1000)
  const currentSecond = nowUnixTime % 60
  
  // 現在の分の0秒を基準とする
  const baseUnixTime = nowUnixTime - currentSecond
  
  const result = []
  for (let i = 0; i < count; i++) {
    let targetUnixTime = baseUnixTime + startSecond + (i * interval)
    
    // 過去の時刻になる場合は次の分に調整
    if (targetUnixTime <= nowUnixTime) {
      targetUnixTime += 60
    }
    
    result.push(targetUnixTime)
  }
  
  logger.temp('generateUnixTimeArray結果', {
    startSecond, interval, count,
    currentSecond, baseUnixTime: baseUnixTime % 86400,
    results: result.map(t => ({ unix: t, display: t % 60, realTime: new Date(t * 1000).toLocaleTimeString() }))
  })
  
  return result
}

// 新しいAPI実行システム - 新状態管理対応
const executeApisAtSeconds = async (seconds: number[], phaseNum: number, roundNum: number): Promise<void> => {
  // Phase状態はリセットしない（検出結果を保持する必要がある）
  
  // 全API実行状態を初期化
  othersStore.currentPhaseExecutions = {}
  seconds.forEach(unixTime => {
    othersStore.updateExecutionStatus(unixTime, 'Waiting')
  })
  
  let previousData: any = null
  
  // API実行管理 - 100ms間隔で判定・実行
  const executionInterval = setInterval(() => {
    const nowUnixTime = Math.floor(Date.now() / 1000)
    
    // 次に実行すべき時刻を確認（Waitingの最小時刻）
    const waitingTimes = Object.entries(othersStore.currentPhaseExecutions)
      .filter(([_, exec]) => exec.status === 'Waiting')
      .map(([unixTime, _]) => parseInt(unixTime))
    
    if (waitingTimes.length > 0) {
      const nextTargetTime = Math.min(...waitingTimes)
      
      if (nowUnixTime >= nextTargetTime) {
        // API実行開始
        othersStore.updateExecutionStatus(nextTargetTime, 'Doing')
        
        executeApiNow(nextTargetTime).then(data => {
          othersStore.updateExecutionStatus(nextTargetTime, 'Done', data)
        }).catch(error => {
          othersStore.updateExecutionStatus(nextTargetTime, 'Done', null)
          logger.error(`${nextTargetTime}秒でのAPI実行エラー`, error)
        })
      }
    }
  }, 100)
  
  // データ処理管理 - 1000ms間隔で時刻順処理
  return new Promise((resolve) => {
    const processingInterval = setInterval(() => {
      // 処理可能な最も古い時刻を確認（Doneで結果ありの最小時刻）
      const doneTimes = Object.entries(othersStore.currentPhaseExecutions)
        .filter(([_, exec]) => exec.status === 'Done' && exec.result !== undefined)
        .map(([unixTime, _]) => parseInt(unixTime))
        .sort((a, b) => a - b)
      
      if (doneTimes.length > 0) {
        const oldestTime = doneTimes[0]
        const currentData = othersStore.currentPhaseExecutions[oldestTime].result
        
        // 前回データと比較
        if (previousData !== null) {
          if (JSON.stringify(previousData) !== JSON.stringify(currentData)) {
            // フェーズごとの間隔を取得
            const interval = phaseNum === 1 ? 15 : phaseNum === 2 ? 5 : 1
            const prevTime = oldestTime - interval
            othersStore.lastComparison = `${oldestTime % 60}秒: 変化検出`
            // 検出カウントを更新
            othersStore.updateDetectionCount(phaseNum, prevTime % 60, oldestTime % 60)
            logger.temp(`Phase${phaseNum} Round${roundNum}: ${prevTime % 60}-${oldestTime % 60}秒で変化検出`, {
              比較対象時間: {
                前回: `${prevTime}秒 (${prevTime % 60}秒表示)`,
                今回: `${oldestTime}秒 (${oldestTime % 60}秒表示)`
              },
              データ比較: {
                前回データ: previousData,
                今回データ: currentData,
                前回JSON: JSON.stringify(previousData),
                今回JSON: JSON.stringify(currentData)
              }
            })
          } else {
            othersStore.lastComparison = `${oldestTime % 60}秒: 変化なし`
          }
        }
        
        // 今回データを前回として保存、実行状態から削除
        previousData = currentData
        delete othersStore.currentPhaseExecutions[oldestTime]
        logger.temp(`Phase${phaseNum} Round${roundNum}: ${oldestTime}秒処理完了、残り${Object.keys(othersStore.currentPhaseExecutions).length}個`)
      }
      
      // 全完了チェック
      const remainingExecutions = Object.keys(othersStore.currentPhaseExecutions)
      if (remainingExecutions.length === 0) {
        // 全完了 - 移行条件
        clearInterval(executionInterval)
        clearInterval(processingInterval)
        logger.temp(`Phase${phaseNum} Round${roundNum}: 完了`)
        resolve()
      }
    }, 1000)
  })
}

// 即座にAPI実行する関数
const executeApiNow = async (unixTime: number): Promise<any> => {
  return await getAvailabilityInfo()
}



// 空き情報を取得
// APIは月全体のデータを返す: { year: "2025", month: "09", states: { "01": {...}, "02": {...}, ... "31": {...} } }
// ここから今日の日付（例: "02"）のデータのみを抽出
// 取得データ例: { "gate1": { "09:00": { "schedule_name": "朝", "time_state": 0 } }, "date_state": 1 }
// time_state: 0=空き, 1=残り少ない, 2=満席, 4=利用不可
const getAvailabilityInfo = async () => {
  try {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    
    // 月全体のスケジュールデータを取得
    const scheduleData = await ticketsStore.getEntranceScheduleData(year, month, true)
    
    // 空き情報更新タイミング調査のため、全データを監視対象とする
    return scheduleData
    
  } catch (error) {
    logger.error('空き情報取得エラー', error)
    throw error
  }
}

// コンポーネント初期化
onMounted(() => {
  // メイン目標時間をローカルストレージから読み込み
  const storedMainTarget = localStorage.getItem('ytomo-main-target-time')
  if (storedMainTarget) {
    const parsed = parseInt(storedMainTarget)
    if (!isNaN(parsed)) {
      mainTargetTime.value = parsed
    }
  }

  // 追加時間をローカルストレージから読み込み
  const storedAdditionalTimes = localStorage.getItem('ytomo-additional-times')
  if (storedAdditionalTimes) {
    try {
      const parsed = JSON.parse(storedAdditionalTimes)
      if (Array.isArray(parsed) && parsed.length === 3) {
        additionalTimes.value = parsed
      }
    } catch (error) {
      logger.warn('追加時間の読み込みエラー', error)
    }
  }

  // API利用設定を読み込み
  const storedApiUsageMode = localStorage.getItem('ytomo-api-usage-mode')
  if (storedApiUsageMode) {
    apiUsageMode.value = storedApiUsageMode
  } else {
    // デフォルト値'none'をlocalStorageに保存
    localStorage.setItem('ytomo-api-usage-mode', 'none')
  }

  logger.info('OthersTabコンポーネント初期化完了', {
    mainTargetTime: mainTargetTime.value,
    additionalTimes: additionalTimes.value,
    apiUsageMode: apiUsageMode.value
  })
})
</script>

<style scoped lang="scss">
.ytomo-others-tab {
  padding: 12px;
  
  .ytomo-section {
    margin-bottom: 20px;
    
    .ytomo-section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
  }
  
  .ytomo-setting-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    .ytomo-setting-label {
      font-size: 14px;
      color: #374151;
      min-width: 160px;
    }
    
    .ytomo-input-inline {
      padding: 4px 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 14px;
      text-align: center;
      
      &:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 1px #2563eb;
      }
    }
    
    .ytomo-select-inline {
      padding: 4px 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 14px;
      background-color: white;
      min-width: 80px;
      
      &:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 1px #2563eb;
      }
      
      &:hover {
        background-color: #f9fafb;
      }
    }
    
    .ytomo-setting-unit {
      font-size: 14px;
      color: #6b7280;
    }

    &.ytomo-target-time-setting {
      flex-direction: column;
      align-items: stretch;

      .ytomo-setting-label {
        margin-bottom: 8px;
        min-width: auto;
      }

      .ytomo-main-target-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .ytomo-additional-target-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .ytomo-auto-btn {
          background: #10b981;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          min-width: 50px;

          &:hover {
            background: #059669;
          }
        }

        .ytomo-additional-time {
          background: #f8f9fa;
          border: 1px solid #e5e7eb;

          &:focus {
            border-color: #10b981;
            box-shadow: 0 0 0 1px #10b981;
          }
        }
      }
    }
  }
  
  .ytomo-investigation-section {
    .ytomo-description {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 16px;
      line-height: 1.4;
    }
    
    .ytomo-investigation-controls {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      
      .ytomo-investigate-button {
        background: #059669;
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 4px;
        
        &:hover:not(.disabled) {
          background: #047857;
        }
        
        &.disabled {
          background: #9ca3af;
          color: #d1d5db;
          cursor: not-allowed;
        }
        
        &.cancel-mode {
          background: #dc2626;
          
          &:hover {
            background: #b91c1c;
          }
        }
        
        .ytomo-loading-icon {
          animation: pulse 1.5s ease-in-out infinite;
        }
      }
      
      .ytomo-clear-button {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background: #e5e7eb;
        }
      }
    }
    
    .ytomo-investigation-status {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #16a34a;
      border-radius: 8px;
      padding: 12px;
      
      .ytomo-status-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        
        .ytomo-status-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          margin-top: 2px;
          
          svg {
            width: 100%;
            height: 100%;
            fill: #16a34a;
          }
          
          &.spinning {
            animation: spin 1s linear infinite;
          }
        }
        
        .ytomo-status-details {
          flex: 1;
          
          .ytomo-phase-info {
            font-size: 13px;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
            
            .phase-label {
              font-weight: 600;
              color: #059669;
              padding: 2px 6px;
              background: #d1fae5;
              border-radius: 3px;
              flex-shrink: 0;
            }
            
            .detection-info {
              font-weight: 500;
              color: #374151;
              font-family: 'Consolas', 'Monaco', monospace;
              min-width: 200px;
            }
          }
          
          .ytomo-waiting-info {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
            font-style: italic;
            min-height: 18px; // 1行分の高さを確保
            line-height: 18px;
          }
          
          .ytomo-status-current {
            font-size: 14px;
            font-weight: 500;
            color: #166534;
            margin-bottom: 8px;
          }
          
          .ytomo-investigation-results {
            .ytomo-results-title {
              font-size: 13px;
              font-weight: 600;
              color: #166534;
              margin-bottom: 4px;
            }
            
            .ytomo-result-item {
              font-size: 12px;
              color: #166534;
              padding: 2px 0;
              font-family: monospace;
            }
          }
        }
      }
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
}
</style>