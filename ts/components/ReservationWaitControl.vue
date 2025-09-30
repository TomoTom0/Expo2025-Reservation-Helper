<template>
  <div v-if="isReservationRunning" class="ytomo-wait-area">
    <div class="ytomo-wait-controls">
      <button
        @click="handleStartWait"
        :disabled="entranceStore.waitInfo.isWaiting || entranceStore.waitInfo.waitMinutes < 1 || entranceStore.waitInfo.waitMinutes > 720"
      >
        予約待機
      </button>
      <input
        inputmode="numeric"
        v-model="entranceStore.waitInfo.waitMinutes"
        :disabled="entranceStore.waitInfo.isWaiting"
        min="1"
        max="720"
        step="1"
      />分
      <!-- 時間調整ボタン -->
      <div class="ytomo-time-adjust-buttons">
        <button @click="adjustWaitTime(5)" class="ytomo-time-adjust-btn" :disabled="entranceStore.waitInfo.isWaiting" title="5分追加">+5</button>
        <button @click="adjustWaitTime(15)" class="ytomo-time-adjust-btn" :disabled="entranceStore.waitInfo.isWaiting" title="15分追加">+15</button>
        <button @click="adjustWaitTime(60)" class="ytomo-time-adjust-btn" :disabled="entranceStore.waitInfo.isWaiting" title="60分追加">+60</button>
        <button @click="adjustWaitTime(-30)" class="ytomo-time-adjust-btn" :disabled="entranceStore.waitInfo.isWaiting" title="30分短縮">-30</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEntranceReservationStore } from '@/stores/entranceReservation'
import { loggers } from '@/utils/logger'

const logger = loggers.ui

const props = defineProps<{
  isReservationRunning: boolean
}>()

const entranceStore = useEntranceReservationStore()
const isReservationRunning = computed(() => props.isReservationRunning)

const handleStartWait = () => {
  try {
    entranceStore.startWait()
  } catch (error) {
    logger.error('予約待機開始エラー', { error })
  }
}

// 待機時間調整メソッド
const adjustWaitTime = (minutes: number) => {
  if (!entranceStore.waitInfo.isWaiting) {
    // 待機中でない場合は待機時間を変更
    const currentMinutes = entranceStore.waitInfo.waitMinutes
    const newMinutes = Math.max(1, Math.min(720, currentMinutes + minutes))
    entranceStore.waitInfo.waitMinutes = newMinutes
  } else {
    // 待機中の場合は待機時間を延長
    entranceStore.extendWaitTime(minutes)
  }
}

</script>

<style scoped lang="scss">
.ytomo-wait-area {
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;

  .ytomo-wait-controls {
    display: flex;
    align-items: center;
    gap: 8px;

    button {
      padding: 6px 12px;
      background: #2c5aa0;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;

      &:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
    }

    input {
      width: 60px;
      padding: 4px 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;

      &:disabled {
        background: #f9fafb;
        color: #9ca3af;
      }
    }
  }

  .ytomo-time-adjust-buttons {
    display: flex;
    gap: 4px;

    .ytomo-time-adjust-btn {
      background: #f59e0b;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 28px;

      &:hover {
        background: #d97706;
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }

      &:disabled {
        background: #9ca3af;
        cursor: not-allowed;
        transform: none;
      }
    }
  }
}
</style>