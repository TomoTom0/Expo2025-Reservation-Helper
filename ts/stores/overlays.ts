/**
 * オーバーレイ管理ストア
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOverlaysStore = defineStore('overlays', () => {
  // 誤操作防止オーバーレイ
  const processingOverlayVisible = ref(false)
  const processingMessage = ref('')

  // 順次予約オーバーレイ（表示制御のみ）
  const sequentialOverlayVisible = ref(false)

  // 誤操作防止オーバーレイの制御
  const showProcessingOverlay = (message: string) => {
    processingMessage.value = message
    processingOverlayVisible.value = true
  }

  const hideProcessingOverlay = () => {
    processingOverlayVisible.value = false
    processingMessage.value = ''
  }

  // 順次予約オーバーレイの表示制御
  const showSequentialOverlay = () => {
    sequentialOverlayVisible.value = true
  }

  const hideSequentialOverlay = () => {
    sequentialOverlayVisible.value = false
  }

  return {
    // State
    processingOverlayVisible,
    processingMessage,
    sequentialOverlayVisible,
    
    // Actions
    showProcessingOverlay,
    hideProcessingOverlay,
    showSequentialOverlay,
    hideSequentialOverlay
  }
})