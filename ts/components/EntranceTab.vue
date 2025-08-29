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
                :data-date="date.dateString"
                @click="selectDate"
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
                    <span class="ytomo-status-icon" :class="`status-${timeSlot.east.status}`">
                      <span v-if="timeSlot.east.status === 'low'">●</span>
                      <span v-else-if="timeSlot.east.status === 'high'">▲</span>
                      <span v-else-if="timeSlot.east.status === 'full'">×</span>
                      <span v-else>－</span>
                    </span>
                    <span class="ytomo-time-text">{{ timeSlot.time }}-</span>
                    <span v-if="timeSlot.east.selected" class="ytomo-check-mark">✓</span>
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
                    <span class="ytomo-status-icon" :class="`status-${timeSlot.west.status}`">
                      <span v-if="timeSlot.west.status === 'low'">●</span>
                      <span v-else-if="timeSlot.west.status === 'high'">▲</span>
                      <span v-else-if="timeSlot.west.status === 'full'">×</span>
                      <span v-else>－</span>
                    </span>
                    <span class="ytomo-time-text">{{ timeSlot.time }}-</span>
                    <span v-if="timeSlot.west.selected" class="ytomo-check-mark">✓</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="ytomo-no-date-selected">
            日付を選択してください
          </div>
        </div>
        
        <!-- 予約操作ボタン（テーブルのすぐ下に配置） -->
        <div v-if="selectedDate" class="ytomo-reservation-actions">
        <!-- 日時変更表示 -->
        <div v-if="dateTimeChangeText" class="ytomo-datetime-change">
          {{ dateTimeChangeText }}
        </div>
        
        <button 
          class="ytomo-reserve-button" 
          :class="{ 'disabled': !isReservationButtonEnabled }"
          :disabled="!isReservationButtonEnabled"
          @click="executeReservation"
        >
          {{ reservationButtonText }}
        </button>
        <!-- <button class="ytomo-clear-button" @click="clearSelection">削除</button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { loggers } from '@/utils/logger'
import { useTicketsStore } from '@/stores/tickets'
import type { ScheduleData } from '@/types/api'

const logger = loggers.ui
const ticketsStore = useTicketsStore()

// カレンダー状態
const isCalendarExpanded = ref(true)
const selectedDate = ref<string>('')
const currentMonth = ref(new Date()) // 現在の年月

// 現在選択されているスケジュール（入場予約）
const selectedSchedule = ref<ScheduleData | null>(null)

// 選択されている時間帯の数を計算
const selectedTimeSlotCount = computed(() => {
  return timeSlots.value.reduce((count, slot) => {
    return count + (slot.east.selected ? 1 : 0) + (slot.west.selected ? 1 : 0)
  }, 0)
})

// 予約ボタンの有効性判定
const isReservationButtonEnabled = computed(() => {
  // 条件: 選択中の入場予約が1つかつ、それが自分の予約かつ、時間帯が選択されている
  return selectedSchedule.value && 
         selectedSchedule.value.isOwn === true && 
         selectedTimeSlotCount.value === 1
})

// 予約ボタンテキストの動的決定
const reservationButtonText = computed(() => {
  if (!selectedSchedule.value) {
    return '新規予約'
  }
  // 既存の入場日時があるかチェック
  const hasExistingDateTime = selectedSchedule.value.entrance_date && 
                              selectedSchedule.value.time_start
  return hasExistingDateTime ? '変更予約' : '新規予約'
})

