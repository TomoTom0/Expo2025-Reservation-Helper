<template>
  <div class="ytomo-entrance-tab">
    <!-- 左右並列レイアウト -->
    <div class="ytomo-entrance-layout">
      <!-- 左側: カレンダー -->
      <div class="ytomo-entrance-calendar">
        <div class="ytomo-calendar-header">
          <div class="ytomo-calendar-title" @click="toggleCalendar">
            <h3>入場日選択</h3>
            <span v-if="selectedDate" class="ytomo-selected-date">{{ formatDate(selectedDate) }}</span>
          </div>
          <div class="ytomo-header-buttons">
            <button class="ytomo-refresh-button" @click="refreshEntranceData" title="入場予約データを更新">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <span class="ytomo-calendar-toggle" @click="toggleCalendar">{{ isCalendarExpanded ? '▼' : '▶' }}</span>
          </div>
        </div>
        <div class="ytomo-calendar-body" v-show="isCalendarExpanded">
          <div class="ytomo-calendar-controls">
            <button @click="previousMonth" class="ytomo-month-button">‹</button>
            <span class="ytomo-current-month">{{ currentMonthDisplay }}</span>
            <button @click="nextMonth" class="ytomo-month-button">›</button>
          </div>
          <div class="ytomo-calendar-grid">
            <div class="ytomo-calendar-weekdays">
              <div v-for="day in weekdays" :key="day" class="ytomo-weekday">{{ day }}</div>
            </div>
            <div class="ytomo-calendar-days">
              <div 
                v-for="date in calendarDates" 
                :key="date.key"
                class="ytomo-calendar-day"
                :class="{
                  'other-month': !date.isCurrentMonth,
                  'selected': date.dateString === selectedDate,
                  'today': date.isToday,
                  'disabled': date.disabled
                }"
                @click="selectDate(date)"
              >
                {{ date.day }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側: 予約状況テーブル -->
      <div class="ytomo-entrance-reservations">
        <div class="ytomo-reservation-table-container">
          <table class="ytomo-entrance-table" v-if="selectedDate">
            <thead>
              <tr>
                <th>東</th>
                <th>西</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="timeSlot in timeSlots" :key="timeSlot.time">
                <td>
                  <div 
                    role="button" 
                    class="ytomo-time-button"
                    :class="[
                      { 'selected': timeSlot.east.selected },
                      `status-${timeSlot.east.status}`
                    ]"
                    @click="toggleTimeSlot('east', timeSlot.time)"
                  >
                    <span class="ytomo-time-text">{{ timeSlot.time }}-</span>
                  </div>
                </td>
                <td>
                  <div 
                    role="button" 
                    class="ytomo-time-button"
                    :class="[
                      { 'selected': timeSlot.west.selected },
                      `status-${timeSlot.west.status}`
                    ]"
                    @click="toggleTimeSlot('west', timeSlot.time)"
                  >
                    <span class="ytomo-time-text">{{ timeSlot.time }}-</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="ytomo-no-date-selected">
            日付を選択してください
          </div>
        </div>
        
        <!-- 予約操作ボタン -->
        <div v-if="selectedDate" class="ytomo-reservation-actions">
          <button class="ytomo-reserve-button" @click="executeReservation">予約</button>
          <button class="ytomo-clear-button" @click="clearSelection">削除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { loggers } from '@/utils/logger'

const logger = loggers.ui

// カレンダー状態
const isCalendarExpanded = ref(true)
const selectedDate = ref<string>('')
const currentMonth = ref(new Date(2025, 9)) // 2025年10月

// カレンダー表示用データ
const weekdays = ['日', '月', '火', '水', '木', '金', '土']

const currentMonthDisplay = computed(() => {
  return `${currentMonth.value.getFullYear()}年${currentMonth.value.getMonth() + 1}月`
})

const calendarDates = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const dates = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === month
    const dateString = date.toISOString().split('T')[0]
    
    dates.push({
      key: dateString,
      day: date.getDate(),
      dateString,
      isCurrentMonth,
      isToday: dateString === today.toISOString().split('T')[0],
      disabled: !isCurrentMonth || isDateDisabled(date) // 当月〜2025年10月のみ有効
    })
  }
  
  return dates
})

