import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loggers } from '@/utils/logger'

const logger = loggers.ui

export const useOthersStore = defineStore('others', () => {
  // 調査機能の状態
  const isInvestigationRunning = ref(false)
  const investigationStatus = ref('')
  const investigationResults = ref<Array<{time: number, status: string}>>([])
  
  // 拡張機能設定
  const targetUpdateTime = ref(35) // デフォルト35秒
  
  // 設定の読み込み
  const loadSettings = () => {
    const storedTime = localStorage.getItem('ytomo-target-update-time')
    if (storedTime) {
      targetUpdateTime.value = parseInt(storedTime) || 35
    }
    logger.info('設定を読み込みました', { targetUpdateTime: targetUpdateTime.value })
  }
  
  // 設定の保存
  const saveTargetTime = (time: number) => {
    targetUpdateTime.value = time
    localStorage.setItem('ytomo-target-update-time', time.toString())
    logger.info('目標時間を保存しました', { targetUpdateTime: time })
  }
  
  // 調査結果のクリア
  const clearInvestigationResults = () => {
    investigationResults.value = []
    investigationStatus.value = ''
  }
  
  // 調査結果の追加
  const addInvestigationResult = (time: number, status: string) => {
    investigationResults.value.push({ time, status })
  }
  
  return {
    // 状態
    isInvestigationRunning,
    investigationStatus,
    investigationResults,
    targetUpdateTime,
    
    // アクション
    loadSettings,
    saveTargetTime,
    clearInvestigationResults,
    addInvestigationResult
  }
})