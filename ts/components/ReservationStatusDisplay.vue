<template>
  <div v-if="reservationStatus.visible" class="ytomo-reservation-status" :class="reservationStatus.statusClass">
    <div class="ytomo-status-content">
      <div v-if="reservationStatus.isActive" class="ytomo-status-icon spinning">
        <svg viewBox="0 0 24 24">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
        </svg>
      </div>
      <div class="ytomo-status-details">
        <div class="ytomo-status-current">
          <template v-if="isReservationRunning && waitInfo.isWaiting">
            予約待機中 - {{ waitInfo.waitEndTime ? formatTime(waitInfo.waitEndTime) : '' }}まで
          </template>
          <template v-else-if="isReservationRunning">
            {{ reservationStatus.currentAction }}
          </template>
          <template v-else>
            {{ reservationStatus.currentAction }}
          </template>
        </div>
        <div v-if="reservationStatus.statusClass === 'success' && reservationStatus.dateChange" class="ytomo-datetime-change">
          {{ reservationStatus.dateChange }}
        </div>
        <div v-if="isReservationRunning && (reservationStatus.isActive || waitInfo.isWaiting)" class="ytomo-status-progress">
          <div class="ytomo-progress-bar">
            <div class="ytomo-progress-fill" :style="{
              width: waitInfo.isWaiting
                ? waitInfo.progress + '%'
                : reservationStatus.progress + '%'
            }"></div>
          </div>
        </div>

        <!-- 実行履歴表示 -->
        <div v-if="reservationHistory.length > 0" class="ytomo-execution-history">
          <div class="ytomo-history-items">
            <div v-for="(result, index) in reservationHistory" :key="index"
                 class="ytomo-history-item" :class="result.success ? 'success' : 'failure'">
              <span class="ytomo-history-result">{{ result.success ? '成功' : '' }}</span>
              <span class="ytomo-history-detail">{{ result.gate }}{{ result.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ReservationStatus {
  visible: boolean
  isActive: boolean
  currentAction: string
  progress: number
  progressText: string
  statusClass: string
  dateChange?: string
}

interface WaitInfo {
  isWaiting: boolean
  waitEndTime: Date | null
  progress: number
}

interface ReservationResult {
  success: boolean
  gate: string
  time: string
}

interface Props {
  reservationStatus: ReservationStatus
  waitInfo: WaitInfo
  reservationHistory: ReservationResult[]
  isReservationRunning: boolean
  formatTime: (date: Date) => string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.ytomo-reservation-status {
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px;
  margin-top: 0;

  &.success {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-color: #059669;
  }

  &.cancelled {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border-color: #6b7280;
  }

  .ytomo-status-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .ytomo-status-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      margin-top: 2px;

      svg {
        width: 100%;
        height: 100%;
        fill: #d97706;
      }

      &.spinning svg {
        animation: spin 1s linear infinite;
      }
    }

    .ytomo-status-details {
      .ytomo-status-current {
        font-size: 12px;
        color: #92400e;
        margin-bottom: 8px;
        font-weight: 500;

        .ytomo-wait-time-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ytomo-wait-text {
          flex-shrink: 0;
        }
      }

      .ytomo-datetime-change {
        font-size: 11px;
        color: #059669;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .ytomo-status-progress {
        .ytomo-progress-bar {
          width: 200px;
          height: 6px;
          background: rgba(217, 119, 6, 0.2);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 4px;

          .ytomo-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
            transition: width 0.3s ease;
          }
        }

        .ytomo-progress-text {
          font-size: 11px;
          color: #78716c;
          text-align: right;
          display: block;
        }
      }

      .ytomo-execution-history {
        margin-top: 8px;

        .ytomo-history-items {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;

          .ytomo-history-item {
            display: flex;
            align-items: center;
            gap: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 10px;

            &.success {
              background: rgba(34, 197, 94, 0.2);
              border: 1px solid rgba(34, 197, 94, 0.3);
            }

            &.failure {
              background: rgba(239, 68, 68, 0.2);
              border: 1px solid rgba(239, 68, 68, 0.3);
            }

            .ytomo-history-result {
              font-weight: 600;
              color: #059669;
            }

            .ytomo-history-detail {
              color: #6b7280;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>