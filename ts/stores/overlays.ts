/**
 * オーバーレイ管理ストア
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOverlaysStore = defineStore('overlays', () => {
  // 誤操作防止オーバーレイ
  const processingOverlayVisible = ref(false)
  const processingMessage = ref('')
  const processingCancelCallback = ref<(() => void) | undefined>(undefined)

  // 順次予約オーバーレイ（表示制御のみ）
  const sequentialOverlayVisible = ref(false)

  // 誤操作防止オーバーレイの制御
  const showProcessingOverlay = (message: string, cancelCallback?: () => void) => {
    processingMessage.value = message
    processingOverlayVisible.value = true
    processingCancelCallback.value = cancelCallback
  }

  const hideProcessingOverlay = () => {
    processingOverlayVisible.value = false
    processingMessage.value = ''
    processingCancelCallback.value = undefined
  }

  const cancelProcessing = () => {
    if (processingCancelCallback.value) {
      processingCancelCallback.value()
    }
    hideProcessingOverlay()
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
    processingCancelCallback,
    sequentialOverlayVisible,

    // Actions
    showProcessingOverlay,
    hideProcessingOverlay,
    cancelProcessing,
    showSequentialOverlay,
    hideSequentialOverlay
  }
})