// 時間帯データ（満員時間帯も選択可能）
const timeSlots = ref([
  {
    time: '9:00',
    east: { status: 'low', selected: false },
    west: { status: 'full', selected: false }
  },
  {
    time: '10:00',
    east: { status: 'full', selected: false },
    west: { status: 'full', selected: false }
  },
  {
    time: '11:00',
    east: { status: 'full', selected: false },
    west: { status: 'low', selected: true }
  },
  {
    time: '12:00',
    east: { status: 'high', selected: false },
    west: { status: 'high', selected: false }
  },
  {
    time: '17:00',
    east: { status: 'low', selected: false },
    west: { status: 'low', selected: false }
  }
])

// カレンダー操作
const toggleCalendar = () => {
  isCalendarExpanded.value = !isCalendarExpanded.value
}

const previousMonth = () => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() - 1)
  const today = new Date()
  const minDate = new Date(today.getFullYear(), today.getMonth(), 1) // 当月の1日
  
  // 当月以降の制限
  if (newMonth >= minDate) {
    currentMonth.value = newMonth
  }
}

const nextMonth = () => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() + 1)
  const maxDate = new Date(2025, 9, 31) // 2025年10月31日
  
  // 2025年10月以前の制限
  if (newMonth <= maxDate) {
    currentMonth.value = newMonth
  }
}

const selectDate = (date: any) => {
  if (!date.disabled && date.isCurrentMonth) {
    selectedDate.value = date.dateString
    logger.info('日付選択', { date: date.dateString })
  }
}

// 日付フォーマット
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// ステータスアイコン取得
const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'full':
      return '/asset/img/calendar_ng.svg'
    case 'low':
      return '/asset/img/ico_scale_low.svg'
    case 'high':
      return '/asset/img/ico_scale_high.svg'
    default:
      return '/asset/img/ico_scale_low.svg'
  }
}

// ステータス説明取得
const getStatusAlt = (status: string): string => {
  switch (status) {
    case 'full':
      return '満員です(予約不可)'
    case 'low':
      return '混雑が予想されます'
    case 'high':
      return '空いています'
    default:
      return '混雑が予想されます'
  }
}

// 日付の有効性チェック（当月〜2025年10月）
const isDateDisabled = (date: Date): boolean => {
  const today = new Date()
  const minDate = new Date(today.getFullYear(), today.getMonth(), 1) // 当月1日
  const maxDate = new Date(2025, 9, 31) // 2025年10月31日
  
  return date < minDate || date > maxDate
}

// 入場予約データの更新
const refreshEntranceData = () => {
  logger.info('入場予約データ更新開始')
  // TODO: 実際のデータ取得処理を実装
}

// 予約実行
const executeReservation = () => {
  logger.info('予約実行', { selectedDate: selectedDate.value })
  // TODO: 実際の予約処理を実装
}

// 選択クリア
const clearSelection = () => {
  timeSlots.value.forEach(slot => {
    slot.east.selected = false
    slot.west.selected = false
  })
  logger.info('選択をクリア', { selectedDate: selectedDate.value })
}

// 時間帯選択の切り替え（満員時間帯も選択可能）
const toggleTimeSlot = (gate: 'east' | 'west', time: string) => {
  const slot = timeSlots.value.find(s => s.time === time)
  if (slot) {
    slot[gate].selected = !slot[gate].selected
    logger.info('時間帯選択切り替え', { gate, time, status: slot[gate].status, selected: slot[gate].selected })
  }
}
</script>

<style scoped lang="scss">
.ytomo-entrance-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
}

