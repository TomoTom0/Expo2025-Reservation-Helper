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
          <button
            class="ytomo-hamburger-button"
            @click="toggleSidebar"
            v-if="isNarrowScreen"
          >
            ☰
          </button>
          <h2 class="ytomo-dialog-title">スケジュール予約管理</h2>
          <button
            class="ytomo-close-button"
            @click="handleCloseDialog"
          >
            ✕
          </button>
        </div>

        <!-- コンパクトアクションバー -->
        <div class="ytomo-action-bar">
          <button 
            class="ytomo-action-btn ytomo-btn-new"
            @click="handleNewSchedule"
          >
            + 新規
          </button>
        </div>

        <!-- メインコンテンツエリア -->
        <div class="ytomo-dialog-content">
          <!-- 左サイドバー -->
          <div class="ytomo-schedule-list" :class="{ 'sidebar-hidden': isNarrowScreen && !sidebarVisible }">
            <div class="ytomo-list-header">
              <h3>スケジュール一覧</h3>
              <span class="ytomo-list-count">{{ scheduledReservationsArray.length }}件</span>
            </div>
            <div class="ytomo-list-items">
              <div 
                v-for="schedule in scheduledReservationsArray"
                :key="schedule.id"
                class="ytomo-schedule-item"
                :class="{ 
                  active: selectedScheduleId === schedule.id,
                  running: scheduledReservationStore.executionState.activeSchedules.has(schedule.id)
                }"
                @click="selectSchedule(schedule)"
              >
                <div class="ytomo-schedule-info">
                  <div class="ytomo-schedule-header">
                    <div class="ytomo-schedule-label">{{ schedule.label }}</div>
                    <div class="ytomo-schedule-controls">
                      <button 
                        v-if="scheduledReservationStore.executionState.activeSchedules.has(schedule.id)"
                        class="ytomo-control-button ytomo-stop-button"
                        title="実行停止"
                        @click.stop="handleStopSchedule(schedule.id)"
                      >
                        ⏹️
                      </button>
                      <button 
                        v-else-if="schedule.isEnabled && isScheduleExecutable(schedule)"
                        class="ytomo-control-button ytomo-start-button" 
                        title="手動実行"
                        @click.stop="handleStartSchedule(schedule.id)"
                      >
                        ▶️
                      </button>
                    </div>
                  </div>
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
              <!-- インライン編集フォーム -->
              <div class="ytomo-inline-form">
                <div class="ytomo-form-row">
                  <label>ラベル</label>
                  <input 
                    type="text" 
                    v-model="editFormData.label"
                    class="ytomo-compact-input"
                    placeholder="予約名"
                  >
                </div>
                
                <div class="ytomo-form-row">
                  <label>実行時刻</label>
                  <div class="ytomo-datetime-compact">
                    <input 
                      type="date" 
                      v-model="editFormData.executeDate"
                      class="ytomo-compact-input"
                    >
                    <input 
                      type="time" 
                      v-model="editFormData.executeTime"
                      class="ytomo-compact-input"
                    >
                  </div>
                </div>
                
                <div class="ytomo-form-row">
                  <label>設定</label>
                  <div class="ytomo-settings-compact">
                    <span class="ytomo-setting-item">
                      <span class="ytomo-setting-label">回数</span>
                      <input 
                        type="number" 
                        v-model.number="editFormData.maxRetries"
                        class="ytomo-number-input"
                        min="1" max="200"
                      >
                    </span>
                    <span class="ytomo-setting-item">
                      <span class="ytomo-setting-label">間隔</span>
                      <input 
                        type="number" 
                        v-model.number="editFormData.interval"
                        class="ytomo-number-input"
                        min="5" max="300"
                      >秒
                    </span>
                    <button 
                      class="ytomo-toggle-compact"
                      :class="{ active: editFormData.isEnabled }"
                      @click="editFormData.isEnabled = !editFormData.isEnabled"
                    >
                      {{ editFormData.isEnabled ? '有効' : '無効' }}
                    </button>
                  </div>
                </div>
                
                <div class="ytomo-form-actions">
                  <button 
                    class="ytomo-save-btn"
                    :disabled="!canSaveEditingSchedule"
                    @click="handleSaveEditingSchedule"
                  >
                    保存
                  </button>
                  <button 
                    class="ytomo-duplicate-btn"
                    :disabled="!selectedSchedule"
                    @click="handleDuplicateEdit"
                  >
                    複製
                  </button>
                  <button 
                    class="ytomo-delete-btn"
                    :disabled="!selectedSchedule"
                    @click="handleDeleteSchedule"
                  >
                    削除
                  </button>
                </div>
              </div>
              
              <div class="ytomo-timeslots-grid">
                <div
                  v-for="timeSlot in selectedSchedule?.selectedTimeSlots || []"
                  :key="`${timeSlot.pavilionId}-${timeSlot.timeSlot}`"
                  class="ytomo-timeslot-card"
                  :class="{
                    running: isSelectedScheduleRunning,
                    [`execution-${pavilionsStore.getTimeSlotExecutionState(timeSlot.pavilionId, timeSlot.timeSlot)}`]: pavilionsStore.getTimeSlotExecutionState(timeSlot.pavilionId, timeSlot.timeSlot)
                  }"
                >
                  <div class="ytomo-timeslot-header">
                    <div class="ytomo-pavilion-name">{{ timeSlot.pavilionName }}</div>
                    <span
                      v-if="pavilionsStore.getTimeSlotExecutionState(timeSlot.pavilionId, timeSlot.timeSlot)"
                      class="ytomo-execution-icon"
                    >
                      <span v-if="pavilionsStore.getTimeSlotExecutionState(timeSlot.pavilionId, timeSlot.timeSlot) === 'executing'">⏳</span>
                      <span v-else-if="pavilionsStore.getTimeSlotExecutionState(timeSlot.pavilionId, timeSlot.timeSlot) === 'success'">✅</span>
                      <span v-else-if="pavilionsStore.getTimeSlotExecutionState(timeSlot.pavilionId, timeSlot.timeSlot) === 'failed'">❌</span>
                    </span>
                  </div>
                  <div class="ytomo-timeslot-time">{{ formatTimeSlot(timeSlot.timeSlot) }}</div>
                  <div class="ytomo-entrance-date">{{ formatEntranceDate(timeSlot.entranceDate) }}</div>
                </div>
              </div>
              
              <!-- 実行履歴セクション -->
              <div v-if="selectedScheduleExecutionHistory.length > 0" class="ytomo-execution-history">
                <h4>実行履歴</h4>
                <div class="ytomo-history-list">
                  <div 
                    v-for="record in selectedScheduleExecutionHistory" 
                    :key="`${record.scheduleId}-${record.executedAt.getTime()}`"
                    class="ytomo-history-item"
                    :class="{ success: record.success, failed: !record.success }"
                  >
                    <div class="ytomo-history-info">
                      <div class="ytomo-history-time">
                        {{ formatExecutionTime(record.executedAt) }}
                      </div>
                      <div class="ytomo-history-status">
                        <span class="ytomo-status-icon">{{ record.success ? '✅' : '❌' }}</span>
                        <span class="ytomo-status-text">
                          {{ record.success ? '成功' : '失敗' }}
                        </span>
                      </div>
                      <div v-if="record.error" class="ytomo-history-error">
                        {{ record.error }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="ytomo-no-selection">
              <p>
                <span class="ytomo-desktop-message">左側から予約を選択してください</span>
                <span class="ytomo-mobile-message">上部のドロップダウンから予約を選択してください</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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

// 画面幅とサイドバー表示状態
const isNarrowScreen = ref(false)
const sidebarVisible = ref(true)

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

const isSelectedScheduleRunning = computed(() => {
  if (!selectedSchedule.value?.id) return false
  return scheduledReservationStore.executionState.activeSchedules.has(selectedSchedule.value.id)
})

const selectedScheduleExecutionHistory = computed(() => {
  if (!selectedSchedule.value?.id) return []
  return scheduledReservationStore.executionState.executionHistory.filter(record => 
    record.scheduleId === selectedSchedule.value?.id
  )
})

// 選択されたスケジュールの監視
watch(selectedScheduleId, (newId) => {
  scheduledReservationStore.selectSchedule(newId)
})

// 画面幅の監視
const checkScreenSize = () => {
  const wasNarrowScreen = isNarrowScreen.value
  isNarrowScreen.value = window.innerWidth <= 768

  if (!isNarrowScreen.value) {
    sidebarVisible.value = true // デスクトップではサイドバーを常に表示
  } else {
    // ナロースクリーンでは初期状態で非表示にする
    if (!wasNarrowScreen) {
      sidebarVisible.value = false
    }
  }

  logger.debug('画面サイズ変更', {
    width: window.innerWidth,
    isNarrowScreen: isNarrowScreen.value,
    sidebarVisible: sidebarVisible.value,
    wasNarrowScreen
  })
}

onMounted(() => {
  // 初期状態でナロースクリーンかどうかを判定
  const initialIsNarrow = window.innerWidth <= 768
  isNarrowScreen.value = initialIsNarrow
  sidebarVisible.value = !initialIsNarrow // ナロースクリーンの場合は非表示、デスクトップの場合は表示

  window.addEventListener('resize', checkScreenSize)

  // 初期状態をログに出力
  logger.temp('スケジュールダイアログ初期化', {
    isNarrowScreen: isNarrowScreen.value,
    sidebarVisible: sidebarVisible.value,
    screenWidth: window.innerWidth
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

watch(selectedSchedule, (newSchedule) => {
  if (newSchedule?.executeAt) {
    // 編集フォームに選択されたスケジュールの内容を設定
    const executeDate = newSchedule.executeAt.toISOString().split('T')[0]
    const executeTimeString = newSchedule.executeAt.toTimeString()
    const executeTime = executeTimeString ? executeTimeString.substring(0, 5) : '09:00'
    
    editFormData.value = {
      label: newSchedule.label || '',
      executeDate: executeDate || '',
      executeTime: executeTime,
      interval: newSchedule.interval || 15,
      maxRetries: newSchedule.maxRetries || 10,
      isEnabled: newSchedule.isEnabled ?? true
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
  if (!canSaveEditingSchedule.value) {
    logger.warn('スケジュール保存: 必要項目が不足')
    return
  }

  const schedule = selectedSchedule.value
  
  if (schedule) {
    // 既存スケジュールの更新
    const success = scheduledReservationStore.updateScheduledReservation(
      schedule.id,
      editFormData.value,
      schedule.selectedTimeSlots
    )
    
    if (success) {
      logger.info('スケジュール更新成功', { id: schedule.id })
    }
  } else {
    // 新規スケジュール作成
    const newScheduleId = scheduledReservationStore.createScheduledReservation(
      editFormData.value,
      [] // 新規作成時は時間帯なし
    )
    
    if (newScheduleId) {
      selectedScheduleId.value = newScheduleId
      logger.info('新規スケジュール作成成功', { id: newScheduleId })
    }
  }
}

const handleDeleteSchedule = () => {
  const schedule = selectedSchedule.value
  if (!schedule) {
    logger.warn('削除対象のスケジュールが選択されていない')
    return
  }

  if (confirm(`「${schedule.label}」を削除しますか？`)) {
    const success = scheduledReservationStore.deleteScheduledReservation(schedule.id)
    if (success) {
      selectedScheduleId.value = null
      logger.info('スケジュール削除成功')
    }
  }
}

const handleNewSchedule = () => {
  // 新規スケジュール作成 - 選択をクリアして新規フォームを表示
  selectedScheduleId.value = null
  editFormData.value = {
    label: '新規予約',
    executeTime: '09:00',
    executeDate: new Date().toISOString().split('T')[0],
    interval: 30,
    maxRetries: 10,
    isEnabled: true
  }
  logger.info('新規スケジュール作成開始')
}

const handleDuplicateEdit = async () => {
  const originalSchedule = selectedSchedule.value
  if (!originalSchedule) {
    logger.warn('複製対象のスケジュールが選択されていない')
    return
  }
  
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
const formatScheduleTime = (date: Date | null | undefined): string => {
  if (!date) return ''
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

const formatExecutionTime = (date: Date): string => {
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// スケジュール実行可能判定
const isScheduleExecutable = (schedule: any): boolean => {
  // 有効で、時間帯が選択されている
  return schedule.isEnabled && schedule.selectedTimeSlots && schedule.selectedTimeSlots.length > 0
}

// スケジュール停止処理
const handleStopSchedule = (scheduleId: string) => {
  scheduledReservationStore.stopScheduleExecution(scheduleId)
  logger.info('スケジュール手動停止', { scheduleId })
}

// スケジュール開始処理（手動実行）
const handleStartSchedule = (scheduleId: string) => {
  const success = scheduledReservationStore.startScheduleExecution(scheduleId)
  if (success) {
    logger.info('スケジュール手動開始', { scheduleId })
  } else {
    logger.warn('スケジュール開始失敗', { scheduleId })
  }
}

// サイドバー表示切り替え
const toggleSidebar = () => {
  const oldValue = sidebarVisible.value
  sidebarVisible.value = !sidebarVisible.value
  logger.temp('サイドバー表示切り替え', {
    oldValue,
    newValue: sidebarVisible.value,
    isNarrowScreen: isNarrowScreen.value,
    shouldHide: isNarrowScreen.value && !sidebarVisible.value
  })
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
  padding: 16px;
}

.ytomo-schedule-dialog {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1000px; /* コンパクト化 */
  height: 85vh; /* ビューポート基準 */
  max-height: 700px; /* 最大高さ削減 */
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transform: scale(0.9);
  animation: dialogAppear 0.2s ease-out forwards;
  overflow: hidden;
  
  /* レスポンシブ対応 */
  @media (max-width: 768px) {
    width: 95%;
    height: 90vh;
    max-height: none;
    border-radius: 8px;
  }
  
  @media (max-width: 480px) {
    width: 98%;
    height: 95vh;
    margin: 8px;
  }
}

.ytomo-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    padding: 12px 16px;
  }
}

.ytomo-dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
}

.ytomo-hamburger-button {
  background: none;
  border: none;
  font-size: 18px;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.2);
  }

  @media (min-width: 769px) {
    display: none;
  }
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

/* アクションバースタイル */
.ytomo-action-bar {
  padding: 12px 20px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  background: #f8fafc;
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    flex-wrap: wrap;
    padding: 8px 16px;
  }
}

.ytomo-action-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  min-width: 0;
  
  &:focus {
    outline: none;
  }
  
  &.ytomo-btn-new {
    background: #2c5aa0;
    border-color: #2c5aa0;
    color: white;
    
    &:hover:not(:disabled) {
      background: #1a365d;
      border-color: #1a365d;
    }
  }
  
  /* 複製ボタンスタイルを削除 */
  
  /* 削除ボタンスタイルを削除 */
  
  &:disabled {
    background: #94a3b8;
    border-color: #94a3b8;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
    flex: 1;
  }
}

/* インラインフォームスタイル */
.ytomo-inline-form {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 16px;
  }
}

.ytomo-form-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
  
  label {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    min-width: 60px;
    
    @media (max-width: 640px) {
      min-width: 0;
    }
  }
}

.ytomo-compact-input {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.2s;
  flex: 1;
  
  &:focus {
    outline: none;
    border-color: #2c5aa0;
  }
}

.ytomo-datetime-compact {
  display: flex;
  gap: 8px;
  flex: 1;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 6px;
  }
}

.ytomo-settings-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}

.ytomo-setting-item {
  display: flex;
  align-items: center;
  gap: 6px;
  
  .ytomo-setting-label {
    font-size: 11px;
    color: #6b7280;
    white-space: nowrap;
  }
}

.ytomo-number-input {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  width: 50px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #2c5aa0;
  }
}