// 既存日時→新日時の表示テキスト
const dateTimeChangeText = computed(() => {
  if (!selectedSchedule.value || selectedTimeSlotCount.value !== 1) {
    return ''
  }
  
  const hasExistingDateTime = selectedSchedule.value.entrance_date && 
                              selectedSchedule.value.time_start
  
  if (!hasExistingDateTime) {
    return '' // 新規予約の場合は矢印表示なし
  }
  
  // 選択された新しい時間帯情報を取得
  const newTimeSlot = getSelectedTimeSlotInfo()
  if (!newTimeSlot) return ''
  
  const existingDate = formatDateFromDateString(selectedSchedule.value.entrance_date!)
  const existingTime = selectedSchedule.value.time_start
  const existingGate = selectedSchedule.value.gate_type === 1 ? '東' : '西'
  
  const newDate = formatDate(selectedDate.value)
  const newGate = newTimeSlot.gate
  const newTime = newTimeSlot.time
  
  return `${existingDate} ${existingTime} (${existingGate}) → ${newDate} ${newTime} (${newGate})`
})

// 選択された時間帯情報を取得
const getSelectedTimeSlotInfo = () => {
  for (const slot of timeSlots.value) {
    if (slot.east.selected) {
      return { time: slot.time, gate: '東', gateType: 1 }
    }
    if (slot.west.selected) {
      return { time: slot.time, gate: '西', gateType: 2 }
    }
  }
  return null
}

