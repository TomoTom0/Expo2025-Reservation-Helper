<template>
  <div class="ytomo-ticket-tab">
    <!-- チケット簡易選択エリア -->
    <div class="ytomo-quick-select">
      <label class="ytomo-toggle-container">
        <input 
          type="checkbox" 
          id="own-only-toggle" 
          class="ytomo-toggle-input"
          v-model="isOwnOnlyToggle"
          @change="handleOwnOnlyToggle"
        >
        <span class="ytomo-toggle-slider"></span>
        <span class="ytomo-toggle-label">自分</span>
      </label>
      <div class="ytomo-date-buttons">
        <button 
          v-for="date in availableDates"
          :key="date"
          class="ytomo-date-button"
          :class="{ selected: isDateSelected(date) }"
          :data-date="date"
          @click="handleDateSelection(date)"
        >
          {{ formatDate(date) }}
        </button>
      </div>
    </div>

    <!-- チケット一覧エリア -->
    <div class="ytomo-ticket-list" id="ticket-list-container">
      <!-- ローディング状態 -->
      <div v-if="isLoading" class="ytomo-loading">
        <p>チケット情報を読み込み中...</p>
      </div>
      
      <!-- エラー状態 -->
      <div v-else-if="errorMessage" class="ytomo-error">
        <h3>エラー</h3>
        <p>{{ errorMessage }}</p>
        <button class="ytomo-button retry-button" @click="retryLoad">
          再試行
        </button>
      </div>
      
      <!-- チケットが存在しない場合 -->
      <div v-else-if="filteredTickets.length === 0" class="ytomo-empty-state">
        <p>{{ emptyMessage }}</p>
      </div>
      
      <!-- チケット一覧 -->
      <div 
        v-else
        v-for="ticket in filteredTickets" 
        :key="ticket.ticket_id"
        class="ytomo-ticket-item" 
        :class="{ 
          selected: false
        }"
        :data-ticket-id="ticket.ticket_id"
        @click="handleTicketSelection(ticket)"
      >
        <!-- 上半分: チケットID、Tip -->
        <div class="ytomo-ticket-upper">
          <span class="ytomo-ticket-id">{{ ticket.ticket_id }}</span>
          <span 
            :class="ticket.isOwn === false ? 'ytomo-external-tip' : 'ytomo-me-tip'"
          >
            {{ ticket.isOwn === false ? (ticket.label || 'External') : 'Me' }}
          </span>
        </div>
        
        <!-- 下半分: 入場日時ボタン（予約種類も含む） -->
        <div class="ytomo-ticket-lower">
          <div class="ytomo-entrance-dates">
            <!-- 入場予約がない場合 -->
            <span 
              v-if="!ticket.schedules || ticket.schedules.length === 0"
              class="ytomo-no-entrance-dates"
            >
              入場予約なし
            </span>
            
            <!-- 利用可能な入場予約がない場合 -->
            <span 
              v-else-if="getVisibleSchedules(ticket).length === 0"
              class="ytomo-no-entrance-dates"
            >
              利用可能な入場予約なし
            </span>
            
            <!-- 入場日時ボタン -->
            <button
              v-else
              v-for="schedule in getVisibleSchedules(ticket)"
              :key="`${schedule.entrance_date}-${schedule.schedule_name}`"
              class="ytomo-entrance-date-button"
              :class="{ 
                disabled: getReservationStatus(schedule, ticket).availableTypes.length === 0,
                selected: isScheduleSelected(schedule, ticket)
              }"
              :data-date="schedule.entrance_date"
              :data-use-state="schedule.use_state"
              :data-available-types="getReservationStatus(schedule, ticket).availableTypes.join(',')"
              :disabled="getReservationStatus(schedule, ticket).availableTypes.length === 0"
              @click="handleEntranceDateSelection(schedule, ticket, $event)"
            >
              <span class="ytomo-date-text">
                {{ formatDate(schedule.entrance_date) }} {{ (schedule.schedule_name || extractTimeFromSchedule(schedule)).replace(/-$/, '') }}
              </span>
              <div class="ytomo-reservation-status">
                {{ getReservationStatus(schedule, ticket).statusText }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- チケットID追加（同様のレイアウト） -->
    <div class="ytomo-ticket-item ytomo-add-ticket-item">
      <div class="ytomo-ticket-upper">
        <input 
          type="text" 
          id="ticket-id-input" 
          placeholder="チケットID" 
          class="ytomo-input-inline ytomo-input-ticket-id"
          v-model="newTicketId"
        >
        <input 
          type="text" 
          id="ticket-label-input" 
          placeholder="Label" 
          class="ytomo-input-inline ytomo-input-label"
          v-model="newTicketLabel"
        >
        <select 
          id="channel-select" 
          class="ytomo-select-inline"
          v-model="selectedChannel"
        >
          <option value="5">1</option>
          <option value="4">3</option>
          <option value="3">週</option>
          <option value="2">月</option>
        </select>
        <button 
          id="add-ticket-button" 
          class="ytomo-button primary"
          @click="handleAddTicket"
          :disabled="!newTicketId.trim()"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTicketsStore } from '@/stores/tickets'