.ytomo-toggle-compact {
  padding: 4px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 50px;
  
  &.active {
    background: #22c55e;
    border-color: #22c55e;
    color: white;
  }
  
  &:hover {
    border-color: #9ca3af;
  }
}

.ytomo-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  
  @media (max-width: 480px) {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.ytomo-save-btn,
.ytomo-duplicate-btn,
.ytomo-delete-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  min-width: 0;
  
  &:focus {
    outline: none;
  }
  
  &:disabled {
    background: #94a3b8;
    border-color: #94a3b8;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  @media (max-width: 480px) {
    flex: 1;
    min-width: 80px;
  }
}

.ytomo-save-btn {
  background: #2c5aa0;
  border-color: #2c5aa0;
  color: white;
  
  &:hover:not(:disabled) {
    background: #1a365d;
    border-color: #1a365d;
  }
}

.ytomo-duplicate-btn {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
  
  &:hover:not(:disabled) {
    background: #d97706;
    border-color: #d97706;
  }
}

.ytomo-delete-btn {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
  
  &:hover:not(:disabled) {
    background: #dc2626;
    border-color: #dc2626;
  }
}

/* 不要なスタイルを削除済み */

.ytomo-dialog-content {
  flex: 1;
  display: flex;
  min-height: 0;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
}

