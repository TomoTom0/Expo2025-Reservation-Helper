<template>
  <Teleport to="body">
    <div 
      v-if="sequentialReservationStore.state.isRunning"
      class="ytomo-sequential-overlay"
      id="ytomo-sequential-overlay"
      @click="handleOverlayClick"
    >
      <div class="ytomo-sequential-content">
        <div class="ytomo-header-with-spinner">
          <div class="ytomo-loading-spinner"></div>
          <h3>
            順次予約実行中 {{ sequentialReservationStore.state.currentTargetIndex + 1 }}/{{ sequentialReservationStore.state.reservationTargets.length }}
            <span class="status-text">待機中</span>
          </h3>
          <div class="ytomo-progress-bar">
            <div 
              class="ytomo-progress-fill" 
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>
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
          <button 
            class="ytomo-cancel-button"
            @click="cancelSequentialReservation"
          >
            中断
          </button>
        </div>
        <div class="ytomo-sequential-progress">
          <div class="ytomo-sequential-target">
            <div v-if="currentTarget" class="current-target">
              <div class="pavilion-name">{{ currentTarget.pavilionName }}</div>
              <div class="time-slot-button time-slot-small">{{ currentTarget.timeSlot }}</div>
            </div>
          </div>
          <!-- パビリオン名横の「1/1」表示を削除 -->
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

const progressPercentage = computed(() => {
  const countdownText = sequentialReservationStore.state.countdownText
  if (!countdownText) return 0
  
  // カウントダウンテキストから秒数を抽出
  const match = countdownText.match(/(\d+)/)
  if (!match) return 0
  
  const currentSeconds = parseInt(match[1])
  const intervalTime = sequentialReservationStore.state.nextIntervalTime || 30
  
  // 残り時間の逆算でプログレスバーを表示（0%から100%へ）
  const progress = ((intervalTime - currentSeconds) / intervalTime) * 100
  return Math.max(0, Math.min(100, progress))
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

  .ytomo-header-with-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .ytomo-loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f4f6;
    border-top: 2px solid #2c5aa0;
    border-radius: 50%;
    animation: spin 1s linear infinite !important;
    will-change: transform;
  }

  h3 {
    margin: 0 0 12px 0;
    color: #374151;
    font-size: 20px;
    font-weight: 600;
    
    .status-text {
      display: inline-block;
      font-size: 16px;
      color: #6b7280;
      font-weight: 400;
      margin-left: 8px;
    }
  }
  
  .ytomo-progress-bar {
    width: 100%;
    height: 8px;
    background-color: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 4px;
    
    .ytomo-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
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
        
        &.time-slot-small {
          font-size: 10px;
          padding: 2px 6px;
        }
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ytomo-sequential-overlay,
  .ytomo-sequential-content {
    animation: none;
    transition: none;
  }
  
  .ytomo-loading-spinner {
    animation: spin 1s linear infinite !important;
  }
}
</style>