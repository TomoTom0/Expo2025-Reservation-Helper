import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loggers } from '@/utils/logger'

const logger = loggers.ui

export const useOthersStore = defineStore('others', () => {
  // 調査機能の状態
  const isInvestigationRunning = ref(false)
  
  // 調査状態 - 新しい構造
  const currentPhase = ref(0) // 0=未開始, 1-4=各フェーズ
  const currentRound = ref(0)
  
  // Phase別検出結果: [start, end] | [] | null
  const phaseStatus = ref<{[phase: number]: [number, number] | [] | null}>({
    1: null,
    2: null, 
    3: null,
    4: null
  })
  
  // 現在Phaseの各API実行状態
  const currentPhaseExecutions = ref<{[unixTime: number]: {status: 'Done' | 'Doing' | 'Waiting', result: any}}>({})
  
  // 調査範囲表示用
  const investigationRange = ref<{start: number, end: number} | null>(null)
  const lastComparison = ref('')
  
  
  // 調査結果のクリア
  const clearInvestigationResults = () => {
    lastComparison.value = ''
    currentPhase.value = 0
    currentRound.value = 0
    phaseStatus.value = { 1: null, 2: null, 3: null, 4: null }
    currentPhaseExecutions.value = {}
    investigationRange.value = null
    detectionCounts.value = { 1: {}, 2: {}, 3: {}, 4: {} }
  }
  
  // Phase状態の更新
  const updatePhaseStatus = (phase: number, result: [number, number] | [] | null) => {
    phaseStatus.value[phase] = result
  }
  
  // 検出時間カウンター
  const detectionCounts = ref<{[phase: number]: {[timeRange: string]: number}}>({
    1: {}, 2: {}, 3: {}, 4: {}
  })
  
  // 検出時間カウントの更新
  const updateDetectionCount = (phase: number, startTime: number, endTime: number) => {
    const key = `${startTime % 60}_${endTime % 60}`
    if (!detectionCounts.value[phase][key]) {
      detectionCounts.value[phase][key] = 0
    }
    detectionCounts.value[phase][key]++
  }
  
  // 最多検出時間帯の判定（2回以上の差があるか）
  const getMostDetectedRange = (phase: number): [number, number] | null => {
    const counts = detectionCounts.value[phase]
    const entries = Object.entries(counts)
    
    if (entries.length === 0) return null
    
    // 最大カウントを取得
    const maxCount = Math.max(...entries.map(([_, count]) => count))
    const maxEntries = entries.filter(([_, count]) => count === maxCount)
    
    if (maxEntries.length > 1) {
      // 複数の時間帯が同じ最大カウントの場合は判定不可
      return null
    }
    
    // 他のすべてより2回以上多いかチェック
    const otherCounts = entries.filter(([_, count]) => count !== maxCount).map(([_, count]) => count)
    const maxOtherCount = otherCounts.length > 0 ? Math.max(...otherCounts) : 0
    
    if (maxCount - maxOtherCount >= 2) {
      const [timeRange] = maxEntries[0]
      const [start, end] = timeRange.split('_').map(Number)
      return [start, end]
    }
    
    return null
  }
  
  // 5周回終了時の重み付き平均計算
  const getWeightedAverageRange = (phase: number): [number, number] | null => {
    const counts = detectionCounts.value[phase]
    const entries = Object.entries(counts)
    
    if (entries.length === 0) return null
    
    let totalWeightStart = 0
    let totalWeightEnd = 0
    let totalCount = 0
    
    entries.forEach(([timeRange, count]) => {
      const [start, end] = timeRange.split('_').map(Number)
      totalWeightStart += start * count
      totalWeightEnd += end * count
      totalCount += count
    })
    
    if (totalCount === 0) return null
    
    const avgStart = Math.round(totalWeightStart / totalCount)
    const avgEnd = Math.round(totalWeightEnd / totalCount)
    
    
    return [avgStart, avgEnd]
  }
  
  // API実行状態の更新
  const updateExecutionStatus = (unixTime: number, status: 'Done' | 'Doing' | 'Waiting', result?: any) => {
    currentPhaseExecutions.value[unixTime] = { status, result: result || null }
  }
  
  // Phase表示の分離ロジック
  const phaseLabel = computed(() => {
    if (currentPhase.value === 0) return ''
    
    // Phase番号と調査種別
    const phaseNames = { 1: '15秒調査', 2: '5秒調査', 3: '1秒調査', 4: '1秒調査' }
    const phaseName = phaseNames[currentPhase.value as keyof typeof phaseNames] || '調査'
    
    let label = `Phase${currentPhase.value} (${phaseName}`
    if (currentRound.value > 0) {
      label += ` ${currentRound.value}/2`
    }
    label += ')'
    
    return label
  })
  
  const detectionDisplay = computed(() => {
    if (currentPhase.value === 0) return ''
    
    let display = ''
    
    // 拡大調査範囲（Phase2以降）
    if (investigationRange.value && currentPhase.value > 1) {
      display += `${investigationRange.value.start}-${investigationRange.value.end}秒`
    } else {
      display += '        ' // 幅保持用空白
    }
    
    display += ' → ' // 装飾矢印
    
    // そのPhaseの検出情報 - 検出カウンターベースで表示
    const counts = detectionCounts.value[currentPhase.value]
    const entries = Object.entries(counts)
    
    if (entries.length > 0) {
      // 検出された時間帯をすべて表示
      const timeRanges = entries.map(([timeRange, count]) => {
        const [start, end] = timeRange.split('_').map(Number)
        return `${start}-${end}秒 (${count}回)`
      }).join(', ')
      display += timeRanges
    } else {
      // 検出なしの場合
      const hasActiveExecution = Object.keys(currentPhaseExecutions.value).length > 0
      display += hasActiveExecution ? '実施中' : '未検出'
    }
    
    return display
  })
  
  const investigationWaitingText = computed(() => {
    // DoingまたはWaitingの最小unix時刻を取得
    const activeExecutions = Object.entries(currentPhaseExecutions.value)
      .filter(([_, exec]) => exec.status === 'Doing' || exec.status === 'Waiting')
      .map(([unixTime, _]) => parseInt(unixTime))
    
    if (activeExecutions.length > 0) {
      const minTime = Math.min(...activeExecutions)
      const status = currentPhaseExecutions.value[minTime].status
      const second = String(minTime % 60).padStart(2, '0')
      
      if (status === 'Doing') {
        return `${second}秒をAPI処理中...`
      } else if (status === 'Waiting') {
        return `${second}秒を待機中...`
      }
    }
    return ''
  })
  
  const investigationStatusText = computed(() => {
    return lastComparison.value
  })
  
  return {
    // 状態
    isInvestigationRunning,

    // 調査状態 - 新構造
    currentPhase,
    currentRound,
    phaseStatus,
    currentPhaseExecutions,
    lastComparison,
    investigationRange,

    // 表示用computed
    phaseLabel,
    detectionDisplay,
    investigationWaitingText,
    investigationStatusText,

    // アクション
    clearInvestigationResults,
    updatePhaseStatus,
    updateExecutionStatus,
    updateDetectionCount,
    getMostDetectedRange,
    getWeightedAverageRange
  }
})