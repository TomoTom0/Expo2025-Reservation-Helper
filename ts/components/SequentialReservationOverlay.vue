<template>
  <Teleport to="body">
    <div 
      v-if="sequentialReservationStore.state.isRunning"
      class="ytomo-sequential-overlay"
      id="ytomo-sequential-overlay"
      @click="handleOverlayClick"
    >
      <div class="ytomo-sequential-content">
        <h3>順次予約実行中 {{ sequentialReservationStore.state.currentTargetIndex + 1 }}/{{ sequentialReservationStore.state.reservationTargets.length }}</h3>
        <div class="ytomo-sequential-settings-row">
          <div class="ytomo-mode-buttons">
            <button 
              id="ytomo-reservation-mode" 
              class="ytomo-mode-button"
              :class="{ active: !sequentialReservationStore.state.nextMonitoringMode }"
              @click="switchToReservationMode"
            >
              予約
            </button>
            <button 
              id="ytomo-monitoring-mode" 
              class="ytomo-mode-button"
              :class="{ active: sequentialReservationStore.state.nextMonitoringMode }"
              @click="switchToMonitoringMode"
            >
              監視
            </button>
          </div>
          <select 
            id="ytomo-interval-select" 
            class="ytomo-interval-dropdown"
            :value="sequentialReservationStore.state.nextIntervalTime"
            @change="onIntervalChange"
          >
            <option v-if="!sequentialReservationStore.state.nextMonitoringMode" value="1">1秒</option>
            <option value="5">5秒</option>
            <option value="15">15秒</option>
            <option value="30">30秒</option>
            <option value="60">60秒</option>
          </select>
        </div>
        <div class="ytomo-sequential-progress">
          <div class="ytomo-sequential-target">
            <div v-if="currentTarget" class="current-target">
              <div class="pavilion-name">{{ currentTarget.pavilionName }}</div>
              <div class="time-slot-button">{{ currentTarget.timeSlot }}</div>
            </div>
          </div>
          <div class="ytomo-sequential-status">
            <div class="ytomo-sequential-current">
              {{ sequentialReservationStore.state.currentTargetIndex + 1 }}/{{ sequentialReservationStore.state.reservationTargets.length }}
              <span v-if="sequentialReservationStore.state.endlessMode" class="endless-indicator">♾️</span>
            </div>
            <div class="ytomo-sequential-countdown">{{ sequentialReservationStore.state.countdownText }}</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useOverlaysStore } from '@/stores/overlays'
import { useSequentialReservationStore } from '@/stores/sequentialReservation'
import { loggers } from '@/utils/logger'

const overlaysStore = useOverlaysStore()
const sequentialReservationStore = useSequentialReservationStore()
const logger = loggers.ui

const currentTarget = computed(() => {
  const state = sequentialReservationStore.state
  if (state.reservationTargets.length > 0 && state.currentTargetIndex >= 0) {
    return state.reservationTargets[state.currentTargetIndex]
  }
  return null
})

const handleOverlayClick = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
}

const switchToReservationMode = () => {
  sequentialReservationStore.setNextMonitoringMode(false)
}

const switchToMonitoringMode = () => {
  sequentialReservationStore.setNextMonitoringMode(true)
}

const onIntervalChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  sequentialReservationStore.setNextInterval(parseInt(target.value))
}

const cancelSequentialReservation = () => {
  sequentialReservationStore.stopSequentialReservation()
  overlaysStore.hideSequentialOverlay()
  logger.info('継続予約をキャンセルしました')
}
</script>

<style scoped lang="scss">
.ytomo-sequential-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10002;
  opacity: 0;
  animation: fadeIn 0.2s ease-out forwards;
}

.ytomo-sequential-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  min-width: 400px;
  max-width: 500px;
  transform: scale(0.9);
  animation: dialogAppear 0.2s ease-out forwards;

  h3 {
    margin: 0 0 24px 0;
    color: #374151;
    font-size: 20px;
    font-weight: 600;
  }
}

.ytomo-sequential-settings-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  
  .ytomo-mode-buttons {
    display: flex;
    gap: 8px;
  }
  
  .ytomo-mode-button {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    
    &:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }
    
    &.active {
      background: #2c5aa0;
      border-color: #2c5aa0;
      color: white;
    }
    
    &:focus {
      outline: none;
    }
  }
  
  .ytomo-interval-dropdown {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    font-size: 14px;
    min-width: 120px;
    
    &:focus {
      outline: none;
      border-color: #2c5aa0;
    }
  }
}

.ytomo-sequential-progress {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  
  .ytomo-sequential-target {
    flex: 1;
    font-size: 14px;
    color: #374151;
    
    .current-target {
      text-align: left;
      
      .pavilion-name {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
      }
      
      .time-slot-button {
        display: inline-block;
        padding: 4px 8px;
        background: #2c5aa0;
        color: white;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid #2c5aa0;
      }
    }
  }
  
  .ytomo-sequential-status {
    flex-shrink: 0;
    text-align: right;
    
    .ytomo-sequential-current {
      font-size: 18px;
      font-weight: 600;
      color: #2c5aa0;
      margin-bottom: 4px;
      
      .endless-indicator {
        margin-left: 8px;
        font-size: 16px;
      }
    }
    
    .ytomo-sequential-countdown {
      font-size: 16px;
      font-weight: 500;
      color: #ef4444;
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

@media (prefers-reduced-motion: reduce) {
  .ytomo-sequential-overlay,
  .ytomo-sequential-content {
    animation: none;
    transition: none;
  }
}
</style>