// YYYYMMDD形式の日付をフォーマット
const formatDateFromDateString = (dateString: string): string => {
  if (dateString.length === 8) {
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    return `${month}月${day}日`
  }
  return dateString
}

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
    // ローカル時間での日付文字列を生成（UTCではなく）
    const year = date.getFullYear()
    const month_str = String(date.getMonth() + 1).padStart(2, '0')
    const day_str = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month_str}-${day_str}`
    
    // 今日の日付もローカル時間で生成
    const todayYear = today.getFullYear()
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
    const todayDay = String(today.getDate()).padStart(2, '0')
    const todayString = `${todayYear}-${todayMonth}-${todayDay}`
    
    dates.push({
      key: dateString,
      day: date.getDate(),
      dateString,
      isCurrentMonth,
      isToday: dateString === todayString,
      disabled: !isCurrentMonth || isDateDisabled(date) // 今日〜2025年10月のみ有効
    })
  }
  
  return dates
})

// 時間帯データ（実際のAPIから動的に取得）
const timeSlots = ref<Array<{
  time: string;
  east: { status: string; selected: boolean };
  west: { status: string; selected: boolean };
}>>([])

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
  const maxDate = new Date(2025, 9, 13) // 2025年10月13日（万博最終日）
  
  // 2025年10月以前の制限
  if (newMonth <= maxDate) {
    currentMonth.value = newMonth
  }
}

const selectDate = async (event: Event) => {
  const target = event.target as HTMLElement
  const dateString = target.getAttribute('data-date')
  const isDisabled = target.classList.contains('disabled')
  const isOtherMonth = target.classList.contains('other-month')
  
  if (!dateString || isDisabled || isOtherMonth) {
    return
  }
  
  // デバッグ用ログ
  logger.info('カレンダー日付選択詳細', {
    data_date属性: dateString,
    無効: isDisabled,
    他の月: isOtherMonth
  })
  
  selectedDate.value = dateString
  
  // カレンダーの月を選択日付に連動させる
  const selectedDateObj = new Date(dateString + 'T00:00:00')
  const currentCalendarMonth = currentMonth.value.getMonth()
  const currentCalendarYear = currentMonth.value.getFullYear()
  
  if (selectedDateObj.getMonth() !== currentCalendarMonth || selectedDateObj.getFullYear() !== currentCalendarYear) {
    currentMonth.value = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1)
    logger.info('カレンダー月を選択日付に同期', { 
      selectedDate: dateString,
      newMonth: `${selectedDateObj.getFullYear()}年${selectedDateObj.getMonth() + 1}月`
    })
  }
  
  // 日付変更時は時間帯選択をクリア
  clearTimeSlotSelection()
  logger.info('日付選択', { date: dateString })
  
  // 選択された日付の時間帯データを取得
  await loadTimeSlotsForDate(dateString)
}

// 時間帯選択のみをクリア（予約選択は保持）
const clearTimeSlotSelection = () => {
  timeSlots.value.forEach(slot => {
    slot.east.selected = false
    slot.west.selected = false
  })
}

// 指定日の時間帯データを読み込み
const loadTimeSlotsForDate = async (date: string) => {
  logger.info('指定日の時間帯データ読み込み', { date, stack: new Error().stack?.split('\n')[2]?.trim() })
  
  try {
    // 日付をYYYYMMDD形式に変換
    const formattedDate = date.replace(/-/g, '')
    
    // 入場予約スケジュールを取得
    const year = parseInt(date.substring(0, 4))
    const month = parseInt(date.substring(5, 7))
    
    logger.info('API呼び出し開始', { date, year, month, formattedDate })
    const scheduleData = await ticketsStore.getEntranceScheduleData(year, month)
    
    // 指定日のスケジュールを検索（ドキュメント通り日のみ使用）
    const dayOfMonth = date.substring(8, 10).replace(/^0/, '') // "29"
    const dayData = scheduleData?.states?.[dayOfMonth]
    
    // デバッグ用ログ
    logger.info('スケジュールデータ検索', { 
      date,
      dayOfMonth,
      hasScheduleData: !!scheduleData,
      scheduleData: scheduleData ? JSON.stringify(scheduleData).substring(0, 200) + '...' : null,
      availableDates: scheduleData?.states ? Object.keys(scheduleData.states) : [],
      hasDayData: !!dayData,
      dayDataKeys: dayData ? Object.keys(dayData) : null
    })
    
    if (dayData) {
      // 時間帯データを構築
      const slots: Array<{
        time: string;
        east: { status: string; selected: boolean };
        west: { status: string; selected: boolean };
      }> = []
      
      // 東西ゲートの時間帯データを処理
      const eastGate = dayData['1'] // 1:東ゲート
      const westGate = dayData['2'] // 2:西ゲート
      
      // 利用可能な時間帯を収集（東西ゲート両方から）
      const timeSet = new Set<string>()
      if (eastGate) {
        Object.keys(eastGate).forEach(time => timeSet.add(time))
      }
      if (westGate) {
        Object.keys(westGate).forEach(time => timeSet.add(time))
      }
      
      // 時間帯データを構築
      for (const time of Array.from(timeSet).sort()) {
        const eastTimeData = eastGate?.[time]
        const westTimeData = westGate?.[time]
        
        // schedule_nameから表示時間を取得（例: "11:00-" -> "11:00"）
        const displayTime = eastTimeData?.schedule_name || westTimeData?.schedule_name || time
        const cleanTime = displayTime.replace('-', '')
        
        slots.push({
          time: cleanTime,
          east: {
            status: getStatusFromTimeState(eastTimeData?.time_state),
            selected: false
          },
          west: {
            status: getStatusFromTimeState(westTimeData?.time_state),
            selected: false
          }
        })
      }
      
      timeSlots.value = slots
      logger.info('時間帯データ読み込み完了', { date, slotsCount: slots.length })
    } else {
      // データがない場合は空配列
      timeSlots.value = []
      logger.warn('指定日の時間帯データが見つかりません', { date, dayOfMonth })
    }
  } catch (error) {
    logger.error('時間帯データ読み込みエラー', error)
    // エラー時は空配列
    timeSlots.value = []
  }
}

// time_stateから混雑状況を判定
const getStatusFromTimeState = (timeState?: number): string => {
  // 0:空き, 1:残り少ない, 2:満席, 4:利用不可
  switch (timeState) {
    case 0: return 'low'   // 空き
    case 1: return 'high'  // 残り少ない
    case 2: return 'full'  // 満席
    case 4: return 'full'  // 利用不可（満席として扱う）
    default: return 'full' // 不明な場合は満席として扱う
  }
}

// 日付フォーマット
const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00') // UTC時刻で正確に解析
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

// 日付の有効性チェック（今日〜2025年10月）
const isDateDisabled = (date: Date): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 時刻をリセットして日付のみで比較
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  
  const maxDate = new Date(2025, 9, 13) // 2025年10月13日（万博最終日）
  
  return targetDate < today || targetDate > maxDate
}

// 入場予約データの更新
const refreshEntranceData = async () => {
  logger.info('入場予約データ更新開始')
  await ticketsStore.init()
  initializeDefaultSelection()
  logger.info('入場予約データ更新完了')
}

// デフォルト選択の初期化
const initializeDefaultSelection = () => {
  // 選択済みの入場予約から日付を取得
  const selectedTickets = ticketsStore.selectedTickets
  
  for (const ticket of selectedTickets) {
    if (ticket.schedules) {
      for (const schedule of ticket.schedules) {
        if (schedule.selected && schedule.isOwn) {
          // 選択済みの入場予約がある場合、その日付をデフォルト選択
          if (schedule.entrance_date) {
            const formattedDate = formatScheduleDate(schedule.entrance_date)
            selectedDate.value = formattedDate
            selectedSchedule.value = schedule
            
            // カレンダー月も連動
            const selectedDateObj = new Date(formattedDate + 'T00:00:00')
            currentMonth.value = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1)
            
            logger.info('選択済み入場予約の日付をデフォルト選択', { date: formattedDate, schedule })
            return
          }
        }
      }
    }
  }
  
  // 選択済み入場予約がない場合は今日の日付をデフォルト選択
  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
  const todayDay = String(today.getDate()).padStart(2, '0')
  
  const todayString = `${todayYear}-${todayMonth}-${todayDay}`
  selectedDate.value = todayString
  selectedSchedule.value = null
  logger.info('今日の日付をデフォルト選択', { 
    date: todayString, 
    todayObject: today.toString(),
    year: todayYear,
    month: todayMonth, 
    day: todayDay 
  })
}

// スケジュールの日付をISO形式に変換
const formatScheduleDate = (dateString: string): string => {
  if (dateString.length === 8) {
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    return `${year}-${month}-${day}`
  }
  return dateString
}

// 予約実行
const executeReservation = () => {
  if (!isReservationButtonEnabled.value) {
    logger.warn('予約ボタンが無効な状態で実行されました')
    return
  }
  
  const timeSlotInfo = getSelectedTimeSlotInfo()
  if (!timeSlotInfo || !selectedSchedule.value) {
    logger.warn('必要な情報が不足しています', { timeSlotInfo, selectedSchedule: selectedSchedule.value })
    return
  }
  
  logger.info('予約実行', { 
    selectedDate: selectedDate.value, 
    timeSlot: timeSlotInfo,
    schedule: selectedSchedule.value 
  })
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

// 時間帯選択の切り替え（満員時間帯も選択可能、複数選択可）
const toggleTimeSlot = (gate: 'east' | 'west', time: string) => {
  const slot = timeSlots.value.find(s => s.time === time)
  if (!slot) return
  
  // 無効な時間帯は選択不可
  if (slot[gate].status === 'disabled') {
    logger.warn('無効な時間帯の選択を試行', { gate, time })
    return
  }
  
  // 選択状態を切り替え
  slot[gate].selected = !slot[gate].selected
  logger.info('時間帯選択切り替え', { gate, time, status: slot[gate].status, selected: slot[gate].selected })
}

// コンポーネントマウント時の初期化
onMounted(async () => {
  initializeDefaultSelection()
  
  // 初期日付の時間帯データを読み込み
  if (selectedDate.value) {
    await loadTimeSlotsForDate(selectedDate.value)
  }
})
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

/* レスポンシブ対応: 狭いスマホのみ縦積み */
@media (max-width: 520px) {
  .ytomo-entrance-layout {
    flex-direction: column;
    gap: 12px;
  }
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
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e5e7eb;
    
    .ytomo-datetime-change {
      font-size: 11px;
      color: #374151;
      background: #f9fafb;
      padding: 6px 8px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
      text-align: center;
    }
    
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
        flex: 1;
        background: #2c5aa0;
        color: white;
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover:not(.disabled) {
          background: #1e3d72;
        }
        
        &.disabled {
          background: #9ca3af;
          color: #d1d5db;
          cursor: not-allowed;
          
          &:hover {
            background: #9ca3af;
          }
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
    
    // 背景色はデフォルトの白のまま（disabledの場合のみグレー）
    &.status-disabled {
      background: #f3f4f6; // グレー
      color: #9ca3af;
      cursor: not-allowed;
      opacity: 0.6;
      
      &:hover {
        border-color: #d1d5db;
        background: #f3f4f6;
      }
    }
    
    // 選択時はボーダーを太くして目立たせる（背景色は変更しない）
    &.selected {
      border-width: 2px;
      border-color: #2c5aa0;
      border-style: solid;
    }
    
    .ytomo-status-icon {
      margin-right: 6px;
      font-size: 12px;
      font-weight: 700;
      min-width: 14px;
      display: inline-block;
      text-align: center;
      
      &.status-low {
        color: #3b82f6; // 青い丸
      }
      
      &.status-high {
        color: #f97316; // 橙の三角
      }
      
      &.status-full {
        color: #dc2626; // 赤いバツ
      }
      
      &.status-disabled {
        color: #9ca3af; // グレーの線
      }
    }
    
    .ytomo-check-mark {
      font-size: 10px;
      margin-left: 4px;
      color: #059669;
      font-weight: 700;
    }
    
    .ytomo-time-text {
      font-size: 11px;
      font-weight: 500;
    }
    
  }
}

/* スマホ対応のメディアクエリ */
@media (max-width: 520px) {
  .ytomo-entrance-calendar {
    flex: 1 1 auto;
    height: 250px; /* スマホでは高さを縮小 */
    
    .ytomo-calendar-header {
      padding: 8px 12px;
      
      .ytomo-calendar-title h3 {
        font-size: 12px;
      }
      
      .ytomo-selected-date {
        font-size: 11px;
      }
    }
    
    .ytomo-calendar-body {
      padding: 12px;
    }
    
    .ytomo-calendar-grid .ytomo-calendar-days .ytomo-calendar-day {
      font-size: 10px;
      min-height: 20px;
    }
  }
  
  .ytomo-entrance-reservations {
    flex: 1 1 auto;
    min-height: 200px;
  }
  
  .ytomo-entrance-table {
    max-width: 100%; /* スマホでは最大幅を拡張 */
    
    th, td {
      padding: 4px 6px;
    }
    
    th {
      font-size: 11px;
    }
    
    .ytomo-time-button {
      padding: 4px 6px;
      
      .ytomo-time-text {
        font-size: 10px;
      }
    }
  }
  
  .ytomo-reservation-actions {
    button {
      padding: 6px 8px;
      font-size: 11px;
    }
  }
}

/* 非常に小さいスマホ画面対応 */
@media (max-width: 400px) {
  .ytomo-entrance-tab {
    padding: 8px;
  }
  
  .ytomo-entrance-layout {
    gap: 8px;
  }
  
  .ytomo-entrance-calendar {
    height: 200px;
    
    .ytomo-calendar-header {
      padding: 6px 8px;
      
      .ytomo-calendar-title h3 {
        font-size: 11px;
      }
      
      .ytomo-selected-date {
        font-size: 10px;
      }
    }
    
    .ytomo-calendar-body {
      padding: 8px;
    }
    
    .ytomo-calendar-grid .ytomo-calendar-days .ytomo-calendar-day {
      font-size: 9px;
      min-height: 18px;
    }
  }
  
  .ytomo-entrance-table {
    th, td {
      padding: 3px 4px;
    }
    
    th {
      font-size: 10px;
    }
    
    .ytomo-time-button {
      padding: 3px 4px;
      
      .ytomo-time-text {
        font-size: 9px;
      }
    }
  }
  
  .ytomo-reservation-actions {
    flex-direction: column;
    gap: 6px;
    
    button {
      padding: 8px 12px;
      font-size: 12px;
    }
  }
}
</style>