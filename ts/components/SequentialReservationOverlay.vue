<template>
  <Teleport to="body">
    <div 
      v-if="overlaysStore.sequentialOverlayVisible"
      class="ytomo-sequential-overlay"
      id="ytomo-sequential-overlay"
      @click="handleOverlayClick"
    >
      <div class="ytomo-sequential-content">
        <h3>順次予約実行中</h3>
        <div class="ytomo-sequential-settings">
          <div class="ytomo-mode-setting">
            <label>実行モード:</label>
            <div class="ytomo-mode-buttons">
              <button 
                id="ytomo-reservation-mode" 
                class="ytomo-mode-button"
                :class="{ active: !overlaysStore.sequentialState.isMonitoringMode }"
                @click="switchToReservationMode"
              >
                予約モード
              </button>
              <button 
                id="ytomo-monitoring-mode" 
                class="ytomo-mode-button"
                :class="{ active: overlaysStore.sequentialState.isMonitoringMode }"
                @click="switchToMonitoringMode"
              >
                監視モード
              </button>
            </div>
          </div>
          <div class="ytomo-interval-setting">
            <label for="ytomo-interval-select">実行間隔:</label>
            <select 
              id="ytomo-interval-select" 
              class="ytomo-interval-dropdown"
              :value="overlaysStore.sequentialState.currentInterval"
              @change="onIntervalChange"
            >
              <option v-if="!overlaysStore.sequentialState.isMonitoringMode" value="1">1秒</option>
              <option value="5">5秒</option>
              <option value="15">15秒</option>
              <option value="30">30秒</option>
              <option value="60">60秒</option>
            </select>
          </div>
        </div>
        <div class="ytomo-sequential-progress">
          <div class="ytomo-sequential-current">
            {{ overlaysStore.sequentialState.currentReservationIndex }}/{{ overlaysStore.sequentialState.totalReservationsCount }}
          </div>
          <div class="ytomo-sequential-target">{{ overlaysStore.sequentialState.currentTarget }}</div>
          <div class="ytomo-sequential-countdown">{{ overlaysStore.sequentialState.countdownText }}</div>
        </div>
        <div class="ytomo-sequential-controls">
          <button 
            id="ytomo-cancel-sequential" 
            class="ytomo-cancel-button"
            @click="cancelSequentialReservation"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useOverlaysStore } from '@/stores/overlays'

const overlaysStore = useOverlaysStore()

const handleOverlayClick = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
}

const switchToReservationMode = () => {
  overlaysStore.switchSequentialMode(false)
}

const switchToMonitoringMode = () => {
  overlaysStore.switchSequentialMode(true)
}

const onIntervalChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  overlaysStore.setSequentialInterval(parseInt(target.value))
}

const cancelSequentialReservation = () => {
  overlaysStore.hideSequentialOverlay()
  console.log('🚫 順次予約をキャンセルしました')
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

.ytomo-sequential-settings {
  margin-bottom: 24px;
  
  .ytomo-mode-setting {
    margin-bottom: 16px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }
  }
  
  .ytomo-mode-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
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
  
  .ytomo-interval-setting {
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
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
  
  .ytomo-sequential-current {
    font-size: 18px;
    font-weight: 600;
    color: #2c5aa0;
    margin-bottom: 8px;
  }
  
  .ytomo-sequential-target {
    font-size: 14px;
    color: #374151;
    margin-bottom: 4px;
  }
  
  .ytomo-sequential-countdown {
    font-size: 16px;
    font-weight: 500;
    color: #ef4444;
  }
}

.ytomo-cancel-button {
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #4b5563;
  }

  &:focus {
    outline: none;
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