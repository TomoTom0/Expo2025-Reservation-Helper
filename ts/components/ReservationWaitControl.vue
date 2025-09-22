<template>
  <div v-if="isReservationRunning" class="ytomo-wait-area">
    <div class="ytomo-wait-controls">
      <button
        @click="handleStartWait"
        :disabled="reservationManager.waitInfo.value.isWaiting || reservationManager.waitInfo.value.waitMinutes < 1 || reservationManager.waitInfo.value.waitMinutes > 360"
      >
        予約待機
      </button>
      <input
        type="number"
        v-model="reservationManager.waitInfo.value.waitMinutes"
        :disabled="reservationManager.waitInfo.value.isWaiting"
        min="1"
        max="360"
        step="1"
      />分
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EntranceReservationApiManager } from '@/modules/entrance-reservation-api-manager'
import { loggers } from '@/utils/logger'

const logger = loggers.ui

interface Props {
  reservationManager: EntranceReservationApiManager
}

const props = defineProps<Props>()

const isReservationRunning = computed(() => props.reservationManager.isReservationRunning.value)

const handleStartWait = () => {
  try {
    logger.temp('予約待機ボタン押下前', {
      isWaiting: props.reservationManager.waitInfo.value.isWaiting,
      waitMinutes: props.reservationManager.waitInfo.value.waitMinutes
    })
    props.reservationManager.startWait()
    logger.temp('予約待機ボタン押下後', {
      isWaiting: props.reservationManager.waitInfo.value.isWaiting,
      waitStartTime: props.reservationManager.waitInfo.value.waitStartTime,
      waitEndTime: props.reservationManager.waitInfo.value.waitEndTime
    })
  } catch (error) {
    logger.temp('予約待機ボタンでエラー', { error })
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
}
</style>