import { useMainDialogStore } from '@/stores/mainDialog'
import { useTickets } from '@/composables/useTickets'
import { loggers } from '@/utils/logger'
import type { ScheduleData, TicketData, LotteryCalendarData, ReservationResult } from '@/types/api'

const logger = loggers.ui

interface ReservationStatus {
  statusText: string
  availableTypes: string[]
}

// Store アクセス
const ticketsStore = useTicketsStore()
const mainDialogStore = useMainDialogStore()
const { ticketsArray, isLoading, selectedTickets } = storeToRefs(ticketsStore)

// Composable使用
const { loadAllTickets } = useTickets()

// ローカル状態
const isOwnOnlyToggle = ref(false)
const selectedDateFilter = ref<string | null>(null) // 日付フィルター用の独立した状態
const newTicketId = ref('')
const newTicketLabel = ref('')
const selectedChannel = ref('5')

// 計算プロパティ
const availableDates = computed(() => {
  const dates = new Set<string>()
  ticketsArray.value.forEach((ticket: TicketData) => {
    if (ticket.schedules) {
      ticket.schedules
        .filter((schedule: ScheduleData) => schedule.isEffective === true)
        .forEach((schedule: ScheduleData) => dates.add(schedule.entrance_date))
    }
  })
  return Array.from(dates).sort()
})

// 選択されたスケジュール情報を集計
const selectedSchedules = computed(() => {
  const selected: ScheduleData[] = []
  ticketsArray.value.forEach((ticket: TicketData) => {
    ticket.schedules?.forEach((schedule: ScheduleData) => {
      if (schedule.selected) {
        selected.push(schedule)
      }
    })
  })
  return selected
})

// 選択された入場日付（単一、最初の選択から取得）
const selectedEntranceDate = computed(() => {
  return selectedSchedules.value.length > 0 
    ? selectedSchedules.value[0].entrance_date 
    : null
})

// 選択された時間一覧
const selectedEntranceTimes = computed(() => {
  return selectedSchedules.value.map(schedule => 
    schedule.schedule_name || extractTimeFromSchedule(schedule)
  )
})

const filteredTickets = computed(() => {
  return ticketsArray.value.filter((ticket: TicketData) => {
    // 自分のみフィルター
    if (isOwnOnlyToggle.value && ticket.isOwn === false) {
      return false
    }
    
    // 有効な入場予約があるチケットのみ
    const validSchedules = ticket.schedules?.filter((schedule: ScheduleData) => schedule.isEffective === true) || []
    return validSchedules.length > 0
  })
})

const emptyMessage = computed(() => {
  if (ticketsArray.value.length === 0) {
    return 'チケットが見つかりませんでした'
  }
  if (filteredTickets.value.length === 0 && isOwnOnlyToggle.value) {
    return 'フィルター条件に該当するチケットがありません'
  }
  return '利用可能なチケットが見つかりませんでした'
})

// メソッド
const handleOwnOnlyToggle = () => {
  logger.debug('自分のみ表示', { isOwnOnlyToggle: isOwnOnlyToggle.value })
}

