<template>
  <div v-if="reservationInfo.visible" class="ytomo-reservation-info" :class="{ 'completed': reservationInfo.completed }">
    <div class="ytomo-reservation-box">
      <div class="ytomo-reservation-date">{{ reservationInfo.date }}</div>
      <div class="ytomo-reservation-timeslots">
        <div v-for="slot in reservationInfo.timeSlots" :key="slot.id" class="ytomo-timeslot">
          {{ slot.gate }}{{ slot.time }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ReservationInfo {
  visible: boolean
  date: string
  timeSlots: Array<{
    id: string
    gate: string
    time: string
  }>
  completed: boolean
}

interface Props {
  reservationInfo: ReservationInfo
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.ytomo-reservation-info {
  margin-top: 0;

  &.completed {
    opacity: 0.6;

    .ytomo-reservation-box {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-color: #6c757d;
    }

    .ytomo-reservation-date {
      color: #6c757d;
      border-color: #6c757d;
    }
  }

  .ytomo-reservation-box {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 1px solid #0891b2;
    border-radius: 8px;
    padding: 16px;
    position: relative;

    .ytomo-reservation-date {
      position: absolute;
      top: -8px;
      left: 12px;
      font-weight: 600;
      font-size: 12px;
      color: #0c4a6e;
      background: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #0891b2;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .ytomo-reservation-timeslots {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .ytomo-timeslot {
        background: rgba(8, 145, 178, 0.1);
        border: 1px solid #0891b2;
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 10px;
        font-weight: 500;
        color: #0c4a6e;
      }
    }
  }
}
</style>