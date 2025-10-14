<template>
  <Teleport to="body">
    <div 
      v-if="overlaysStore.processingOverlayVisible"
      class="ytomo-processing-overlay"
      :class="{ 'ytomo-responsive-layout': sequentialReservationStore.state.isRunning }"
      id="ytomo-processing-overlay"
      @click="handleClick"
    >
      <div class="ytomo-processing-content">
        <div class="ytomo-processing-spinner"></div>
        <div class="ytomo-processing-message">{{ overlaysStore.processingMessage }}</div>
        
        <!-- 入場予約実行中の場合は目標時間選択UIを表示 -->
        <div v-if="isEntranceReservationRunning" class="ytomo-target-time-control">
          <div class="ytomo-target-time-label">目標時間 (次周期から適用)</div>
          <div class="ytomo-target-time-selector">
            <select
              v-model="selectedTargetSecond"
              @change="updateTargetSecond"
              class="ytomo-target-second-select"
            >
              <option v-for="second in secondOptions" :key="second" :value="second">
                {{ second }}秒
              </option>
            </select>
          </div>
        </div>

        <!-- キャンセルボタン -->
        <div v-if="overlaysStore.processingCancelCallback" class="ytomo-cancel-button-container">
          <button
            @click="handleCancel"
            class="ytomo-cancel-button"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOverlaysStore } from '@/stores/overlays'
import { useSequentialReservationStore } from '@/stores/sequentialReservation'

const overlaysStore = useOverlaysStore()
const sequentialReservationStore = useSequentialReservationStore()

// 目標秒の選択肢（0-59）
const secondOptions = Array.from({ length: 60 }, (_, i) => i)

// 現在選択されている目標秒
const selectedTargetSecond = ref(35) // デフォルト35秒

// 入場予約実行中かどうかの判定
const isEntranceReservationRunning = computed(() => {
  const message = overlaysStore.processingMessage.toLowerCase()
  return message.includes('入場予約') || message.includes('entrance') || message.includes('reservation')
})

// 目標秒を更新
const updateTargetSecond = () => {
  try {
    // グローバルの入場予約状態管理にアクセス
    const stateManager = (window as any).entranceReservationStateManager
    if (stateManager && typeof stateManager.setTargetSecond === 'function') {
      stateManager.setTargetSecond(selectedTargetSecond.value)
    }
  } catch (error) {
    console.warn('目標秒設定エラー', error)
  }
}

// 初期化時に現在の目標秒を取得
onMounted(() => {
  try {
    const stateManager = (window as any).entranceReservationStateManager
    if (stateManager && typeof stateManager.getTargetSecond === 'function') {
      selectedTargetSecond.value = stateManager.getTargetSecond()
    }
  } catch (error) {
    console.warn('目標秒取得エラー', error)
  }
})

const handleClick = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleCancel = () => {
  overlaysStore.cancelProcessing()
}
</script>

<style scoped lang="scss">
.ytomo-processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  opacity: 0;
  animation: fadeIn 0.2s ease-out forwards;
}

.ytomo-processing-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  min-width: 300px;
  transform: scale(0.9);
  animation: dialogAppear 0.2s ease-out forwards;
}

.ytomo-processing-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2c5aa0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.ytomo-processing-message {
  margin: 0;
  color: #374151;
  font-size: 16px;
  font-weight: 500;
}

.ytomo-target-time-control {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  
  .ytomo-target-time-label {
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
  }
  
  .ytomo-target-time-selector {
    .ytomo-target-second-select {
      background: white;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      min-width: 100px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:focus {
        outline: none;
        border-color: #2c5aa0;
        box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
      }
      
      &:hover {
        border-color: #9ca3af;
      }
      
      option {
        padding: 8px;
      }
    }
  }
}

.ytomo-cancel-button-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;

  .ytomo-cancel-button {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes dialogAppear {
  to {
    transform: scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ytomo-processing-overlay,
  .ytomo-processing-content,
  .ytomo-processing-spinner {
    animation: none;
    transition: none;
  }
}
</style>