const handleDateSelection = (date: string) => {
  logger.debug('日付ボタン選択', { date })
  
  // その日付のすべての有効なスケジュールを選択/選択解除
  const dateSchedules: ScheduleData[] = []
  ticketsArray.value.forEach((ticket: TicketData) => {
    ticket.schedules?.forEach((schedule: ScheduleData) => {
      if (schedule.entrance_date === date && schedule.isEffective === true) {
        dateSchedules.push(schedule)
      }
    })
  })
  
  if (dateSchedules.length === 0) return
  
  // その日付のスケジュールがすべて選択されている場合は選択解除、そうでなければ全選択
  const allSelected = dateSchedules.every(schedule => schedule.selected)
  const newSelectedState = !allSelected
  
  // 分散状態更新: その日付のすべてのスケジュールの選択状態を更新
  ticketsArray.value.forEach((ticket: TicketData) => {
    if (ticket.schedules) {
      ticket.schedules.forEach((schedule: ScheduleData) => {
        if (schedule.entrance_date === date && schedule.isEffective === true) {
          schedule.selected = newSelectedState
          
          // 永続化状態を更新
          if (newSelectedState) {
            const scheduleId = schedule.entrance_date + (schedule.time_start || '')
            ticketsStore.saveSelectedEntranceDate(ticket.ticket_id, scheduleId)
          } else {
            ticketsStore.removeSelectedEntranceDate(ticket.ticket_id)
          }
        }
      })
    }
  })
  
  logger.info('日付スケジュール操作', { date, 操作: newSelectedState ? '全選択' : '全選択解除', 件数: dateSchedules.length })
}

const handleTicketSelection = (ticket: TicketData) => {
  // チケット選択ロジック（既存実装に従い、入場予約選択で連動するため無効化予定）
  logger.info('チケット選択', { ticketId: ticket.ticket_id })
}

const handleEntranceDateSelection = (schedule: ScheduleData, ticket: TicketData, event: Event) => {
  event.stopPropagation()
  const target = event.target as HTMLButtonElement
  if (target.disabled) return
  
  const date = schedule.entrance_date
  logger.info('入場日時選択', {
    ticketId: ticket.ticket_id,
    date: date,
    scheduleName: schedule.schedule_name
  })
  
  // 入場日付は常に一つに限定される: 他の日付のスケジュール選択を解除
  if (schedule.selected === false || !schedule.selected) {
    ticketsArray.value.forEach((t: TicketData) => {
      t.schedules?.forEach((s: ScheduleData) => {
        if (s.entrance_date !== date && s.selected) {
          s.selected = false
          // 永続化状態からも削除（チケット選択状態は維持）
          ticketsStore.removeSelectedEntranceDate(t.ticket_id)
        }
      })
    })
  }
  
  // この特定のスケジュールの選択状態をトグル
  schedule.selected = !schedule.selected
  
  
  // 永続化状態を更新
  if (schedule.selected) {
    const scheduleId = schedule.entrance_date + (schedule.time_start || '')
    ticketsStore.saveSelectedEntranceDate(ticket.ticket_id, scheduleId)
  } else {
    ticketsStore.removeSelectedEntranceDate(ticket.ticket_id)
  }
  
  logger.info('入場日時状態変更', { date, scheduleName: schedule.schedule_name || '', 状態: schedule.selected ? '選択' : '選択解除' })
}

const handleAddTicket = async () => {
  if (!newTicketId.value.trim()) return
  
  logger.info('チケット追加', {
    id: newTicketId.value,
    label: newTicketLabel.value,
    channel: selectedChannel.value
  })
  
  // 既存のチケット追加処理を実装
  // 入力値をクリア
  newTicketId.value = ''
  newTicketLabel.value = ''
  selectedChannel.value = '5'
}

const retryLoad = async () => {
  await loadAllTickets()
}

