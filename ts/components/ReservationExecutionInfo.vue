<template>
  <div class="ytomo-execution-info">
    <!-- 予約情報表示エリア -->
    <ReservationInfoDisplay :reservation-info="reservationInfo" />

    <!-- 予約実行状態表示エリア -->
    <ReservationStatusDisplay
      :reservation-status="reservationStatus"
      :wait-info="waitInfo"
      :reservation-history="reservationHistory"
      :is-reservation-running="isReservationRunning"
      :format-time="formatTime"
    />
  </div>
</template>

<script setup lang="ts">
import { useEntranceReservationStore } from '@/stores/entranceReservation'
import ReservationInfoDisplay from './ReservationInfoDisplay.vue'
import ReservationStatusDisplay from './ReservationStatusDisplay.vue'

const entranceReservationStore = useEntranceReservationStore()

const reservationInfo = entranceReservationStore.reservationInfo
const reservationStatus = entranceReservationStore.reservationStatus
const waitInfo = entranceReservationStore.waitInfo
const reservationHistory = entranceReservationStore.reservationHistory
const isReservationRunning = entranceReservationStore.isReservationRunning
const formatTime = entranceReservationStore.formatTime
</script>

<style scoped lang="scss">
.ytomo-execution-info {
  width: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: center;

  // 実行情報内の予約情報と実行状態を横並びに配置
  :deep(.ytomo-reservation-info),
  :deep(.ytomo-reservation-status) {
    flex: 1 1 0;
    max-width: 300px;
  }

  @media (max-width: 720px) {
    flex-direction: column;
    gap: 12px;

    :deep(.ytomo-reservation-info),
    :deep(.ytomo-reservation-status) {
      flex: none;
      max-width: none;
    }
  }
}
</style>