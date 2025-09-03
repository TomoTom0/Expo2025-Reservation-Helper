<template>
  <Teleport to="body">
    <div 
      v-if="scheduledReservationStore.uiState.showScheduleDialog"
      class="ytomo-schedule-dialog-overlay"
      @click.self="handleCloseDialog"
    >
      <div class="ytomo-schedule-dialog" @click.stop>
        <!-- ヘッダー -->
        <div class="ytomo-dialog-header">
          <h2 class="ytomo-dialog-title">スケジュール予約管理</h2>
          <button 
            class="ytomo-close-button"
            @click="handleCloseDialog"
          >
            ✕
          </button>
        </div>

        <!-- 上部管理エリア -->
        <div class="ytomo-management-area">
          <div class="ytomo-management-form">
            <div class="ytomo-form-group">
              <label class="ytomo-form-label">ラベル</label>
              <input 
                type="text" 
                v-model="editFormData.label"
                class="ytomo-form-input"
                placeholder="予約名"
                maxlength="50"
              >
            </div>
            
            <div class="ytomo-form-group">
              <label class="ytomo-form-label">実行日時</label>
              <div class="ytomo-datetime-inputs">
                <input 
                  type="date" 
                  v-model="editFormData.executeDate"
                  class="ytomo-form-input"
                  :min="minScheduleDate"
                >
                <input 
                  type="time" 
                  v-model="editFormData.executeTime"
                  class="ytomo-form-input"
                >
              </div>
            </div>
            
            <div class="ytomo-form-group">
              <label class="ytomo-form-label">繰り返し回数</label>
              <input 
                type="number" 
                v-model.number="editFormData.maxRetries"
                class="ytomo-form-input"
                min="1"
                max="200"
              >
            </div>
            
            <div class="ytomo-form-group">
              <label class="ytomo-form-label">間隔(秒)</label>
              <input 
                type="number" 
                v-model.number="editFormData.interval"
                class="ytomo-form-input"
                min="5"
                max="300"
              >
            </div>
            
            <div class="ytomo-form-group">
              <label class="ytomo-form-label">状態</label>
              <button 
                class="ytomo-toggle-button"
                :class="{ active: editFormData.isEnabled }"
                @click="editFormData.isEnabled = !editFormData.isEnabled"
              >
                {{ editFormData.isEnabled ? '有効' : '無効' }}
              </button>
            </div>
            
            <div class="ytomo-management-actions">
              <button 
                class="ytomo-action-button ytomo-duplicate-button"
                :disabled="!selectedSchedule"
                @click="handleDuplicateEdit"
              >
                複製編集
              </button>
              <button 
                class="ytomo-action-button ytomo-save-button"
                :disabled="!canSaveEditingSchedule"
                @click="handleSaveEditingSchedule"
              >
                保存
              </button>
              <button 
                class="ytomo-action-button ytomo-delete-button"
                :disabled="!selectedSchedule"
                @click="handleDeleteSchedule"
              >
                削除
              </button>
            </div>
          </div>
        </div>

        <!-- メインコンテンツエリア -->
        <div class="ytomo-dialog-content">
          <!-- 左サイドバー -->
          <div class="ytomo-schedule-list">
            <div class="ytomo-list-header">
              <h3>予約一覧</h3>
              <span class="ytomo-list-count">{{ scheduledReservationsArray.length }}件</span>
            </div>
            <div class="ytomo-list-items">
              <div 
                v-for="schedule in scheduledReservationsArray"
                :key="schedule.id"
                class="ytomo-schedule-item"
                :class="{ active: selectedScheduleId === schedule.id }"
                @click="selectSchedule(schedule)"
              >
                <div class="ytomo-schedule-info">
                  <div class="ytomo-schedule-label">{{ schedule.label }}</div>
                  <div class="ytomo-schedule-time">
                    {{ formatScheduleTime(schedule.executeAt) }}
                  </div>
                  <div class="ytomo-schedule-meta">
                    <span class="ytomo-timeslot-count">{{ schedule.selectedTimeSlots.length }}件</span>
                    <span 
                      class="ytomo-schedule-status"
                      :class="{ enabled: schedule.isEnabled, disabled: !schedule.isEnabled }"
                    >
                      {{ schedule.isEnabled ? '有効' : '無効' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div v-if="scheduledReservationsArray.length === 0" class="ytomo-empty-list">
                <p>スケジュール予約がありません</p>
              </div>
            </div>
          </div>

          <!-- 右メインエリア -->
          <div class="ytomo-schedule-details">
            <div v-if="selectedSchedule" class="ytomo-details-content">
              <div class="ytomo-details-header">
                <h3>{{ selectedSchedule.label }}</h3>
                <div class="ytomo-schedule-summary">
                  <span>{{ formatScheduleTime(selectedSchedule.executeAt) }}</span>
                  <span>・</span>
                  <span>{{ selectedSchedule.maxRetries }}回</span>
                  <span>・</span>
                  <span>{{ selectedSchedule.interval }}秒間隔</span>
                  <span>・</span>
                  <span :class="{ enabled: selectedSchedule.isEnabled, disabled: !selectedSchedule.isEnabled }">
                    {{ selectedSchedule.isEnabled ? '有効' : '無効' }}
                  </span>
                </div>
              </div>
              
              <div class="ytomo-timeslots-grid">
                <div 
                  v-for="timeSlot in selectedSchedule.selectedTimeSlots"
                  :key="`${timeSlot.pavilionId}-${timeSlot.timeSlot}`"
                  class="ytomo-timeslot-card"
                >
                  <div class="ytomo-pavilion-name">{{ timeSlot.pavilionName }}</div>
                  <div class="ytomo-timeslot-time">{{ formatTimeSlot(timeSlot.timeSlot) }}</div>
                  <div class="ytomo-entrance-date">{{ formatEntranceDate(timeSlot.entranceDate) }}</div>
                </div>
              </div>
            </div>
            
            <div v-else class="ytomo-no-selection">
              <p>左側から予約を選択してください</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useScheduledReservationStore } from '@/stores/scheduledReservation'
import { usePavilionsStore } from '@/stores/pavilions'
import { usePavilions } from '@/composables/usePavilions'
import type { ScheduledReservation, ScheduleFormData } from '@/types/scheduledReservation'
import { loggers } from '@/utils/logger'

const logger = loggers.ui

// Store アクセス
const scheduledReservationStore = useScheduledReservationStore()
const pavilionsStore = usePavilionsStore()
const { scheduledReservationsArray, selectedSchedule } = storeToRefs(scheduledReservationStore)

// Composable
const { searchPavilions } = usePavilions()

// ローカル状態
const selectedScheduleId = ref<string | null>(null)
const editFormData = ref<ScheduleFormData>({
  label: '',
  executeDate: '',
  executeTime: '',
  interval: 15,
  maxRetries: 10,
  isEnabled: true
})

// 計算プロパティ
const minScheduleDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const canSaveEditingSchedule = computed(() => {
  return editFormData.value.label.trim() !== '' &&
         editFormData.value.executeDate !== '' &&
         editFormData.value.executeTime !== ''
})

// 選択されたスケジュールの監視
watch(selectedScheduleId, (newId) => {
  scheduledReservationStore.selectSchedule(newId)
})

watch(selectedSchedule, (newSchedule) => {
  if (newSchedule) {
    // 編集フォームに選択されたスケジュールの内容を設定
    const executeDate = newSchedule.executeAt.toISOString().split('T')[0]
    const executeTime = newSchedule.executeAt.toTimeString().substring(0, 5)
    
    editFormData.value = {
      label: newSchedule.label,
      executeDate: executeDate,
      executeTime: executeTime,
      interval: newSchedule.interval,
      maxRetries: newSchedule.maxRetries,
      isEnabled: newSchedule.isEnabled
    }
  }
})

// メソッド
const handleCloseDialog = () => {
  scheduledReservationStore.hideScheduleDialog()
  selectedScheduleId.value = null
}

const selectSchedule = (schedule: ScheduledReservation) => {
  selectedScheduleId.value = schedule.id
  logger.info('スケジュール選択', { id: schedule.id, label: schedule.label })
}

const handleSaveEditingSchedule = () => {
  if (!selectedSchedule.value || !canSaveEditingSchedule.value) {
    logger.warn('スケジュール更新: 選択されたスケジュールまたは必要項目が不足')
    return
  }

  const schedule = selectedSchedule.value
  const success = scheduledReservationStore.updateScheduledReservation(
    schedule.id,
    editFormData.value,
    schedule.selectedTimeSlots
  )

  if (success) {
    logger.info('スケジュール更新成功', { id: schedule.id })
  }
}

const handleDeleteSchedule = () => {
  if (!selectedSchedule.value) {
    logger.warn('削除対象のスケジュールが選択されていない')
    return
  }

  const schedule = selectedSchedule.value
  if (confirm(`「${schedule.label}」を削除しますか？`)) {
    const success = scheduledReservationStore.deleteScheduledReservation(schedule.id)
    if (success) {
      selectedScheduleId.value = null
      logger.info('スケジュール削除成功')
    }
  }
}

const handleDuplicateEdit = async () => {
  if (!selectedSchedule.value) {
    logger.warn('複製対象のスケジュールが選択されていない')
    return
  }

  const originalSchedule = selectedSchedule.value
  
  // 複製を作成
  const newId = scheduledReservationStore.duplicateScheduledReservation(originalSchedule.id)
  if (!newId) {
    logger.error('スケジュール複製に失敗')
    return
  }

  // ダイアログを閉じる
  scheduledReservationStore.hideScheduleDialog()

  try {
    // 元のスケジュールの時間帯を自動選択するために検索を実行
    const originalTimeSlots = originalSchedule.selectedTimeSlots
    if (originalTimeSlots && originalTimeSlots.length > 0) {
      // 最初の時間帯のパビリオン名で検索
      const firstSlot = originalTimeSlots[0]
      if (firstSlot) {
        const pavilionName = firstSlot.pavilionName
        
        logger.info('複製編集: 自動検索開始', { pavilionName, timeSlotsCount: originalTimeSlots.length })
        
        // パビリオン検索を実行（検索フィールドに設定してから実行）
        // この部分は親コンポーネント（PavilionTab.vue）で処理される想定
        // グローバルイベントで通知
        const event = new CustomEvent('schedule-duplicate-edit', {
          detail: {
            newScheduleId: newId,
            originalTimeSlots: originalTimeSlots,
            searchQuery: pavilionName
          }
        })
        window.dispatchEvent(event)
      }
    }
  } catch (error) {
    logger.error('複製編集処理エラー', error)
  }
}

// フォーマット関数
const formatScheduleTime = (date: Date): string => {
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const formatTimeSlot = (timeStr: string): string => {
  // HHMM形式（例：1040, 1100）をHH:MM形式に変換
  if (timeStr && timeStr.length === 4) {
    const hour = timeStr.slice(0, 2)
    const minute = timeStr.slice(2, 4)
    return `${hour}:${minute}`
  }
  // 既にHH:MM形式の場合はそのまま返す
  if (timeStr && timeStr.includes(':')) {
    return timeStr
  }
  return timeStr || ''
}

const formatEntranceDate = (dateStr: string): string => {
  // YYYYMMDD形式（例：20250826）をMM/DD形式に変換
  if (dateStr && dateStr.length === 8) {
    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    const date = new Date(`${year}-${month}-${day}`)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
  return dateStr || ''
}
</script>

<style scoped lang="scss">
.ytomo-schedule-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10010;
  opacity: 0;
  animation: fadeIn 0.2s ease-out forwards;
}

.ytomo-schedule-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  height: 80%;
  max-height: 800px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transform: scale(0.9);
  animation: dialogAppear 0.2s ease-out forwards;
  overflow: hidden;
}

.ytomo-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.ytomo-dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.ytomo-close-button {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  &:focus {
    outline: none;
  }
}

.ytomo-management-area {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.ytomo-management-form {
  display: flex;
  align-items: end;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 1000px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.ytomo-form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ytomo-form-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.ytomo-form-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  width: 120px;

  &:focus {
    outline: none;
    border-color: #2c5aa0;
  }
}

.ytomo-datetime-inputs {
  display: flex;
  gap: 8px;
}

.ytomo-toggle-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;

  &.active {
    background: #22c55e;
    border-color: #22c55e;
    color: white;
  }

  &:hover {
    border-color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #2c5aa0;
  }
}

.ytomo-management-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;

  @media (max-width: 1000px) {
    margin-left: 0;
    justify-content: center;
  }
}

