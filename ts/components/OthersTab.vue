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
      
      <div class="ytomo-setting-item">
        <label class="ytomo-setting-label">入場時間更新目標時間</label>
        <input 
          type="number"
          class="ytomo-input-inline"
          v-model.number="othersStore.targetUpdateTime"
          @change="handleTargetTimeChange"
          min="0"
          max="59"
          style="width: 60px;"
        >
        <span class="ytomo-setting-unit">秒</span>
      </div>
    </div>
    
    <!-- 調査機能セクション -->
    <div class="ytomo-section">
      <h3 class="ytomo-section-title">タイミング調査</h3>
      
      <div class="ytomo-investigation-section">
        <p class="ytomo-description">
          入場予約システムの空き情報更新タイミングを調査し、最適な予約実行時間を見つけます。
        </p>
        
        <div class="ytomo-investigation-controls">
          <button 
            class="ytomo-investigate-button" 
            :class="{ 'disabled': !canStartInvestigation, 'cancel-mode': othersStore.isInvestigationRunning }"
            :disabled="!canStartInvestigation"
            @click="executeInvestigation"
          >
            <span v-if="othersStore.isInvestigationRunning" class="ytomo-loading-icon">⏳</span>
            {{ othersStore.isInvestigationRunning ? '調査中断' : '調査' }}
          </button>
          
          <button 
            v-if="othersStore.investigationResults.length > 0"
            class="ytomo-clear-button"
            @click="clearResults"
          >
            結果クリア
          </button>
        </div>
        
        <!-- 調査状況表示 -->
        <div v-if="othersStore.isInvestigationRunning || othersStore.investigationStatus" class="ytomo-investigation-status">
          <div class="ytomo-status-content">
            <div v-if="othersStore.isInvestigationRunning" class="ytomo-status-icon spinning">
              <svg viewBox="0 0 24 24">
                <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
              </svg>
            </div>
            <div class="ytomo-status-details">
              <div class="ytomo-status-current">{{ othersStore.investigationStatus }}</div>
              
              <!-- 調査結果表示 -->
              <div v-if="othersStore.investigationResults.length > 0" class="ytomo-investigation-results">
                <div class="ytomo-results-title">調査結果:</div>
                <div v-for="(result, index) in othersStore.investigationResults" :key="index" class="ytomo-result-item">
                  {{ result.time }}秒: {{ result.status }}
                </div>
              </div>
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
import { loggers } from '@/utils/logger'

const logger = loggers.ui
const othersStore = useOthersStore()
const ticketsStore = useTicketsStore()

// API利用設定
const apiUsageMode = ref('full')

// 調査開始可能かどうか
const canStartInvestigation = computed(() => {
  return !othersStore.isInvestigationRunning
})

// API利用変更ハンドラ
const handleApiUsageChange = () => {
  logger.info('API利用モード変更', { apiUsageMode: apiUsageMode.value })
  localStorage.setItem('ytomo-api-usage-mode', apiUsageMode.value)
}

// 目標時間変更ハンドラ
const handleTargetTimeChange = () => {
  othersStore.saveTargetTime(othersStore.targetUpdateTime)
}

// 結果クリア
const clearResults = () => {
  othersStore.clearInvestigationResults()
}

// 調査実行
const executeInvestigation = async () => {
  if (othersStore.isInvestigationRunning) {
    // 調査中断
    othersStore.isInvestigationRunning = false
    othersStore.investigationStatus = '調査が中断されました'
    logger.info('タイミング調査を中断しました')
    return
  }
  
  try {
    othersStore.isInvestigationRunning = true
    othersStore.investigationStatus = '調査開始...'
    othersStore.clearInvestigationResults()
    logger.info('タイミング調査開始')
    
    await performTimeInvestigation()
    
  } catch (error) {
    logger.error('調査実行エラー', error)
    othersStore.investigationStatus = '調査でエラーが発生しました'
  } finally {
    if (othersStore.isInvestigationRunning) {
      othersStore.isInvestigationRunning = false
    }
  }
}

// 時間調査の実行
const performTimeInvestigation = async () => {
  othersStore.investigationStatus = '候補時間を分析中...'
  
  // フェーズ1: 広域調査（10秒間隔）
  const broadResults = await investigateBroadRange()
  
  if (!othersStore.isInvestigationRunning) return
  
  // フェーズ2: 精密調査
  if (broadResults.length > 0) {
    othersStore.investigationStatus = '精密調査中...'
    const preciseResult = await investigatePreciseRange(broadResults)
    
    if (preciseResult) {
      // 設定を自動更新
      othersStore.saveTargetTime(preciseResult.targetTime)
      othersStore.investigationStatus = `調査完了: ${preciseResult.targetTime}秒に設定されました`
      logger.info('目標時間調査完了', preciseResult)
    }
  } else {
    othersStore.investigationStatus = '変更時間が検出されませんでした'
  }
  
  logger.info('タイミング調査完了', {
    results: othersStore.investigationResults,
    finalStatus: othersStore.investigationStatus
  })
}