.ytomo-schedule-list {
  width: 280px; /* コンパクト化 */
  min-width: 280px;
  max-width: 280px;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    width: 250px;
    min-width: 250px;
    max-width: 250px;
    position: relative;
    z-index: 10;
    background: white;

    &.sidebar-hidden {
      transform: translateX(-100%);
    }
  }

  @media (max-width: 640px) {
    display: none; /* モバイルでは非表示 */
  }
}

.ytomo-list-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 14px; /* コンパクト化 */
    font-weight: 600;
    color: #374151;
  }
  
  @media (max-width: 768px) {
    padding: 10px 14px;
    
    h3 {
      font-size: 13px;
    }
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
  padding: 12px 16px; /* コンパクト化 */
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 10px 14px;
  }

  &:hover {
    background: #f8fafc;
  }

  &.active {
    background: #e0f2fe;
    border-left: 4px solid #2c5aa0;
    padding-left: 16px;
    box-sizing: border-box; /* ボックスサイズを固定 */
  }

  &.running {
    background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
    border-left: 4px solid #e53e3e;
    padding-left: 16px;
    position: relative;
    box-sizing: border-box; /* ボックスサイズを固定 */
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(229, 62, 62, 0.1) 50%, 
        transparent 100%
      );
      animation: ytomo-schedule-running-glow 2s ease-in-out infinite;
    }
    
    .ytomo-schedule-label {
      color: #c53030;
      font-weight: 700;
    }
    
    .ytomo-schedule-time {
      color: #e53e3e;
      font-weight: 600;
    }
    
    &.active {
      background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
      border-left-color: #ed8936;
    }
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