.ytomo-action-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;

  &:focus {
    outline: none;
  }

  &.ytomo-duplicate-button {
    background: #f59e0b;
    border-color: #f59e0b;
    color: white;

    &:hover:not(:disabled) {
      background: #d97706;
      border-color: #d97706;
    }
  }

  &.ytomo-save-button {
    background: #2c5aa0;
    border-color: #2c5aa0;
    color: white;

    &:hover:not(:disabled) {
      background: #1a365d;
      border-color: #1a365d;
    }
  }

  &.ytomo-delete-button {
    background: #ef4444;
    border-color: #ef4444;
    color: white;

    &:hover:not(:disabled) {
      background: #dc2626;
      border-color: #dc2626;
    }
  }

  &:disabled {
    background: #94a3b8;
    border-color: #94a3b8;
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.ytomo-dialog-content {
  flex: 1;
  display: flex;
  min-height: 0;
}

.ytomo-schedule-list {
  width: 300px;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.ytomo-list-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
  }
}

.ytomo-list-count {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.ytomo-list-items {
  flex: 1;
  overflow-y: auto;
}

.ytomo-schedule-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }

  &.active {
    background: #e0f2fe;
    border-left: 4px solid #2c5aa0;
    padding-left: 16px;
  }

  &:last-child {
    border-bottom: none;
  }
}

.ytomo-schedule-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ytomo-schedule-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  line-height: 1.3;
}

.ytomo-schedule-time {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.ytomo-schedule-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.ytomo-timeslot-count {
  color: #2c5aa0;
  font-weight: 600;
}

.ytomo-schedule-status {
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;

  &.enabled {
    background: #dcfce7;
    color: #166534;
  }

  &.disabled {
    background: #fef2f2;
    color: #991b1b;
  }
}

.ytomo-empty-list {
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.ytomo-schedule-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ytomo-details-content {
  padding: 20px 24px;
  flex: 1;
  overflow-y: auto;
}

.ytomo-details-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #374151;
  }
}

.ytomo-schedule-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;

  .enabled {
    color: #22c55e;
    font-weight: 600;
  }

  .disabled {
    color: #ef4444;
    font-weight: 600;
  }
}

.ytomo-timeslots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.ytomo-timeslot-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
  }
}

.ytomo-pavilion-name {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  line-height: 1.3;
}

.ytomo-timeslot-time {
  font-size: 16px;
  font-weight: 600;
  color: #2c5aa0;
  margin-bottom: 4px;
}

.ytomo-entrance-date {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.ytomo-no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 16px;
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
</style>