// 広域調査
const investigateBroadRange = async (): Promise<any[]> => {
  const results = []
  const intervals = [10, 20, 30, 40, 50] // 10秒間隔で調査
  
  for (let i = 0; i < intervals.length; i++) {
    if (!othersStore.isInvestigationRunning) break
    
    const targetSecond = intervals[i]
    othersStore.investigationStatus = `広域調査: ${targetSecond}秒での変化を確認中...`
    
    try {
      const result = await executeAtSpecificTime(targetSecond)
      results.push({ targetSecond, ...result })
      
      // UIに結果を追加
      othersStore.addInvestigationResult(targetSecond, result.changed ? '変化検出' : '変化なし')
      
      logger.info(`調査結果 ${targetSecond}秒`, result)
      
      // 次の調査まで待機
      if (i < intervals.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      logger.error(`${targetSecond}秒での調査エラー`, error)
      othersStore.addInvestigationResult(targetSecond, 'エラー')
    }
  }
  
  return results.filter(r => r.changed)
}

// 精密調査
const investigatePreciseRange = async (broadResults: any[]): Promise<any> => {
  // 変化が検出された範囲を特定
  let changeDetected = false
  let targetRange = { min: 30, max: 40 } // デフォルト範囲
  
  for (let i = 0; i < broadResults.length - 1; i++) {
    const current = broadResults[i]
    const next = broadResults[i + 1]
    
    if (current.changed !== next.changed) {
      targetRange = { min: current.targetSecond, max: next.targetSecond }
      changeDetected = true
      break
    }
  }
  
  if (!changeDetected) return null
  
  // 精密調査実行
  const preciseIntervals = []
  for (let sec = targetRange.min + 1; sec < targetRange.max; sec++) {
    preciseIntervals.push(sec)
  }
  
  for (const targetSecond of preciseIntervals) {
    if (!othersStore.isInvestigationRunning) break
    
    othersStore.investigationStatus = `精密調査: ${targetSecond}秒での変化を確認中...`
    
    try {
      const result = await executeAtSpecificTime(targetSecond)
      
      // UIに結果を追加
      othersStore.addInvestigationResult(targetSecond, result.changed ? '✓変化検出' : '変化なし')
      
      if (result.changed) {
        return { targetTime: targetSecond, confidence: 'high' }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500))
    } catch (error) {
      logger.error(`精密調査 ${targetSecond}秒エラー`, error)
      othersStore.addInvestigationResult(targetSecond, 'エラー')
    }
  }
  
  return { targetTime: Math.round((targetRange.min + targetRange.max) / 2), confidence: 'medium' }
}

// 特定時間でのAPI実行
const executeAtSpecificTime = async (targetSecond: number): Promise<any> => {
  return new Promise(async (resolve) => {
    const executeAt = async () => {
      const now = new Date()
      const currentSecond = now.getSeconds()
      
      if (currentSecond === targetSecond) {
        // 実際の空き情報を取得して比較
        try {
          const beforeData = await getAvailabilityInfo()
          await new Promise(r => setTimeout(r, 1000)) // 1秒待機
          const afterData = await getAvailabilityInfo()
          
          const changed = JSON.stringify(beforeData) !== JSON.stringify(afterData)
          logger.info(`${targetSecond}秒でAPI実行`, { changed, beforeData, afterData })
          
          resolve({ changed, timestamp: now.toISOString() })
        } catch (error) {
          logger.error(`${targetSecond}秒でのAPI実行エラー`, error)
          resolve({ changed: false, timestamp: now.toISOString(), error: true })
        }
      } else {
        // 100ms後に再試行
        setTimeout(executeAt, 100)
      }
    }
    
    executeAt()
  })
}

// 空き情報を取得（簡略化版）
const getAvailabilityInfo = async () => {
  try {
    // 今日の日付を取得
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    
    // 月の空き情報を取得
    const scheduleData = await ticketsStore.getEntranceScheduleData(year, month, true)
    
    // 今日の日付の時間帯情報を取得
    const dayOfMonth = String(today.getDate()).padStart(2, '0')
    const dayData = scheduleData?.states?.[dayOfMonth]
    
    logger.info('空き情報取得結果', { year, month, dayOfMonth, hasDayData: !!dayData })
    return dayData
    
  } catch (error) {
    logger.error('空き情報取得エラー', error)
    throw error
  }
}

// コンポーネント初期化
onMounted(() => {
  othersStore.loadSettings()
  
  // API利用設定を読み込み
  const storedApiUsageMode = localStorage.getItem('ytomo-api-usage-mode')
  if (storedApiUsageMode) {
    apiUsageMode.value = storedApiUsageMode
  }
  
  logger.info('OthersTabコンポーネント初期化完了', {
    targetUpdateTime: othersStore.targetUpdateTime,
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