.ytomo-entrance-layout {
  display: flex;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.ytomo-entrance-calendar {
  flex: 0 0 220px; /* 固定幅220pxに縮小 */
  height: 300px; /* 明示的に高さを制限 */
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .ytomo-calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background: #f9fafb;
    border-radius: 8px 8px 0 0;
    border-bottom: 1px solid #e5e7eb;
    
    .ytomo-calendar-title {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      
      &:hover {
        background: #f3f4f6;
        border-radius: 3px;
        padding: 3px;
        margin: -3px;
      }
      
      h3 {
        margin: 0;
        font-size: 11px;
        font-weight: 600;
        color: #374151;
      }
      
      .ytomo-selected-date {
        font-size: 14px;
        color: #059669;
        font-weight: 700;
        background: #ecfdf5;
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid #a7f3d0;
      }
    }
    
    .ytomo-header-buttons {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .ytomo-refresh-button {
        background: none;
        border: 1px solid #d1d5db;
        border-radius: 3px;
        width: 20px;
        height: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        
        &:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
      }
      
      .ytomo-calendar-toggle {
        font-size: 11px;
        color: #6b7280;
        cursor: pointer;
        padding: 3px 6px;
        border-radius: 3px;
        
        &:hover {
          background: #f3f4f6;
        }
      }
    }
  }
  
  .ytomo-calendar-body {
    flex: 1;
    padding: 8px;
    overflow: auto;
  }
  
  .ytomo-calendar-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .ytomo-month-button {
      background: none;
      border: 1px solid #d1d5db;
      border-radius: 3px;
      width: 22px;
      height: 22px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        background: #f3f4f6;
      }
    }
    
    .ytomo-current-month {
      font-weight: 600;
      color: #374151;
    }
  }
  
  .ytomo-calendar-grid {
    .ytomo-calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      margin-bottom: 4px;
      
      .ytomo-weekday {
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        padding: 4px;
      }
    }
    
    .ytomo-calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      
      .ytomo-calendar-day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        cursor: pointer;
        border-radius: 3px;
        transition: all 0.2s;
        min-height: 24px;
        
        &:hover:not(.disabled):not(.other-month) {
          background: #f3f4f6;
        }
        
        &.selected {
          background: #2c5aa0;
          color: white;
        }
        
        &.today {
          background: #dbeafe;
          color: #1e40af;
          font-weight: 600;
        }
        
        &.other-month {
          color: #d1d5db;
          cursor: default;
        }
        
        &.disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
      }
    }
  }
}

.ytomo-entrance-reservations {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .ytomo-reservation-table-container {
    flex: 1;
    min-height: 0;
    
    .ytomo-no-date-selected {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 150px;
      color: #9ca3af;
      font-size: 12px;
    }
  }
  
  .ytomo-reservation-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    
    button {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      
      &.ytomo-reserve-button {
        background: #2c5aa0;
        color: white;
        
        &:hover {
          background: #1e3d72;
        }
      }
      
      &.ytomo-clear-button {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
        
        &:hover {
          background: #e5e7eb;
        }
      }
    }
  }
}

// コンパクトなテーブルスタイル
.ytomo-entrance-table {
  width: 100%;
  max-width: 200px;
  border-collapse: collapse;
  
  th {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 6px 8px;
    text-align: center;
    font-weight: 600;
    font-size: 12px;
    color: #374151;
    width: 50%;
  }
  
  td {
    border: 1px solid #e5e7eb;
    padding: 2px;
    vertical-align: middle;
    width: 50%;
  }
  
  .ytomo-time-button {
    width: 100%;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 6px 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      border-color: #9ca3af;
    }
    
    // 状態別背景色
    &.status-low {
      background: #dbeafe; // 薄い青
    }
    
    &.status-high {
      background: #fed7aa; // 橙
    }
    
    &.status-full {
      background: #fecaca; // 赤
    }
    
    // 選択時は元の背景色を濃くする
    &.selected.status-low {
      background: #93c5fd; // 濃い青
      border-color: #3b82f6;
      color: #1e40af;
    }
    
    &.selected.status-high {
      background: #fb923c; // 濃い橙
      border-color: #ea580c;
      color: #c2410c;
    }
    
    &.selected.status-full {
      background: #f87171; // 濃い赤
      border-color: #dc2626;
      color: #991b1b;
    }
    
    // デフォルト選択（状態なし）
    &.selected {
      background: #2c5aa0;
      border-color: #2c5aa0;
      color: white;
    }
    
    .ytomo-time-text {
      font-size: 11px;
      font-weight: 500;
    }
  }
}
</style>