.ytomo-schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ytomo-schedule-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  line-height: 1.3;
  flex: 1;
  min-width: 0; /* テキストが長い場合の省略対応 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ytomo-schedule-controls {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.ytomo-control-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: scale(1.1);
  }
  
  &.ytomo-stop-button:hover {
    background: rgba(239, 68, 68, 0.1);
  }
  
  &.ytomo-start-button:hover {
    background: rgba(34, 197, 94, 0.1);
  }
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
  
  @media (max-width: 640px) {
    /* モバイルでスケジュール選択ドロップダウンを表示 */
    &::before {
      content: '';
      display: block;
      padding: 12px 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
      color: #6b7280;
    }
  }
}

.ytomo-details-content {
  padding: 16px 20px; /* コンパクト化 */
  flex: 1;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 14px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
  }
}

/* 使用しないヘッダースタイルを削除 */

.ytomo-timeslots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* コンパクト化 */
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

.ytomo-timeslot-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px; /* コンパクト化 */
  transition: all 0.2s;
  
  @media (max-width: 768px) {
    padding: 10px;
  }

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
  }
  
  &.running {
    background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
    border: 2px solid #fca5a5;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 10px;
      background: linear-gradient(45deg, #fca5a5, #f87171, #ef4444, #dc2626);
      background-size: 300% 300%;
      animation: ytomo-timeslot-running-border 3s ease-in-out infinite;
      z-index: -1;
    }
    
    .ytomo-pavilion-name {
      color: #dc2626;
      font-weight: 700;
    }
    
    .ytomo-timeslot-time {
      color: #ef4444;
      font-weight: 700;
    }
    
    .ytomo-entrance-date {
      color: #991b1b;
      font-weight: 600;
    }
  }

  /* 実行状態スタイル */
  &.execution-executing {
    border: 2px solid #3b82f6;
    animation: executionPulse 1.5s ease-in-out infinite;
  }

  &.execution-success {
    border: 2px solid #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
  }

  &.execution-failed {
    border: 2px solid #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
  }
}

