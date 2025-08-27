/**
 * オーバーレイ管理ストア
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

interface SequentialReservationState {
  isMonitoringMode: boolean
  currentInterval: number
  currentReservationIndex: number
  totalReservationsCount: number
  currentTarget: string
  countdownText: string
}

export const useOverlaysStore = defineStore('overlays', () => {
  // 誤操作防止オーバーレイ
  const processingOverlayVisible = ref(false)
  const processingMessage = ref('')

  // 順次予約オーバーレイ
  const sequentialOverlayVisible = ref(false)
  const sequentialState = ref<SequentialReservationState>({
    isMonitoringMode: false,
    currentInterval: 15,
    currentReservationIndex: 1,
    totalReservationsCount: 0,
    currentTarget: '準備中...',
    countdownText: ''
  })

  // 誤操作防止オーバーレイの制御
  const showProcessingOverlay = (message: string) => {
    processingMessage.value = message
    processingOverlayVisible.value = true
  }

  const hideProcessingOverlay = () => {
    processingOverlayVisible.value = false
    processingMessage.value = ''
  }

  // 順次予約オーバーレイの制御
  const showSequentialOverlay = (totalCount: number) => {
    sequentialState.value = {
      isMonitoringMode: false,
      currentInterval: 15,
      currentReservationIndex: 1,
      totalReservationsCount: totalCount,
      currentTarget: '準備中...',
      countdownText: ''
    }
    sequentialOverlayVisible.value = true
  }

  const hideSequentialOverlay = () => {
    sequentialOverlayVisible.value = false
  }

  const updateSequentialProgress = (index: number, target: string, countdown: string) => {
    sequentialState.value.currentReservationIndex = index
    sequentialState.value.currentTarget = target
    sequentialState.value.countdownText = countdown
  }

  const switchSequentialMode = (isMonitoring: boolean) => {
    sequentialState.value.isMonitoringMode = isMonitoring
  }

  const setSequentialInterval = (interval: number) => {
    sequentialState.value.currentInterval = interval
  }

  return {
    // State
    processingOverlayVisible,
    processingMessage,
    sequentialOverlayVisible,
    sequentialState,
    
    // Actions
    showProcessingOverlay,
    hideProcessingOverlay,
    showSequentialOverlay,
    hideSequentialOverlay,
    updateSequentialProgress,
    switchSequentialMode,
    setSequentialInterval
  }
})