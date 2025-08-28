<template>
  <div class="ytomo-entrance-tab">
    <!-- 上側: カレンダー -->
    <div class="ytomo-entrance-calendar">
      <div class="ytomo-calendar-header" @click="toggleCalendar">
        <h3>入場日選択 {{ selectedDate ? `- ${formatDate(selectedDate)}` : '' }}</h3>
        <span class="ytomo-calendar-toggle">{{ isCalendarExpanded ? '▼' : '▶' }}</span>
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

    <!-- 下側: 予約状況テーブル -->
    <div class="ytomo-entrance-reservations">
      <div class="ytomo-reservation-header">
        <h4>{{ selectedDate ? formatDate(selectedDate) : '日付を選択してください' }} の予約状況</h4>
      </div>
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
                  :class="{ 'selected': timeSlot.east.selected }"
                  @click="toggleTimeSlot('east', timeSlot.time)"
                >
                  <div class="ytomo-time-content">
                    <img 
                      :src="getStatusIcon(timeSlot.east.status)" 
                      :alt="getStatusAlt(timeSlot.east.status)"
                      class="ytomo-status-icon"
                    />
                    <span class="ytomo-time-text">{{ timeSlot.time }}-</span>
                  </div>
                </div>
              </td>
              <td>
                <div 
                  role="button" 
                  class="ytomo-time-button"
                  :class="{ 'selected': timeSlot.west.selected }"
                  @click="toggleTimeSlot('west', timeSlot.time)"
                >
                  <div class="ytomo-time-content">
                    <img 
                      :src="getStatusIcon(timeSlot.west.status)" 
                      :alt="getStatusAlt(timeSlot.west.status)"
                      class="ytomo-status-icon"
                    />
                    <span class="ytomo-time-text">{{ timeSlot.time }}-</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="ytomo-no-date-selected">
          日付を選択してください
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
      disabled: !isCurrentMonth || (year === 2025 && month !== 9) // 2025年10月のみ有効
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
  // 2025年10月のみに制限
  if (newMonth.getFullYear() === 2025 && newMonth.getMonth() === 9) {
    currentMonth.value = newMonth
  }
}

const nextMonth = () => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() + 1)
  // 2025年10月のみに制限
  if (newMonth.getFullYear() === 2025 && newMonth.getMonth() === 9) {
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
  padding: 16px;
  gap: 20px;
}

.ytomo-entrance-calendar {
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  
  .ytomo-calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f9fafb;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    border-bottom: 1px solid #e5e7eb;
    
    &:hover {
      background: #f3f4f6;
    }
    
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    
    .ytomo-calendar-toggle {
      font-size: 12px;
      color: #6b7280;
    }
  }
  
  .ytomo-calendar-body {
    padding: 16px;
  }
  
  .ytomo-calendar-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    
    .ytomo-month-button {
      background: none;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      font-size: 16px;
      
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
      margin-bottom: 8px;
      
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
        font-size: 12px;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
        
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .ytomo-reservation-header {
    margin-bottom: 12px;
    
    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
  }
  
  .ytomo-reservation-table-container {
    flex: 1;
    min-height: 0;
    
    .ytomo-no-date-selected {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 150px;
      color: #9ca3af;
      font-size: 14px;
    }
  }
}

// 新しいコンパクトなテーブルスタイル
.ytomo-entrance-table {
  width: 100%;
  border-collapse: collapse;
  
  th {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 8px 12px;
    text-align: center;
    font-weight: 600;
    font-size: 14px;
    color: #374151;
  }
  
  td {
    border: 1px solid #e5e7eb;
    padding: 4px;
    vertical-align: middle;
  }
  
  .ytomo-time-button {
    width: 100%;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }
    
    &.selected {
      background: #2c5aa0;
      border-color: #2c5aa0;
      color: white;
    }
    
    .ytomo-time-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      
      .ytomo-status-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
      
      .ytomo-time-text {
        font-size: 13px;
        font-weight: 500;
      }
    }
  }
}
</style>