.ytomo-timeslot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;

  .ytomo-execution-icon {
    font-size: 16px;
    line-height: 1;

    &:has([data-state="executing"]) {
      animation: spin 1s linear infinite;
    }
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

/* 実行中アニメーション */
@keyframes ytomo-schedule-running-glow {
  0%, 100% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    transform: translateX(100%);
    opacity: 1;
  }
}

@keyframes ytomo-timeslot-running-border {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 実行履歴 */
.ytomo-execution-history {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;

  h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
  }
}

.ytomo-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.ytomo-history-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
  }

  &.success {
    border-left: 4px solid #10b981;
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  }

  &.failed {
    border-left: 4px solid #ef4444;
    background: linear-gradient(135deg, #fef2f2 0%, #fef1f1 100%);
  }
}

.ytomo-history-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ytomo-history-time {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.ytomo-history-status {
  display: flex;
  align-items: center;
  gap: 8px;

  .ytomo-status-icon {
    font-size: 16px;
  }

  .ytomo-status-text {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }
}

.ytomo-history-error {
  font-size: 12px;
  color: #dc2626;
  background: #fef2f2;
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #fecaca;
  margin-top: 4px;
}

.ytomo-no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
  padding: 40px 20px;
  
  @media (max-width: 480px) {
    font-size: 13px;
    padding: 30px 16px;
  }
  
  .ytomo-mobile-message {
    display: none;
    
    @media (max-width: 640px) {
      display: inline;
    }
  }
  
  .ytomo-desktop-message {
    @media (max-width: 640px) {
      display: none;
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

@keyframes executionPulse {
  0%, 100% {
    box-shadow: 0 0 4px rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.8);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>