// ヘルパーメソッド
const formatDate = (dateStr: string): string => {
  // YYYYMMDD形式（例：20250826）をパース
  if (dateStr && dateStr.length === 8) {
    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    const date = new Date(`${year}-${month}-${day}`)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
  return dateStr
}

const getVisibleSchedules = (ticket: TicketData): ScheduleData[] => {
  if (!Array.isArray(ticket.schedules)) return []
  return ticket.schedules.filter(schedule => schedule.isEffective === true)
}

const extractTimeFromSchedule = (schedule: ScheduleData): string => {
  // 既存実装のextractTimeFromScheduleメソッドを移植
  return schedule.schedule_name || ''
}

const getReservationStatus = (schedule: ScheduleData, ticket: TicketData): ReservationStatus => {
  // TODO: 既存実装のgetReservationStatusメソッドを正確に移植
  // 一時的な実装
  return {
    statusText: '',
    availableTypes: ['immediate'] // 仮の値
  }
}

const isScheduleSelected = (schedule: ScheduleData, ticket: TicketData): boolean => {
  // 分散状態管理: スケジュール固有の選択フラグを確認
  return !!schedule.selected
}

const isDateSelected = (date: string): boolean => {
  // その日付の有効なスケジュールをすべて取得
  const dateSchedules: ScheduleData[] = []
  ticketsArray.value.forEach((ticket: TicketData) => {
    ticket.schedules?.forEach((schedule: ScheduleData) => {
      if (schedule.entrance_date === date && schedule.isEffective === true) {
        dateSchedules.push(schedule)
      }
    })
  })
  
  // スケジュールが存在し、すべて選択されている場合に true
  return dateSchedules.length > 0 && dateSchedules.every(schedule => schedule.selected)
}

// ライフサイクル
onMounted(() => {
  logger.info('TicketTab mounted', {
    現在のチケット数: ticketsArray.value.length,
    ticketsArrayサイズ: ticketsArray.value.length,
    filteredTicketsサイズ: filteredTickets.value.length
  })
})

onUnmounted(() => {
  logger.info('TicketTab unmounted')
})
</script>

<style scoped lang="scss">
/**
 * チケットタブのスタイル定義
 */

.ytomo-ticket-tab {
    padding: 0 12px 20px 12px;
    height: 100%;
    overflow-y: auto;
    color-scheme: light;
}

@media (max-width: 768px) {
    .ytomo-ticket-tab {
        padding: 0 8px 16px 8px;
    }
}

/* 簡易選択エリア */
.ytomo-quick-select {
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

/* トグルスイッチ */
.ytomo-toggle-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
}

.ytomo-toggle-input {
    display: none;
}

.ytomo-toggle-slider {
    position: relative;
    width: 44px;
    height: 24px;
    background: #cbd5e1;
    border-radius: 12px;
    transition: background-color 0.2s;
    margin-right: 8px;
}

.ytomo-toggle-slider::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
}

.ytomo-toggle-input:checked + .ytomo-toggle-slider {
    background: #2c5aa0;
}

.ytomo-toggle-input:checked + .ytomo-toggle-slider::before {
    transform: translateX(20px);
}

.ytomo-toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
}

/* 日付ボタン */
.ytomo-date-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
}

// 日付・日時ボタン共通スタイル
%date-time-button-base {
    background: #e0f2fe;
    border: 1px solid #0891b2;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    color: #0c4a6e;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
    
    * {
        pointer-events: none;
    }

    &:focus {
        outline: none;
        box-shadow: none;
    }

    &:hover {
        background: #dbeafe;
        color: #0c4a6e;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(186, 230, 253, 0.3);
    }

    &.selected {
        background: #0284c7;
        color: white;
        border-color: #0284c7;
        outline: 2px solid #0284c7;
        outline-offset: -1px;
    }

    &:active {
        transform: translateY(0);
        box-shadow: none;
    }

    &.disabled,
    &:disabled {
        background: #e2e8f0;
        border-color: #94a3b8;
        color: #475569;
        cursor: not-allowed;

        &:hover {
            background: #e2e8f0;
            color: #475569;
            transform: none;
            box-shadow: none;
        }
    }
}

.ytomo-date-button {
    @extend %date-time-button-base;
}

/* メインコンテナ */
.ytomo-ticket-tab {
    padding: 0 12px 20px 12px;
    height: 100%;
    overflow-y: auto;
    color-scheme: light;
    
    @media (max-width: 768px) {
        padding: 0 8px 16px 8px;
    }
}

/* 簡易選択エリア */
.ytomo-quick-select {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    min-height: 52px;
}

/* トグルスイッチ */
.ytomo-toggle-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
}

.ytomo-toggle-input {
    display: none;
}

.ytomo-toggle-slider {
    position: relative;
    width: 44px;
    height: 24px;
    background: #cbd5e1;
    border-radius: 12px;
    transition: background-color 0.2s;
    margin-right: 8px;

    &::before {
        content: "";
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s;
    }
}

.ytomo-toggle-input:checked + .ytomo-toggle-slider {
    background: #2c5aa0;

    &::before {
        transform: translateX(20px);
    }
}

.ytomo-toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
}

/* 日付ボタンエリア */
.ytomo-date-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
}

/* チケット一覧 */
.ytomo-ticket-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
}

.ytomo-ticket-item {
    background: white;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    transition: all 0.2s;

    &.hidden {
        display: none;
    }

    &:hover {
        border-color: #cbd5e1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &.selected {
        border-color: #2c5aa0;
        box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.2);
    }
}

/* 上半分: チケットID、Me Tip、Label */
.ytomo-ticket-upper {
    background: #e2e8f0;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #cbd5e1;
}

.ytomo-ticket-id {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    background: #e2e8f0;
    padding: 2px 6px;
    border-radius: 3px;
}

.ytomo-me-tip {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.ytomo-external-tip {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.ytomo-item-name {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 9px;
    font-weight: 500;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ytomo-label-tag {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
}

/* 下半分: 入場日時ボタン、予約種類 */
.ytomo-ticket-lower {
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* 入場日時ボタンエリア */
.ytomo-entrance-dates {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

/* 予約種類 */
.ytomo-reservation-types {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
}

.ytomo-reservation-type {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;

    &.active {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #22c55e;
    }

    &.inactive {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #ef4444;
    }
}

.ytomo-no-reservation-types {
    color: #6b7280;
    font-size: 12px;
    font-style: italic;
}

/* チケット追加エリア */
.ytomo-add-ticket {
    background: white;
    border-radius: 8px;
    padding: 16px;
    border: 2px dashed #cbd5e1;
    margin-top: 20px;

    h4 {
        margin: 0 0 12px 0;
        color: #374151;
        font-size: 14px;
        font-weight: 600;
    }
}

.ytomo-add-ticket-form {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
}

/* インライン入力フィールド（チケット追加用） */
.ytomo-input-inline {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    transition: border-color 0.2s;
    background: white;

    &:focus {
        outline: none;
        border-color: #2c5aa0;
        box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.1);
    }

    &::placeholder {
        color: #9ca3af;
    }

    &.ytomo-input-ticket-id {
        width: 120px;
    }

    &.ytomo-input-label {
        width: 60px;
    }
}

/* セレクトボックスのスタイル */
.ytomo-select-inline {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    background: white;
    cursor: pointer;
    width: 50px;
    
    &:focus {
        outline: none;
        border-color: #2c5aa0;
        box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.1);
    }
}

.ytomo-ticket-item:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.ytomo-ticket-item.selected {
    border-color: #2c5aa0;
    box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.2);
}

/* 上半分: チケットID、Me Tip、Label */
.ytomo-ticket-upper {
    background: #e2e8f0;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #cbd5e1;
}

.ytomo-ticket-id {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    background: #e2e8f0;
    padding: 2px 6px;
    border-radius: 3px;
}

.ytomo-me-tip {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.ytomo-external-tip {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

/* 下半分: 入場日時ボタン、予約種類 */
.ytomo-ticket-lower {
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}


.ytomo-entrance-date-button {
    @extend %date-time-button-base;
    
    .ytomo-reservation-status {
        background: rgba(255, 255, 255, 0.9);
        color: #0891b2;
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 9px;
        font-weight: 500;
        line-height: 1.1;
        text-align: center;
        
        &:empty {
            background: transparent;
            padding: 0;
        }
    }
    
    &:hover .ytomo-reservation-status {
        background: rgba(255, 255, 255, 0.95);
        color: #0ea5e9;
        
        &:empty {
            background: transparent;
        }
    }
    
    &.selected .ytomo-reservation-status {
        background: rgba(255, 255, 255, 0.95);
        color: #0891b2;
        
        &:empty {
            background: transparent;
        }
    }
    
    &.disabled .ytomo-reservation-status {
        background: rgba(255, 255, 255, 0.9);
        color: #475569;
        
        &:empty {
            background: transparent;
        }
    }
}

.ytomo-no-entrance-dates {
    color: #6b7280;
    font-size: 12px;
    font-style: italic;
}

/* インライン入力フィールド（チケット追加用） */
.ytomo-input-inline {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    transition: border-color 0.2s;
    background: white;
}

.ytomo-input-inline:focus {
    outline: none;
    border-color: #2c5aa0;
    box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.1);
}

.ytomo-input-inline::placeholder {
    color: #9ca3af;
}

.ytomo-input-inline.ytomo-input-ticket-id {
    width: 120px;
}

.ytomo-input-inline.ytomo-input-label {
    width: 60px;
}

/* セレクトボックスのスタイル */
.ytomo-select-inline {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    background: white;
    cursor: pointer;
    width: 50px;
}

.ytomo-select-inline:focus {
    outline: none;
    border-color: #2c5aa0;
    box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.1);
}

/* ボタンスタイル */
.ytomo-button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
}

.ytomo-button.primary {
    background: linear-gradient(135deg, #2c5aa0 0%, #1a365d 100%);
    color: white;
}

.ytomo-button.primary:hover {
    background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(44, 90, 160, 0.3);
}

.ytomo-button.primary:active {
    transform: translateY(0);
}

.ytomo-button.retry-button {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    margin-top: 12px;
}

.ytomo-button.retry-button:hover {
    background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
}

.ytomo-button:focus {
    outline: 2px solid #2c5aa0;
    outline-offset: 2px;
}

.ytomo-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
}

/* 空の状態 */
.ytomo-empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
    font-style: italic;
}

.ytomo-empty-state p {
    margin: 0;
    font-size: 14px;
}

/* エラー表示 */
.ytomo-error {
    text-align: center;
    padding: 40px 20px;
    color: #dc2626;
}

.ytomo-error h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #dc2626;
}

.ytomo-error p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
}

/* ローディング表示の調整（ベースから継承） */
.ytomo-ticket-tab .ytomo-loading {
    height: 150px;
}

/* アニメーション */
.ytomo-ticket-item {
    animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
    .ytomo-ticket-item,
    .ytomo-button,
    .ytomo-date-button,
    .ytomo-entrance-date-button,
    .ytomo-toggle-slider,
    .ytomo-input-inline {
        animation: none;
        transition: none;
    }
}

/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
    .ytomo-ticket-item {
        border-width: 3px;
    }

    .ytomo-ticket-item.selected {
        border-width: 4px;
    }

    .ytomo-button:focus,
    .ytomo-input-inline:focus,
    .ytomo-date-button:focus,
    .ytomo-entrance-date-button:focus,
    .ytomo-input-inline:focus,
    .ytomo-select-inline:focus {
        outline: 3px solid #000;
    }
}

/* 空の状態 */
.ytomo-empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
    font-style: italic;

    p {
        margin: 0;
        font-size: 14px;
    }
}

/* エラー表示 */
.ytomo-error {
    text-align: center;
    padding: 40px 20px;
    color: #dc2626;

    h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        color: #dc2626;
    }

    p {
        margin: 0;
        font-size: 14px;
        color: #6b7280;
    }
}

/* スクロールバーのスタイル */
.ytomo-ticket-list::-webkit-scrollbar {
    width: 6px;
}

.ytomo-ticket-list::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.ytomo-ticket-list::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
        background: #94a3b8;
    }
}

/* アニメーション */
.ytomo-ticket-item {
    animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>