<template>
  <div class="ytomo-entrance-tab">
    <!-- 左右並列レイアウト -->
    <div class="ytomo-entrance-layout">
      <!-- 左側: カレンダー -->
      <div class="ytomo-entrance-calendar">
        <!-- カレンダーヘッダーを非表示（上部領域削除）
        <div class="ytomo-calendar-header">
          <div class="ytomo-calendar-title">
            <h3>入場日選択</h3>
            <span v-if="selectedDate" class="ytomo-selected-date">{{ formatDate(selectedDate) }}</span>
          </div>
          <div class="ytomo-header-buttons">
            <button class="ytomo-refresh-button" @click="refreshEntranceData" title="入場予約データを更新">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        -->
        <div class="ytomo-calendar-body" v-show="isCalendarExpanded">
          <div class="ytomo-calendar-controls">
            <button @click="previousMonth" id="ytomo-previous-month-button" class="ytomo-month-button ytomo-month-button--prev">‹</button>
            <div class="ytomo-month-display">
              <span class="ytomo-current-month">{{ currentMonthDisplay }}</span>
              <span class="ytomo-availability-time">{{ availabilityDisplayTime || '' }}</span>
              <button id="ytomo-calendar-refresh-button" class="ytomo-calendar-refresh-button" @click="refreshEntranceData" :disabled="isRefreshing" title="入場予約データを更新">
                <svg viewBox="0 0 24 24" width="12" height="12" :class="{ 'ytomo-rotating': isRefreshing }">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <button @click="nextMonth" id="ytomo-next-month-button" class="ytomo-month-button ytomo-month-button--next">›</button>
          </div>
          <div class="ytomo-calendar-grid">
            <div class="ytomo-calendar-weekdays">
              <div v-for="day in weekdays" :key="day" class="ytomo-weekday">{{ day }}</div>
            </div>
            <div class="ytomo-calendar-days">
              <div 
                v-for="(date, index) in calendarDates" 
                :key="date.key"
                class="ytomo-calendar-day"
                :class="{
                  'empty-date': !date.isCurrentMonth,
                  'selected': date.dateString === selectedDate,
                  'today': date.isToday,
                  'disabled': date.disabled,
                  'has-reservation': hasReservationForDate(date.dateString),
                  'special-lottery-date': date.isSpecialLotteryDate
                }"
                :data-date="date.dateString"
                @click="selectDate"
              >
                <template v-if="date.isCurrentMonth">
                  <div class="ytomo-day-number">{{ date.day }}</div>
                  <div class="ytomo-availability-indicator">
                    <div class="ytomo-gate-availability">
                      <span 
                        class="ytomo-status-dot" 
                        :class="date.availability?.east.class"
                      ></span>
                    </div>
                    <div class="ytomo-gate-availability">
                      <span 
                        class="ytomo-status-dot" 
                        :class="date.availability?.west.class"
                      ></span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側: 予約状況テーブル -->
      <div class="ytomo-entrance-reservations">
        <!-- 日付表示エリア（既存日時と選択日付を横並び） -->
        <div v-if="selectedDate" class="ytomo-date-display-container">
          <!-- 既存入場日時表示（左側）灰色 -->
          <div v-if="getFromDateTimeText()" class="ytomo-existing-datetime-display existing">
            {{ getFromDateTimeText() }}
          </div>
          
          <!-- 変更矢印アイコン -->
          <div v-if="getFromDateTimeText()" class="ytomo-change-arrow">
            <svg viewBox="0 0 24 24" class="ytomo-arrow-icon">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
            </svg>
          </div>
          
          <!-- 入場日表示（右側）青色 -->
          <div class="ytomo-selected-date-display selected">
            {{ formatDate(selectedDate) }}
          </div>
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
                    :class="[
                      { 'selected': timeSlot.east.selected },
                      { 'disabled': isTimeSlotDisabled('east', timeSlot.time) },
                      `status-${timeSlot.east.status}`
                    ]"
                    @click="!isTimeSlotDisabled('east', timeSlot.time) && toggleTimeSlot('east', timeSlot.time)"
                  >
                    <span class="ytomo-status-icon" :class="`status-${timeSlot.east.status}`">
                      <span v-if="timeSlot.east.status === 'low'">●</span>
                      <span v-else-if="timeSlot.east.status === 'high'">▲</span>
                      <span v-else-if="timeSlot.east.status === 'full'">×</span>
                      <span v-else>－</span>
                    </span>
                    <span class="ytomo-time-text">{{ timeSlot.time }}-</span>
                    <span class="ytomo-selection-area">
                      <span v-if="timeSlot.east.selected" class="ytomo-selection-number">{{ getSelectionNumber(timeSlot.time, 'east') }}</span>
                    </span>
                  </div>
                </td>
                <td>
                  <div 
                    role="button" 
                    class="ytomo-time-button"
                    :class="[
                      { 'selected': timeSlot.west.selected },
                      { 'disabled': isTimeSlotDisabled('west', timeSlot.time) },
                      `status-${timeSlot.west.status}`
                    ]"
                    @click="!isTimeSlotDisabled('west', timeSlot.time) && toggleTimeSlot('west', timeSlot.time)"
                  >
                    <span class="ytomo-status-icon" :class="`status-${timeSlot.west.status}`">
                      <span v-if="timeSlot.west.status === 'low'">●</span>
                      <span v-else-if="timeSlot.west.status === 'high'">▲</span>
                      <span v-else-if="timeSlot.west.status === 'full'">×</span>
                      <span v-else>－</span>
                    </span>
                    <span class="ytomo-time-text">{{ timeSlot.time }}-</span>
                    <span class="ytomo-selection-area">
                      <span v-if="timeSlot.west.selected" class="ytomo-selection-number">{{ getSelectionNumber(timeSlot.time, 'west') }}</span>
                    </span>
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
          <button 
            class="ytomo-reserve-button" 
            :class="{ 'disabled': !isReservationButtonEnabled, 'cancel-mode': isReservationRunning }"
            :disabled="!isReservationButtonEnabled"
            @click="executeReservation"
          >
            {{ isReservationRunning ? '予約中断' : reservationButtonText }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 下段: 実行情報ブロック -->
    <div class="ytomo-execution-info">
      <!-- 予約情報表示エリア -->
      <div v-if="reservationInfo.visible" class="ytomo-reservation-info" :class="{ 'completed': reservationInfo.completed }">
        <div class="ytomo-reservation-box">
          <div class="ytomo-reservation-date">{{ reservationInfo.date }}</div>
          <div class="ytomo-reservation-timeslots">
            <div v-for="slot in reservationInfo.timeSlots" :key="slot.id" class="ytomo-timeslot">
              {{ slot.gate }}{{ slot.time }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 予約実行状態表示エリア -->
      <div v-if="reservationStatus.visible" class="ytomo-reservation-status" :class="reservationStatus.statusClass">
        <div class="ytomo-status-content">
          <div v-if="reservationStatus.isActive" class="ytomo-status-icon spinning">
            <svg viewBox="0 0 24 24">
              <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
            </svg>
          </div>
          <div class="ytomo-status-details">
            <div class="ytomo-status-current">{{ reservationStatus.currentAction }}</div>
            <div v-if="reservationStatus.statusClass === 'success' && reservationStatus.dateChange" class="ytomo-datetime-change">
              {{ reservationStatus.dateChange }}
            </div>
            <div v-if="reservationStatus.isActive" class="ytomo-status-progress">
              <div class="ytomo-progress-bar">
                <div class="ytomo-progress-fill" :style="{ width: reservationStatus.progress + '%' }"></div>
              </div>
            </div>
            
            <!-- 実行履歴表示 -->
            <div v-if="reservationManager.reservationHistory.value.length > 0" class="ytomo-execution-history">
              <div class="ytomo-history-items">
                <div v-for="(result, index) in reservationManager.reservationHistory.value" :key="index" 
                     class="ytomo-history-item" :class="result.success ? 'success' : 'failure'">
                  <span class="ytomo-history-result">{{ result.success ? '成功' : '' }}</span>
                  <span class="ytomo-history-detail">{{ result.gate }}{{ result.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { loggers } from '@/utils/logger'
import { useTicketsStore } from '@/stores/tickets'
import type { ScheduleData } from '@/types/api'
import { EntranceReservationApiManager } from '@/modules/entrance-reservation-api-manager'

const logger = loggers.ui
const ticketsStore = useTicketsStore()

// 予約管理インスタンス
const reservationManager = new EntranceReservationApiManager()

// 選択解除関数
const clearTimeSlotSelection = (): void => {
  selectionOrder.value = []
  timeSlots.value.forEach(slot => {
    slot.east.selected = false
    slot.west.selected = false
  })
  logger.info('予約成功により時間帯選択を解除しました', {})
}

// 選択解除コールバックを設定  
reservationManager.setClearSelectionCallback(clearTimeSlotSelection)

// カレンダー状態
const isCalendarExpanded = ref(true)
const selectedDate = ref('')
const currentMonth = ref(new Date()) // 現在の年月
const isRefreshing = ref(false) // 手動更新中フラグ

// 既存の入場日時と重複する時間帯を判定
const isTimeSlotDisabled = (gate: string, time: string) => {
  if (!selectedDate.value) return false
  
  const selectedDateStr = selectedDate.value!
  const selectedDateYYYYMMDD = selectedDateStr.replace(/-/g, '') // YYYY-MM-DD → YYYYMMDD
  const gateType = gate === 'east' ? 1 : 2
  
  // 同じ日付の既存予約があるかチェック
  
  for (const ticket of ticketsStore.tickets.values()) {
    if (ticket.schedules) {
      for (const schedule of ticket.schedules) {
        
        if (schedule.selected && 
            schedule.entrance_date === selectedDateYYYYMMDD &&
            schedule.gate_type === gateType &&
            schedule.time_start === time) {
          return true
        }
      }
    }
  }
  return false
}

// 現在選択されているスケジュール（ticket.schedulesから検索）
const selectedSchedule = computed(() => {
  logger.debug('selectedSchedule computed実行', {
    ticketsCount: ticketsStore.tickets.size,
    ticketsRef: ticketsStore.tickets,
    callStack: new Error().stack?.split('\n')[1]?.trim()
  })
  
  for (const ticket of ticketsStore.tickets.values()) {
    if (ticket.schedules) {
      const selected = ticket.schedules.find(schedule => schedule.selected === true)
      if (selected) {
        logger.debug('selectedSchedule found', {
          entrance_date: selected.entrance_date,
          user_visiting_reservation_id: selected.user_visiting_reservation_id,
          scheduleRef: selected
        })
        return selected
      }
    }
  }
  
  logger.debug('selectedSchedule not found')
  return null
})

// 時間帯選択順を管理（選択順序を記録）
const selectionOrder = ref<{ key: string; order: number }[]>([])

// 入場日時選択変更時の連動処理
watch(selectedSchedule, (newSchedule, oldSchedule) => {
  logger.info('selectedSchedule watcher発火', {
    isRefreshing: isRefreshing.value,
    oldSchedule: oldSchedule ? {
      entrance_date: oldSchedule.entrance_date,
      user_visiting_reservation_id: oldSchedule.user_visiting_reservation_id,
      objectRef: oldSchedule === newSchedule ? 'SAME_REF' : 'DIFF_REF'
    } : null,
    newSchedule: newSchedule ? {
      entrance_date: newSchedule.entrance_date,
      user_visiting_reservation_id: newSchedule.user_visiting_reservation_id
    } : null,
    condition1: !!newSchedule,
    condition2: newSchedule !== oldSchedule,
    condition3: !!newSchedule?.entrance_date,
    willExecuteSync: !isRefreshing.value && newSchedule && newSchedule !== oldSchedule && newSchedule.entrance_date
  })
  
  // 手動更新中は連動処理をスキップ
  if (isRefreshing.value) {
    logger.info('手動更新中のため連動処理をスキップ')
    return
  }
  
  if (newSchedule && newSchedule !== oldSchedule && newSchedule.entrance_date) {
    logger.info('入場日時選択変更検知 - 同期実行', { 
      old: oldSchedule?.entrance_date, 
      new: newSchedule.entrance_date,
      currentSelectedDate: selectedDate.value
    })
    
    // カレンダー選択日を新しい入場日に同期
    if (newSchedule.entrance_date) {
      selectedDate.value = newSchedule.entrance_date
      logger.info('selectedDate.value更新完了', { newValue: selectedDate.value })
    }
    
    // 時間帯選択を解除（disabled状態になった選択も含めて全解除）
    selectionOrder.value = []
    timeSlots.value.forEach(slot => {
      slot.east.selected = false
      slot.west.selected = false
    })
    
    // 選択日の時間帯データを再読み込み
    if (newSchedule.entrance_date) {
      loadTimeSlotsForDate(newSchedule.entrance_date)
    }
    
    logger.info('入場日時連動処理完了', { 
      selectedDate: selectedDate.value,
      clearedSelections: true
    })
  }
}, { deep: true })

// 優先度1の時間帯を取得（カレンダー空き表示用）
const selectedTimeSlot = computed(() => {
  const selectedSlots = selectionOrder.value.filter(item => {
    const [time, gate] = item.key.split('-')
    const timeSlot = timeSlots.value.find(slot => slot.time === time)
    if (!timeSlot) return false
    
    const gateKey = gate as 'east' | 'west'
    return timeSlot[gateKey].selected
  })
  
  if (selectedSlots.length === 0) return null
  
  // 最も早く選択された時間帯を返す
  const earliestSlot = selectedSlots.reduce((earliest, current) => 
    current.order < earliest.order ? current : earliest
  )
  
  return earliestSlot.key.split('-')[0] // 時間部分のみ返す
})

// カレンダー空き状況をcomputedで自動計算
const calendarAvailabilityCache = computed(() => {
  const selectedTimeSlotValue = selectedTimeSlot.value
  // 時間帯未選択時は9時（"0700"）をデフォルトとして使用
  const timeSlotForDisplay = selectedTimeSlotValue || { time: "0700", gate: "east" }
  const timeForDisplay = typeof timeSlotForDisplay === 'string' ? timeSlotForDisplay : timeSlotForDisplay.time
  
  logger.info('calendarAvailabilityCache 実行', {
    selectedTimeSlotValue,
    timeSlotForDisplay,
    timeForDisplay,
    hasSchedules: ticketsStore.entranceSchedules.size > 0
  })
  
  // ticketsStoreのentranceSchedulesに依存することを明示
  const entranceSchedules = ticketsStore.entranceSchedules
  if (entranceSchedules.size === 0) return null
  
  const cache: { [dateString: string]: any } = {}
  
  // 全期間（2024年12月〜2025年10月）の空き状況を計算
  const startYear = 2024
  const startMonth = 12
  const endYear = 2025
  const endMonth = 10
  
  for (let year = startYear; year <= endYear; year++) {
    const monthStart = year === startYear ? startMonth : 1
    const monthEnd = year === endYear ? endMonth : 12
    
    for (let month = monthStart; month <= monthEnd; month++) {
      const lastDay = new Date(year, month, 0).getDate()
      
      for (let day = 1; day <= lastDay; day++) {
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        cache[dateString] = getSelectedTimeSlotAvailability(dateString, timeForDisplay)
      }
    }
  }
  
  return cache
})

// 選択順序の数字を取得
const getSelectionNumber = (timeSlot: string, gate: 'east' | 'west'): number | null => {
  const key = `${timeSlot}-${gate}`
  const orderItem = selectionOrder.value.find(item => item.key === key)
  return orderItem ? orderItem.order : null
}

// 予約状態をマネージャーから取得
const reservationInfo = reservationManager.reservationInfo
const reservationStatus = reservationManager.reservationStatus
const isReservationRunning = reservationManager.isReservationRunning


// 選択されている時間帯の数を計算
const selectedTimeSlotCount = computed(() => {
  return timeSlots.value.reduce((count, slot) => {
    return count + (slot.east.selected ? 1 : 0) + (slot.west.selected ? 1 : 0)
  }, 0)
})

// 予約ボタンの有効性判定
const isReservationButtonEnabled = computed(() => {
  // 条件: 時間帯が1つ以上選択されている かつ（新規予約 または 自分の予約を変更）
  if (selectedTimeSlotCount.value < 1) {
    return false
  }
  
  // 新規予約の場合（selectedScheduleがnull）は有効
  if (!selectedSchedule.value) {
    return true
  }
  
  // 既存予約の場合は自分の予約のみ変更可能
  // selectedScheduleのuser_visiting_reservation_idで親チケットを探す
  const selectedTickets = ticketsStore.selectedTickets
  const parentTicket = selectedTickets.find(ticket => 
    ticket.schedules?.some(s => 
      s.user_visiting_reservation_id === selectedSchedule.value?.user_visiting_reservation_id
    )
  )
  
  // デバッグ用ログ
  logger.info('予約ボタン有効性判定', {
    selectedSchedule: selectedSchedule.value,
    hasSchedule: !!selectedSchedule.value,
    reservationId: selectedSchedule.value?.user_visiting_reservation_id,
    parentTicketFound: !!parentTicket,
    isOwn: parentTicket?.isOwn,
    timeSlotCount: selectedTimeSlotCount.value
  })
  
  return parentTicket?.isOwn === true
})

// 予約ボタンテキストの動的決定
const reservationButtonText = computed(() => {
  if (!selectedSchedule.value) {
    return '新規予約'
  }
  
  // 既存の予約があるかチェック
  // user_visiting_reservation_idが存在し、-1以外で、entrance_dateが設定済みの場合は変更予約
  const hasExistingReservation = selectedSchedule.value.user_visiting_reservation_id != null && 
                                selectedSchedule.value.user_visiting_reservation_id > 0 &&
                                selectedSchedule.value.entrance_date
  
  logger.info('予約ボタンテキスト判定', { 
    hasSelectedSchedule: !!selectedSchedule.value,
    reservationId: selectedSchedule.value?.user_visiting_reservation_id,
    entranceDate: selectedSchedule.value?.entrance_date,
    hasExistingReservation,
    buttonText: hasExistingReservation ? '変更予約' : '新規予約'
  })
  
  return hasExistingReservation ? '変更予約' : '新規予約'
})

// 既存日時→新日時の表示テキスト
const dateTimeChangeText = computed(() => {
  if (!selectedSchedule.value || selectedTimeSlotCount.value < 1) {
    return ''
  }
  
  const hasExistingReservation = selectedSchedule.value.user_visiting_reservation_id != null && 
                                selectedSchedule.value.user_visiting_reservation_id > 0 &&
                                selectedSchedule.value.entrance_date
  
  if (!hasExistingReservation) {
    return '' // 新規予約の場合は矢印表示なし
  }
  
  // 選択された新しい時間帯情報を取得
  const newTimeSlot = getSelectedTimeSlotInfo()
  if (!newTimeSlot) return ''
  
  const existingDate = selectedSchedule.value.entrance_date ? formatDateForDisplay(selectedSchedule.value.entrance_date) : ''
  const existingTime = selectedSchedule.value.time_start
  const existingGate = selectedSchedule.value.gate_type === 1 ? '東' : '西'
  
  const newDate = selectedDate.value ? formatDateForDisplay(selectedDate.value) : ''
  const newGate = newTimeSlot.gate
  const newTime = newTimeSlot.time
  
  return `${existingDate} ${existingGate}${existingTime} → ${newDate} ${newGate}${newTime}`
})

// 変更前の日時テキストを取得
const getFromDateTimeText = () => {
  if (!selectedSchedule.value) {
    logger.debug('getFromDateTimeText: selectedScheduleがnull')
    return ''
  }
  
  // 必要なプロパティが存在するかチェック
  if (!selectedSchedule.value.entrance_date || !selectedSchedule.value.time_start || selectedSchedule.value.gate_type == null) {
    logger.debug('getFromDateTimeText: 必要なプロパティが不足', {
      entrance_date: selectedSchedule.value.entrance_date,
      time_start: selectedSchedule.value.time_start,
      gate_type: selectedSchedule.value.gate_type
    })
    return ''
  }
  
  const date = selectedSchedule.value.entrance_date ? formatDateForDisplay(selectedSchedule.value.entrance_date) : ''
  const time = selectedSchedule.value.time_start
  const gate = selectedSchedule.value.gate_type === 1 ? '東' : '西'
  const result = `${date} ${gate}${time}`
  
  logger.debug('getFromDateTimeText: 結果', {
    selectedSchedule: selectedSchedule.value,
    result
  })
  
  return result
}

// 変更後の日時テキストを取得
const getToDateTimeText = () => {
  const newTimeSlot = getSelectedTimeSlotInfo()
  if (!newTimeSlot) return ''
  const date = selectedDate.value ? formatDateForDisplay(selectedDate.value) : ''
  const gate = newTimeSlot.gate
  const time = newTimeSlot.time
  return `${date} ${gate}${time}`
}

// 選択された時間帯情報を取得（選択順1番の要素を返す）
const getSelectedTimeSlotInfo = () => {
  if (selectionOrder.value.length === 0) {
    return null
  }
  
  // 選択順1番の要素を取得
  const firstSelection = selectionOrder.value.find(item => item.order === 1)
  if (!firstSelection) {
    logger.warn('選択順1番の要素が見つかりません', { 
      selectionOrder: selectionOrder.value,
      allOrders: selectionOrder.value.map(item => item.order)
    })
    return null
  }
  
  const [time, gate] = firstSelection.key.split('-')
  const gateType = gate === 'east' ? 1 : 2
  const gateText = gate === 'east' ? '東' : '西'
  
  logger.debug('選択時間帯情報取得', { 
    firstSelection, 
    time, 
    gate: gateText, 
    gateType,
    totalSelections: selectionOrder.value.length
  })
  
  return { 
    time: formatTimeForDisplay(time), // 表示用時間
    timeInternal: time, // API用内部形式時間
    gate: gateText, 
    gateType 
  }
}

// 選択された時間帯を優先度順に取得
const getSelectedTimeSlotsInPriorityOrder = () => {
  // 選択順序でソート
  const sortedSelections = [...selectionOrder.value].sort((a, b) => a.order - b.order)
  
  return sortedSelections.map((selection, index) => {
    const [time, gate] = selection.key.split('-')
    const gateText = gate === 'east' ? '東' : '西'
    
    return {
      id: selection.key,
      time: time,
      gate: gateText,
      priority: index + 1
    }
  })
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

// 時間を内部形式（"0700"）から表示形式（"7:00"）に変換
const formatTimeForDisplay = (timeString: string): string => {
  if (!timeString || typeof timeString !== 'string') {
    return ''
  }
  
  // 4桁の時間形式（"0700" -> "7:00"）
  if (timeString.length === 4 && /^\d{4}$/.test(timeString)) {
    const hour = parseInt(timeString.substring(0, 2))
    const minute = parseInt(timeString.substring(2, 4))
    return `${hour}:${minute.toString().padStart(2, '0')}`
  }
  
  // すでに表示形式の場合はそのまま返す
  if (timeString.includes(':')) {
    return timeString
  }
  
  return timeString
}

// 日付を「8/31」形式でフォーマット（チケットタブと同様）
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    return ''
  }
  
  if (dateString.includes('-')) {
    // YYYY-MM-DD形式の場合
    const date = new Date(dateString + 'T00:00:00')
    // Invalid Dateの場合は空文字を返す
    if (isNaN(date.getTime())) {
      logger.warn('formatDateForDisplay: 不正な日付文字列 (YYYY-MM-DD)', { dateString })
      return ''
    }
    return `${date.getMonth() + 1}/${date.getDate()}`
  } else if (dateString.length === 8) {
    // YYYYMMDD形式の場合
    const month = parseInt(dateString.substring(4, 6))
    const day = parseInt(dateString.substring(6, 8))
    // 月や日が不正な値でないかチェック
    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      logger.warn('formatDateForDisplay: 不正な日付文字列 (YYYYMMDD)', { dateString, month, day })
      return ''
    }
    return `${month}/${day}`
  }
  return dateString
}

// カレンダー表示用データ
const weekdays = ['日', '月', '火', '水', '木', '金', '土']

const currentMonthDisplay = computed(() => {
  return `${currentMonth.value.getMonth() + 1}月`
})

// カレンダーが表示している空き情報の対象時間（優先度1位の時間帯）
const availabilityDisplayTime = computed(() => {
  const priority1Selection = selectionOrder.value.find(item => item.order === 1)
  if (!priority1Selection) {
    // 時間帯未選択時は9時の情報をデフォルト表示
    return "9:00"
  }
  const internalTimeFormat = priority1Selection.key.split('-')[0]
  return formatTimeForDisplay(internalTimeFormat)
})


const calendarDates = computed(() => {
  if (!currentMonth.value) {
    return []
  }
  
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
    
    // 空き状況をすべての月の日付に表示（時間帯選択済みまたはデフォルト9時表示）
    let availability = null
    if (calendarAvailabilityCache.value) {
      availability = calendarAvailabilityCache.value[dateString] || null
    }
    
    const dateObj = {
      key: dateString,
      day: date.getDate(),
      dateString,
      isCurrentMonth,
      isToday: dateString === todayString,
      disabled: !isCurrentMonth || isDateDisabled(date),
      isSpecialLotteryDate: isCurrentMonth && isSpecialLotteryDate(date),
      availability
    }
    
    dates.push(dateObj)
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

const previousMonth = async () => {
  logger.info('previousMonth関数実行開始')
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() - 1)
  const today = new Date()
  const minDate = new Date(today.getFullYear(), today.getMonth(), 1) // 当月の1日
  
  // 当月以降の制限
  logger.info('前月ボタン:条件チェック', { newMonth: newMonth.toISOString(), minDate: minDate.toISOString(), canProceed: newMonth >= minDate })
  if (newMonth >= minDate) {
    currentMonth.value = newMonth
    
    // 月変更時に入場スケジュールを取得
    const year = newMonth.getFullYear()
    const month = newMonth.getMonth() + 1
    logger.info('前月ボタン:データ取得開始', { year, month })
    await ticketsStore.getEntranceScheduleData(year, month, false)
    logger.info('前月ボタン:データ取得完了', { 
      year, 
      month, 
      hasData: ticketsStore.entranceSchedules.has(`${year}-${month}`),
      scheduleKeys: ticketsStore.entranceSchedules.has(`${year}-${month}`) ? Object.keys(ticketsStore.entranceSchedules.get(`${year}-${month}`)?.states || {}) : []
    })
    
    // 選択日付がある場合は時間帯データを更新（選択状態を保持）
    if (selectedDate.value) {
      await loadTimeSlotsForDateWithSelection(selectedDate.value)
    }
  }
}

const nextMonth = async () => {
  logger.info('nextMonth関数実行開始')
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() + 1)
  
  // 2025年10月までの制限（月のみで比較）
  const newYear = newMonth.getFullYear()
  const newMonthNum = newMonth.getMonth() + 1
  const canProceed = newYear < 2025 || (newYear === 2025 && newMonthNum <= 10)
  
  logger.info('次月ボタン:条件チェック', { 
    newYear,
    newMonthNum,
    canProceed
  })
  
  if (canProceed) {
    currentMonth.value = newMonth
    
    // 月変更時に入場スケジュールを取得
    const year = newMonth.getFullYear()
    const month = newMonth.getMonth() + 1
    logger.info('前月ボタン:データ取得開始', { year, month })
    await ticketsStore.getEntranceScheduleData(year, month, false)
    logger.info('次月ボタン:データ取得完了', { 
      year, 
      month, 
      hasData: ticketsStore.entranceSchedules.has(`${year}-${month}`),
      scheduleKeys: ticketsStore.entranceSchedules.has(`${year}-${month}`) ? Object.keys(ticketsStore.entranceSchedules.get(`${year}-${month}`)?.states || {}) : []
    })
    
    // 選択日付がある場合は時間帯データを更新（選択状態を保持）
    if (selectedDate.value) {
      await loadTimeSlotsForDateWithSelection(selectedDate.value)
    }
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
  
  logger.info('日付選択', { date: dateString })
  
  // 選択された日付の時間帯データを取得（選択状態を保持）
  await loadTimeSlotsForDateWithSelection(dateString)
}

// 時間帯選択のみをクリア（予約選択は保持）- 統合済み

// 指定日の時間帯データを読み込み（選択状態を保持）
const loadTimeSlotsForDateWithSelection = async (date: string) => {
  // 既存の選択状態を保存
  const existingSelections = new Map<string, { east: boolean, west: boolean }>()
  timeSlots.value.forEach(slot => {
    if (slot.east.selected || slot.west.selected) {
      existingSelections.set(slot.time, {
        east: slot.east.selected,
        west: slot.west.selected
      })
    }
  })
  
  // 時間帯データを再構築
  await loadTimeSlotsForDate(date)
  
  // 選択状態を復元
  timeSlots.value.forEach(slot => {
    const saved = existingSelections.get(slot.time)
    if (saved) {
      slot.east.selected = saved.east
      slot.west.selected = saved.west
    }
  })
  
  logger.info('時間帯選択状態を復元', { 
    復元した選択: Array.from(existingSelections.entries()).map(([time, selection]) => ({ time, ...selection }))
  })
}

// 指定日の時間帯データを読み込み
const loadTimeSlotsForDate = async (date: string) => {
  logger.info('指定日の時間帯データ読み込み', { date, stack: new Error().stack?.split('\n')[2]?.trim() })
  
  try {
    // 日付をYYYYMMDD形式に変換
    const formattedDate = date.replace(/-/g, '')
    
    // 入場予約スケジュールを取得
    const year = parseInt(formattedDate.substring(0, 4))
    const month = parseInt(formattedDate.substring(4, 6))
    
    // キャッシュからデータを取得（API呼び出しは月変更時と手動更新時のみ）
    const cacheKey = `${year}-${String(month).padStart(2, '0')}`
    const scheduleData = ticketsStore.entranceSchedules.get(cacheKey)
    
    if (!scheduleData) {
      logger.warn('入場スケジュールキャッシュがありません（月変更または手動更新が必要）', { date, year, month, cacheKey })
      timeSlots.value = []
      return
    }
    
    logger.info('キャッシュからデータ取得', { date, year, month, cacheKey })
    
    // 指定日のスケジュールを検索（0埋め形式）
    const dayOfMonth = formattedDate.substring(6, 8) // "01", "29"
    const dayData = scheduleData?.states?.[dayOfMonth]
    
    // デバッグ用ログ
    logger.info('スケジュールデータ検索', { 
      date,
      dayOfMonth,
      hasScheduleData: !!scheduleData,
      scheduleData: scheduleData ? JSON.stringify(scheduleData).substring(0, 200) + '...' : null,
      availableDates: scheduleData?.states ? Object.keys(scheduleData.states) : [],
      availableDatesDetail: scheduleData?.states ? Object.keys(scheduleData.states).slice(0, 10) : [],
      searchKey: dayOfMonth,
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
  if (!dateString || typeof dateString !== 'string') {
    return ''
  }
  
  const date = new Date(dateString + 'T00:00:00') // UTC時刻で正確に解析
  
  // Invalid Dateの場合は空文字を返す
  if (isNaN(date.getTime())) {
    logger.warn('formatDate: 不正な日付文字列', { dateString })
    return ''
  }
  
  return `${date.getMonth() + 1}/${date.getDate()}`
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

// 指定日に予約があるかチェック
const hasReservationForDate = (dateString: string): boolean => {
  const selectedTickets = ticketsStore.selectedTickets
  const targetDate = dateString.replace(/-/g, '') // YYYYMMDD形式に変換
  
  for (const ticket of selectedTickets) {
    if (ticket.schedules) {
      for (const schedule of ticket.schedules) {
        if (schedule.entrance_date === targetDate && schedule.isEffective === true) {
          return true
        }
      }
    }
  }
  return false
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

// 抽選期間特別日付の判定
const isSpecialLotteryDate = (date: Date): boolean => {
  // 万博入場可能期間（2025年4月13日〜10月13日）の日付のみチェック
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 0-indexedなので+1
  const day = date.getDate()
  
  if (year !== 2025 || month < 4 || (month === 4 && day < 13) || month > 10 || (month === 10 && day > 13)) {
    return false
  }
  
  // 各入場可能日に対して判定
  const entranceDate = new Date(date)
  
  // 条件1: その日が「7日前抽選の期間終了日」= 入場日の8日前
  const eightDaysBefore = new Date(entranceDate)
  eightDaysBefore.setDate(eightDaysBefore.getDate() - 8)
  
  // 条件2: 「翌日が3日前抽選の開始日」= 入場日の4日前（3日前抽選開始の前日）
  const fourDaysBefore = new Date(entranceDate)
  fourDaysBefore.setDate(fourDaysBefore.getDate() - 4)
  
  // 現在の日付がこれらの特別日付のいずれかと一致するか判定
  const currentDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const eightDaysBeforeString = `${eightDaysBefore.getFullYear()}-${String(eightDaysBefore.getMonth() + 1).padStart(2, '0')}-${String(eightDaysBefore.getDate()).padStart(2, '0')}`
  const fourDaysBeforeString = `${fourDaysBefore.getFullYear()}-${String(fourDaysBefore.getMonth() + 1).padStart(2, '0')}-${String(fourDaysBefore.getDate()).padStart(2, '0')}`
  
  return currentDateString === eightDaysBeforeString || currentDateString === fourDaysBeforeString
}

// 入場予約データの更新
const refreshEntranceData = async () => {
  isRefreshing.value = true
  try {
    logger.info('[ENTRANCE:EntranceTab] 入場予約データ更新開始')
    
    // 現在選択中の日付を保持
    const currentSelectedDate = selectedDate.value
    const currentSelectedSchedule = selectedSchedule.value
    
    logger.info('手動更新前の状態', { 
      currentSelectedDate, 
      currentSelectedDateType: typeof currentSelectedDate,
      currentSelectedDateLength: currentSelectedDate?.length,
      hasSchedule: !!currentSelectedSchedule 
    })
    
    // 現在の月の入場スケジュールデータを強制更新
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth() + 1
    
    // API呼び出し前の状態をログ
    logger.info('API呼び出し前のtickets状態', {
      ticketsSize: ticketsStore.tickets.size,
      ticketsRef: ticketsStore.tickets,
      selectedScheduleBefore: selectedSchedule.value ? {
        entrance_date: selectedSchedule.value.entrance_date,
        user_visiting_reservation_id: selectedSchedule.value.user_visiting_reservation_id,
        ref: selectedSchedule.value
      } : null
    })
    
    await ticketsStore.getEntranceScheduleData(year, month, true) // 強制更新
    
    // API呼び出し後の状態をログ
    logger.info('API呼び出し後のtickets状態', {
      ticketsSize: ticketsStore.tickets.size,
      ticketsRef: ticketsStore.tickets,
      selectedScheduleAfter: selectedSchedule.value ? {
        entrance_date: selectedSchedule.value.entrance_date,
        user_visiting_reservation_id: selectedSchedule.value.user_visiting_reservation_id,
        ref: selectedSchedule.value
      } : null
    })
    
    logger.info('データ更新後の状態', {
      selectedDateAfterUpdate: selectedDate.value,
      selectedScheduleAfterUpdate: !!selectedSchedule.value
    })
  
    // 選択日付がある場合は必ず保持（schedule.selectedは自動的に保持される）
    if (currentSelectedDate && currentSelectedDate.trim() !== '') {
      selectedDate.value = currentSelectedDate
      logger.info('既存の選択日付を保持', { date: currentSelectedDate, hasSchedule: !!selectedSchedule.value })
      
      // 選択日の時間帯データを再読み込み（選択状態を保持）
      await loadTimeSlotsForDateWithSelection(currentSelectedDate)
    } else {
      logger.info('選択日付が無効なためデフォルト選択を実行', { 
        currentSelectedDate, 
        isEmpty: !currentSelectedDate,
        isEmptyString: currentSelectedDate === '',
        isTrimEmpty: currentSelectedDate?.trim() === ''
      })
      // 選択日付がない場合のみデフォルト選択を実行
      initializeDefaultSelection()
    }
    
    logger.info('入場予約データ更新完了', {
      finalSelectedDate: selectedDate.value,
      finalSchedule: !!selectedSchedule.value
    })
  } finally {
    isRefreshing.value = false
  }
}

// デフォルト選択の初期化
const initializeDefaultSelection = () => {
  // 選択済みの入場予約から日付を取得
  const selectedTickets = ticketsStore.selectedTickets
  
  logger.info('入場タブ初期化開始', {
    selectedTicketsCount: selectedTickets.length,
    ticketIds: selectedTickets.map(t => t.ticket_id),
    currentSelectedSchedule: selectedSchedule.value
  })
  
  for (const ticket of selectedTickets) {
    logger.info('チケット確認', {
      ticketId: ticket.ticket_id,
      schedulesCount: ticket.schedules?.length || 0,
      schedules: ticket.schedules?.map(s => ({
        selected: s.selected,
        isOwn: ticket.isOwn,
        entrance_date: s.entrance_date,
        gate_type: s.gate_type,
        time_start: s.time_start
      }))
    })
    
    if (ticket.schedules) {
      for (const schedule of ticket.schedules) {
        logger.info('スケジュール確認', {
          selected: schedule.selected,
          isOwn: ticket.isOwn,  
          ticketIsOwn: ticket.isOwn,
          entrance_date: schedule.entrance_date,
          time_start: schedule.time_start,
          gate_type: schedule.gate_type,
          user_visiting_reservation_id: schedule.user_visiting_reservation_id,
          conditionMet: schedule.selected && ticket.isOwn
        })
        
        if (schedule.selected && ticket.isOwn) {
          // 選択済みの入場予約がある場合、その日付をデフォルト選択
          const formattedDate = formatScheduleDate(schedule.entrance_date)
          selectedDate.value = formattedDate
          // schedule.selectedは既にtrueの状態
          
          // カレンダー月も連動
          const selectedDateObj = new Date(formattedDate + 'T00:00:00')
          currentMonth.value = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1)
          
          logger.info('選択済み入場予約の日付をデフォルト選択', { 
            date: formattedDate, 
            reservationId: schedule.user_visiting_reservation_id,
            scheduleData: {
              entrance_date: schedule.entrance_date,
              time_start: schedule.time_start,
              gate_type: schedule.gate_type,
              user_visiting_reservation_id: schedule.user_visiting_reservation_id
            }
          })
          
          // getFromDateTimeText()が正常に動作するかテスト
          const testResult = getFromDateTimeText()
          logger.info('getFromDateTimeText テスト結果', { testResult })
          
          return
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
  // 全ての予約の選択状態をクリア
  for (const ticket of ticketsStore.tickets.values()) {
    if (ticket.schedules) {
      ticket.schedules.forEach(schedule => {
        schedule.selected = false
      })
    }
  }
  logger.info('今日の日付をデフォルト選択（選択済み入場予約なし）', { 
    date: todayString, 
    todayObject: today.toString(),
    year: todayYear,
    month: todayMonth, 
    day: todayDay,
    finalSelectedSchedule: selectedSchedule.value
  })
  
  // 最終的なselectedSchedule状態をログ出力
  logger.info('initializeDefaultSelection完了', {
    finalSelectedDate: selectedDate.value,
    finalSelectedSchedule: selectedSchedule.value,
    hasSelectedSchedule: !!selectedSchedule.value
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

// 毎分35秒タイマーを開始
const startReservationCycle = (selectedTimeSlots: any[]) => {
  logger.info('毎分35秒サイクル開始', { timeSlots: selectedTimeSlots.length })
  
  // 次の35秒まで待機
  const now = new Date()
  const currentSeconds = now.getSeconds()
  const waitTime = currentSeconds <= 35 ? 
    (35 - currentSeconds) * 1000 : 
    (60 + 35 - currentSeconds) * 1000
  
  reservationStatus.value = {
    visible: true,
    isActive: true,
    currentAction: `次回実行待機中（${Math.ceil(waitTime / 1000)}秒）`,
    progress: 0,
    progressText: '待機中',
    statusClass: ''
  }
  
  // 待機時間のプログレスバーを開始
  // startWaitingProgress(waitTime, `次回実行待機中（${Math.ceil(waitTime / 1000)}秒）`)
  
  // reservationTimer = setTimeout(() => {
  //   executeCycleStep(selectedTimeSlots)
  // }, waitTime)
}

// サイクル処理を停止
const clearReservationTimer = () => {
  reservationManager.clearReservationTimer()
}

// サイクルステップを実行（毎分35秒に実行）
const executeCycleStep = async (selectedTimeSlots: any[]) => {
  try {
    logger.info('サイクルステップ開始', { 
      time: new Date().toLocaleTimeString(),
      selectedTimeSlots: selectedTimeSlots.length 
    })
    
    // 1. 並行処理：最優先予約実行 + 空き情報取得
    await executeParallelTasks(selectedTimeSlots)
    
    // 2. 条件付き追加実行
    await executeAdditionalReservations(selectedTimeSlots)
    
    // 3. 次の分の35秒まで待機
    scheduleNextCycle(selectedTimeSlots)
    
  } catch (error) {
    logger.error('サイクルステップエラー', error)
    reservationStatus.value = {
      visible: true,
      isActive: false,
      currentAction: 'エラーが発生しました',
      progress: 0,
      progressText: 'エラー',
      statusClass: ''
    }
  }
}

// 次のサイクルをスケジュール
const scheduleNextCycle = (selectedTimeSlots: any[]) => {
  if (!isReservationRunning.value) return
  
  const waitTime = 60 * 1000 // 60秒後
  
  reservationStatus.value = {
    visible: true,
    isActive: true,
    currentAction: '次回実行待機中（60秒）',
    progress: 0,
    progressText: '待機中',
    statusClass: ''
  }
  
  // 待機時間のプログレスバーを開始
  // startWaitingProgress(waitTime, '次回実行待機中（60秒）')
  
  // reservationTimer = setTimeout(() => {
  //   executeCycleStep(selectedTimeSlots)
  // }, waitTime)
}

// 並行処理：最優先予約実行 + 空き情報取得
const executeParallelTasks = async (selectedTimeSlots: any[]) => {
  const topPrioritySlot = selectedTimeSlots[0] // 最優先（order=1）
  if (!topPrioritySlot) return
  
  const topPriorityKey = `${topPrioritySlot.gate}-${topPrioritySlot.time}`
  
  reservationStatus.value = {
    visible: true,
    isActive: true,
    currentAction: '並行処理実行中...',
    progress: 25,
    progressText: '1/4',
    statusClass: ''
  }
  
  logger.info('並行処理開始', { 
    topPrioritySlot,
    selectedDate: selectedDate.value 
  })
  
  // 並行実行
  const [reservationResult, availabilityData] = await Promise.all([
    // 最優先の予約実行
    executePriorityReservation(topPrioritySlot),
    // 空き情報取得
    getAvailabilityInfo()
  ])
  
  // 最優先予約が成功した場合は実行済みとして記録
  if (reservationResult?.success) {
    // executedReservations.add(topPriorityKey)
    logger.info('最優先予約成功', { slot: topPrioritySlot, result: reservationResult })
    
    // 予約成功時の処理
    isReservationRunning.value = false
    clearReservationTimer()
    reservationStatus.value = {
      visible: true,
      isActive: false,
      currentAction: `予約成功しました - ${topPrioritySlot.gate}${topPrioritySlot.time}`,
      progress: 100,
      progressText: '成功',
      statusClass: 'success'
    }
    reservationInfo.value = { ...reservationInfo.value, completed: true }
    
    // 成功時はチケット情報を更新
    setTimeout(async () => {
      await ticketsStore.loadAllTickets()
    }, 2000)
  }
  
  return { reservationResult, availabilityData }
}

// 最優先予約を実行
const executePriorityReservation = async (slot: any) => {
  try {
    const apiTime = getApiTimeForReservation(slot.time)
    const gateType = slot.gate === '東' ? '1' : '2'
    
    let result
    if (selectedSchedule.value && selectedSchedule.value.user_visiting_reservation_id && selectedSchedule.value.user_visiting_reservation_id > 0) {
      result = await changeEntranceReservation(selectedSchedule.value.user_visiting_reservation_id, apiTime, gateType)
    } else {
      const selectedTickets = ticketsStore.selectedTickets
      const ticketIds = selectedTickets.map(ticket => ticket.ticket_id)
      if (selectedDate.value && selectedDate.value.trim() !== '') {
        result = await createEntranceReservation(ticketIds, selectedDate.value, apiTime, gateType)
      }
    }
    
    logger.info('最優先予約実行結果', { slot, result })
    return result
    
  } catch (error) {
    logger.error('最優先予約エラー', { slot, error })
    return { success: false, error }
  }
}

// 空き情報を取得
const getAvailabilityInfo = async () => {
  try {
    const year = parseInt(selectedDate.value.substring(0, 4))
    const month = parseInt(selectedDate.value.substring(5, 7))
    
    // 月の空き情報を取得
    const scheduleData = await ticketsStore.getEntranceScheduleData(year, month, true)
    
    // 指定日の時間帯情報を取得
    const dayOfMonth = selectedDate.value.substring(8, 10)
    const dayData = scheduleData?.states?.[dayOfMonth]
    
    logger.info('空き情報取得結果', { year, month, dayOfMonth, hasDayData: !!dayData })
    return dayData
    
  } catch (error) {
    logger.error('空き情報取得エラー', error)
    return null
  }
}

// 条件付き追加実行
const executeAdditionalReservations = async (selectedTimeSlots: any[]) => {
  reservationStatus.value = {
    visible: true,
    isActive: true,
    currentAction: '追加実行判定中...',
    progress: 50,
    progressText: '2/4',
    statusClass: ''
  }
  
  // 空き情報を再取得（最新状態確認）
  const availabilityData = await getAvailabilityInfo()
  if (!availabilityData) {
    logger.warn('空き情報が取得できないため追加実行をスキップ')
    return
  }
  
  // 実行済みを除く選択済み時間帯で満員でない時間帯を抽出
  const availableSlots = selectedTimeSlots.filter(slot => {
    const slotKey = `${slot.gate}-${slot.time}`
    // if (executedReservations.has(slotKey)) return false // 実行済みは除外
    
    // 空き状況を確認
    const gateKey = slot.gate === '東' ? '1' : '2'
    const timeKey = getApiTimeForReservation(slot.time)
    const timeState = availabilityData[gateKey]?.[timeKey]?.time_state
    
    // time_state: 0=空きあり, 1=残り少ない, 2=満席, 4=利用不可
    return timeState === 0 || timeState === 1
  })
  
  logger.info('追加実行対象判定', { 
    totalSlots: selectedTimeSlots.length,
    // executedCount: executedReservations.size,
    availableSlots: availableSlots.length,
    availableSlotDetails: availableSlots.map(slot => ({ gate: slot.gate, time: slot.time }))
  })
  
  if (availableSlots.length === 0) {
    logger.info('追加実行対象なし')
    return
  }
  
  // 優先度順で最大2つを実行
  const slotsToExecute = availableSlots.slice(0, 2)
  
  for (const [index, slot] of slotsToExecute.entries()) {
    reservationStatus.value = {
      visible: true,
      isActive: true,
      currentAction: `追加実行中: ${slot.gate}${slot.time}`,
      progress: 50 + (index + 1) * 20,
      progressText: `${3 + index}/4`,
      statusClass: ''
    }
    
    try {
      const result = await executePriorityReservation(slot)
      
      if (result?.success) {
        const slotKey = `${slot.gate}-${slot.time}`
        // executedReservations.add(slotKey)
        logger.info('追加実行成功', { slot, result })
        
        // 予約成功時の処理
        isReservationRunning.value = false
        clearReservationTimer()
        reservationStatus.value = {
          visible: true,
          isActive: false,
          currentAction: `予約成功しました - ${slot.gate}${slot.time}`,
          progress: 100,
          progressText: '成功',
          statusClass: 'success'
        }
        reservationInfo.value = { ...reservationInfo.value, completed: true }
        
        // 成功時はチケット情報を更新
        setTimeout(async () => {
          await ticketsStore.loadAllTickets()
        }, 2000)
        return // 成功したらここで終了
      } else {
        logger.warn('追加実行失敗', { slot, result })
      }
      
      // 次の実行まで少し間隔を空ける
      if (index < slotsToExecute.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
    } catch (error) {
      logger.error('追加実行エラー', { slot, error })
    }
  }
}


// 予約実行時のみ時間マッピングを実行（内部形式を受け取り、そのまま返す）
const getApiTimeForReservation = (internalTime: string): string => {
  // すでに内部形式（"0700"）を受け取っているので、そのまま返す
  if (internalTime.length === 4 && /^\d{4}$/.test(internalTime)) {
    return internalTime
  }
  
  // 万が一表示形式が渡された場合の変換
  switch (internalTime) {
    case '9:00': return '0700'
    case '10:00': return '0900' 
    case '11:00': return '1000'
    case '12:00': return '1100'
    case '17:00': return '1600'
    default: return ''
  }
}

// 予約実行
const executeReservation = async () => {
  if (!isReservationRunning.value && !isReservationButtonEnabled.value) {
    logger.warn('予約ボタンが無効な状態で実行されました')
    return
  }

  const timeSlotInfo = getSelectedTimeSlotInfo()
  if (!timeSlotInfo || !selectedSchedule.value) {
    logger.warn('必要な情報が不足しています', { timeSlotInfo, selectedSchedule: selectedSchedule.value })
    return
  }
  
  // 選択された時間帯を優先度順に取得
  const selectedTimeSlots = getSelectedTimeSlotsInPriorityOrder()
  
  logger.info('予約実行開始', { 
    selectedDate: selectedDate.value, 
    timeSlot: timeSlotInfo,
    schedule: selectedSchedule.value,
    selectedTimeSlots 
  })
  
  // マネージャーに処理を委譲（選択日付、既存予約ID、元の予約情報を渡す）
  const existingReservationId = selectedSchedule.value?.user_visiting_reservation_id || null
  const originalReservationInfo = selectedSchedule.value ? {
    gate: selectedSchedule.value.gate_type === 1 ? '東' : '西',
    time: selectedSchedule.value.schedule_name?.replace('-', '') || '',
    date: selectedDate.value
  } : null
  
  if (selectedDate.value && selectedDate.value.trim() !== '') {
    await reservationManager.executeReservation(selectedTimeSlots, selectedDate.value, existingReservationId, originalReservationInfo)
  }
}


// 新規入場予約作成
const createEntranceReservation = async (ticketIds: string[], entranceDate: string, startTime: string, gateType: string) => {
  const response = await fetch('/api/d/user_visiting_reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      'X-Api-Lang': 'ja'
    },
    body: JSON.stringify({
      ticket_ids: ticketIds,
      start_time: startTime,
      gate_type: gateType,
      entrance_date: entranceDate.replace(/-/g, '') // YYYY-MM-DD → YYYYMMDD
    })
  })
  
  if (response.ok) {
    const result = await response.json()
    return { success: true, data: result }
  } else {
    const error = await response.json()
    return { success: false, error }
  }
}

// 入場予約変更
const changeEntranceReservation = async (reservationId: number, startTime: string, gateType: string) => {
  const response = await fetch('/api/d/user_visiting_reservations', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      'X-Api-Lang': 'ja'
    },
    body: JSON.stringify({
      user_visiting_reservation_ids: [reservationId],
      start_time: startTime,
      gate_type: gateType,
      entrance_date: selectedDate.value.replace(/-/g, '') // YYYY-MM-DD → YYYYMMDD
    })
  })
  
  if (response.ok) {
    const result = await response.json()
    return { success: true, data: result }
  } else {
    const error = await response.json()
    return { success: false, error }
  }
}

// デモ用の予約進行状況シミュレーション（削除予定）
const simulateReservationProgress = () => {
  const stages = [
    { action: '空き情報取得中...', progress: 33, progressText: '1/3' },
    { action: '予約実行中...', progress: 66, progressText: '2/3' },
    { action: '結果確認中...', progress: 100, progressText: '3/3' }
  ]
  
  stages.forEach((stage, index) => {
    setTimeout(() => {
      if (reservationStatus.value.visible) {
        reservationStatus.value.currentAction = stage.action
        reservationStatus.value.progress = stage.progress
        reservationStatus.value.progressText = stage.progressText
        
        if (index === stages.length - 1) {
          // 最後のステージ後、待機状態に戻る
          setTimeout(() => {
            if (reservationStatus.value.visible) {
              reservationStatus.value.currentAction = '次回実行待機中（35秒まで待機）'
              reservationStatus.value.isActive = false
              reservationStatus.value.progress = 0
              reservationStatus.value.progressText = '0/3'
            }
          }, 2000)
        }
      }
    }, (index + 1) * 3000)
  })
}

// 選択された時間帯の指定日での空き状況を取得
const getSelectedTimeSlotAvailability = (dateString: string, selectedTime: string) => {
  
  // 指定日のスケジュールデータを取得
  const year = parseInt(dateString.substring(0, 4))
  const month = parseInt(dateString.substring(5, 7))
  const day = dateString.substring(8, 10) // 0埋め形式 (YYYY-MM-DD形式の場合)
  
  const scheduleKey = `${year}-${String(month).padStart(2, '0')}`
  const scheduleData = ticketsStore.entranceSchedules.get(scheduleKey)
  
  if (!scheduleData || !scheduleData.states?.[day]) {
    return null
  }
  
  const dayData = scheduleData.states[day]
  const eastGate = dayData['1']
  const westGate = dayData['2']
  
  // 表示時間から直接対応するAPI時間キーを取得
  const getApiTimeKey = (displayTime: string): string => {
    switch (displayTime) {
      case '9:00': return '0700'
      case '10:00': return '0900' 
      case '11:00': return '1000'
      case '12:00': return '1100'
      case '17:00': return '1600'
      default: return ''
    }
  }
  
  const apiTime = getApiTimeKey(selectedTime)
  if (!apiTime) {
    return null
  }
  
  // 空き状況のクラス名を取得
  const getStatusClass = (timeState: number) => {
    switch (timeState) {
      case 0: return 'available'   // 空きあり
      case 1: return 'few-left'    // 残り少ない  
      case 2: return 'full'        // 満席
      case 4: return 'unavailable' // 利用不可
      default: return 'unknown'
    }
  }
  
  return {
    east: {
      class: getStatusClass(eastGate?.[apiTime]?.time_state ?? 4)
    },
    west: {
      class: getStatusClass(westGate?.[apiTime]?.time_state ?? 4)
    }
  }
}

// 選択クリア
const clearSelection = () => {
  timeSlots.value.forEach(slot => {
    slot.east.selected = false
    slot.west.selected = false
  })
  selectionOrder.value = []
  logger.info('選択をクリア', { selectedDate: selectedDate.value })
}

// 時間帯選択の切り替え（満員時間帯も選択可能、複数選択可）
const toggleTimeSlot = (gate: 'east' | 'west', time: string) => {
  const slot = timeSlots.value.find(s => s.time === time)
  if (!slot) return
  
  const gateData = slot[gate]
  if (!gateData) return
  
  // 無効な時間帯は選択不可
  if (gateData.status === 'disabled') {
    logger.warn('無効な時間帯の選択を試行', { gate, time })
    return
  }
  
  const key = `${time}-${gate}`
  
  // 変更前の優先度1の時間帯を取得
  const previousPriority1Time = selectionOrder.value.find(item => item.order === 1)?.key?.split('-')[0] || null
  
  // 選択状態を切り替え
  if (gateData.selected) {
    // 選択解除：順序から削除
    gateData.selected = false
    selectionOrder.value = selectionOrder.value.filter(item => item.key !== key)
    // 残りの順序を再調整
    selectionOrder.value.forEach((item, index) => {
      item.order = index + 1
    })
  } else {
    // 選択：順序に追加
    gateData.selected = true
    const nextOrder = Math.max(...selectionOrder.value.map(item => item.order), 0) + 1
    selectionOrder.value.push({ key, order: nextOrder })
  }
  
  // 変更後の優先度1の時間帯を取得
  const currentPriority1Time = selectionOrder.value.find(item => item.order === 1)?.key?.split('-')[0] || null
  
  // 優先度1の時間帯が変わった場合はキャッシュを更新
  if (previousPriority1Time !== currentPriority1Time) {
    if (currentPriority1Time) {
      // computedで自動更新されるため手動更新は不要
    } else {
      // computedで自動更新されるためキャッシュクリアは不要
    }
  }
  
  logger.info('時間帯選択切り替え', { 
    gate, 
    time, 
    status: gateData.status, 
    selected: gateData.selected,
    selectionOrder: selectionOrder.value
  })
}


// コンポーネントマウント時の初期化
onMounted(async () => {
  // 事前初期化完了を待機
  while (!ticketsStore.isInitialized) {
    await new Promise(resolve => setTimeout(resolve, 50)) // 50ms間隔でポーリング
  }
  logger.info('事前初期化完了を確認')
  
  // 初期読み込み: 現在月のスケジュールデータを取得
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  await ticketsStore.getEntranceScheduleData(year, month, false)
  logger.info('初期読み込み完了', { year, month })
  
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
  justify-content: center; // 全体を中央揃え
  align-items: flex-start;
  margin-bottom: 16px; // 下段との間隔
}

// 第3ブロック: 実行情報（下段独立配置）
.ytomo-execution-info {
  width: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: center;
  
  // 実行情報内の予約情報と実行状態を横並びに配置
  .ytomo-reservation-info,
  .ytomo-reservation-status {
    flex: 1 1 0;
    max-width: 300px;
  }
  
  // 予約情報のスタイル
  .ytomo-reservation-info {
    margin-top: 0;
    
    &.completed {
      opacity: 0.6;
      
      .ytomo-reservation-box {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-color: #6c757d;
      }
      
      .ytomo-reservation-date {
        color: #6c757d;
        border-color: #6c757d;
      }
    }
    
    .ytomo-reservation-box {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #0891b2;
      border-radius: 8px;
      padding: 16px;
      position: relative;
      
      .ytomo-reservation-date {
        position: absolute;
        top: -8px;
        left: 12px;
        font-weight: 600;
        font-size: 12px;
        color: #0c4a6e;
        background: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #0891b2;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .ytomo-reservation-timeslots {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .ytomo-timeslot {
          background: rgba(8,145,178,0.1);
          border: 1px solid #0891b2;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 10px;
          font-weight: 500;
          color: #0c4a6e;
        }
      }
    }
  }
  
  // 予約実行状態のスタイル
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
        }
        
        .ytomo-datetime-change {
          font-size: 11px;
          color: #059669;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .ytomo-status-progress {
          .ytomo-progress-bar {
            width: 200px; // 固定幅に変更
            height: 6px;
            background: rgba(217,119,6,0.2);
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
          
          .ytomo-progress-text {
            font-size: 11px;
            color: #78716c;
            text-align: right;
            display: block;
            margin-top: 4px;
          }
        }
        
        // 実行履歴表示
        .ytomo-execution-history {
          margin-top: 12px;
          
          .ytomo-history-title {
            font-size: 11px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 6px;
          }
          
          .ytomo-history-items {
            display: flex;
            flex-direction: row;
            gap: 8px;
            flex-wrap: wrap;
            
            .ytomo-history-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              
              &.success {
                background-color: rgba(5, 150, 105, 0.1);
                border-left: 3px solid #059669;
              }
              
              &.failure {
                background-color: rgba(220, 38, 38, 0.1);
                border-left: 3px solid #dc2626;
              }
              
              .ytomo-history-result {
                font-weight: 600;
                
                .success & {
                  color: #059669;
                }
                
                .failure & {
                  color: #dc2626;
                }
              }
              
              .ytomo-history-detail {
                color: #6b7280;
                font-size: 11px;
              }
            }
          }
        }
      }
    }
  }
}

// レスポンシブ対応: 狭いスマホのみ縦積み
@media (max-width: 520px) {
  .ytomo-entrance-layout {
    flex-direction: column;
    gap: 12px;
  }
}

.ytomo-entrance-calendar {
  flex: 0 0 220px; /* 固定幅220pxに縮小 */
  height: 320px; /* 高さを最適化 */
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
    padding: 4px;
    overflow: auto;
  }
  
  .ytomo-calendar-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
    
    .ytomo-month-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
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
      
      /* 個別識別用の追加クラス */
      &--prev {
        /* 前月ボタン用（必要に応じて個別スタイル追加可能） */
      }
      
      &--next {
        /* 次月ボタン用（必要に応じて個別スタイル追加可能） */
      }
    }
    
    .ytomo-current-month {
      font-weight: 600;
      color: #374151;
      flex: 1;
      text-align: center;
    }
    
    .ytomo-availability-time {
      font-size: 11px;
      color: #6b7280;
      margin-left: 8px;
      white-space: nowrap;
      width: 40px;
      display: inline-block;
      text-align: left;
    }
    
    .ytomo-calendar-refresh-button {
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
      margin-left: 8px;
      
      &:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
      }
      
      &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }
    }
    
    .ytomo-rotating {
      animation: ytomo-rotate 1s linear infinite;
    }
    
    @keyframes ytomo-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  }
  
  .ytomo-calendar-grid {
    .ytomo-calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      margin-bottom: 2px;
      
      .ytomo-weekday {
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        padding: 2px;
      }
    }
    
    .ytomo-calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      
      .ytomo-calendar-day {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        cursor: pointer;
        border-radius: 3px;
        transition: all 0.2s;
        min-height: 20px;
        
        // 子要素のクリックイベントを無効にして、親要素のクリックを確実に実行
        * {
          pointer-events: none;
        }
        
        &:hover:not(.disabled):not(.other-month) {
          background: #f3f4f6;
        }
        
        &.selected {
          background: white;
          color: #0c4a6e;
          border: 2px solid #0891b2;
          font-weight: 600;
        }
        
        &.today {
          background: #dbeafe;
          color: #1e40af;
          font-weight: 600;
        }
        
        &.has-reservation {
          background: #f0fdf4;
          color: #166534;
          
          &.selected {
            background: white;
            color: #0c4a6e;
            border: 2px solid #0891b2;
            font-weight: 600;
          }
        }
        
        &.other-month {
          color: #d1d5db;
          cursor: default;
        }
        
        &.disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
        
        .ytomo-day-number {
          margin-bottom: 2px;
        }
        
        .ytomo-availability-indicator {
          display: flex;
          gap: 2px;
          height: 8px; // 固定高さで位置を安定化
          
          .ytomo-gate-availability {
            display: flex;
            align-items: center;
            
            .ytomo-status-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              border: 1px solid #d1d5db;
              
              &.available {
                background-color: #10b981; // 緑
                border-color: #10b981;
              }
              
              &.few-left {
                background-color: #f59e0b; // オレンジ
                border-color: #f59e0b;
              }
              
              &.full {
                background-color: #ef4444; // 赤
                border-color: #ef4444;
              }
              
              &.unavailable {
                background-color: #9ca3af; // グレー
                border-color: #9ca3af;
              }
              
              &.unknown {
                background-color: #d1d5db;
                border-color: #d1d5db;
              }
            }
          }
        }
        
        // 抽選期間特別日付の丸囲み表示
        &.special-lottery-date .ytomo-day-number {
          border: 2px solid #f97316; // オレンジ色の丸
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
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
  
  .ytomo-date-display-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }

  .ytomo-change-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    .ytomo-arrow-icon {
      width: 20px;
      height: 20px;
      fill: #059669;
      opacity: 0.8;
      transition: all 0.3s ease;
      filter: drop-shadow(0 1px 2px rgba(5, 150, 105, 0.2));
      
      &:hover {
        opacity: 1;
        transform: translateX(2px);
      }
    }
  }

  .ytomo-existing-datetime-display {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    font-weight: 600;
    font-size: 10px;
    text-align: center;
    padding: 4px 6px;
    border-radius: 4px;
    border: 1px solid rgba(239, 68, 68, 0.3);
    
    &.existing {
      background: rgba(156, 163, 175, 0.1);
      color: #6b7280;
      border: 1px solid rgba(156, 163, 175, 0.3);
    }
    white-space: nowrap;
    flex-shrink: 0;
  }

  .ytomo-selected-date-display {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
    font-weight: 700;
    font-size: 14px;
    text-align: center;
    
    &.selected {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    padding: 8px 12px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
    flex: 1;
  }
  
  .ytomo-reservation-table-container {
    flex: 1;
    min-height: 0;
    max-width: 600px; /* テーブルの最大幅を制限 */
    
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
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e5e7eb;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
    
    .ytomo-datetime-change {
      min-height: 40px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .ytomo-change-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .ytomo-datetime-button {
        background: #e0f2fe;
        border: 1px solid #0891b2;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        color: #0c4a6e;
        font-weight: 500;
        transition: all 0.2s;
        min-width: 80px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.ytomo-from-datetime {
          // 変更前は少し薄く
          opacity: 0.8;
        }
        
        &.ytomo-to-datetime {
          // 変更後はハイライト
          background: #0891b2;
          color: white;
          border-color: #0891b2;
        }
      }
      
      .ytomo-arrow {
        font-size: 14px;
        font-weight: bold;
        color: #6b7280;
        padding: 0 4px;
      }
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
        width: 120px;
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
        
        &.cancel-mode {
          background: #dc2626;
          color: white;
          
          &:hover {
            background: #b91c1c;
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
        &.cancel-mode {
          background: #dc2626;
          border-color: #dc2626;
          
          &:hover {
            background: #b91c1c;
            border-color: #b91c1c;
          }
        }
      }
    }
    
    // 予約情報表示エリア
    .ytomo-reservation-info {
      width: 100%;
      margin-top: 12px;
      
      &.completed {
        opacity: 0.6;
        
        .ytomo-reservation-box {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-color: #6c757d;
        }
        
        .ytomo-reservation-date {
          color: #6c757d;
          border-color: #6c757d;
        }
      }
      
      .ytomo-reservation-box {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 1px solid #0891b2;
        border-radius: 8px;
        padding: 16px;
        position: relative;
        
        .ytomo-reservation-date {
          position: absolute;
          top: -8px;
          left: 12px;
          font-weight: 600;
          font-size: 12px;
          color: #0c4a6e;
          background: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #0891b2;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .ytomo-reservation-timeslots {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          
          .ytomo-timeslot {
            background: rgba(8, 145, 178, 0.1);
            border: 1px solid #0891b2;
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 10px;
            font-weight: 500;
            color: #0c4a6e;
          }
        }
      }
    }
    
    // 予約実行状態表示エリア
    .ytomo-reservation-status {
      width: 100%;
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px;
      margin-top: 8px;
      
      // 成功状態
      &.success {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        border-color: #059669;
      }
      
      // 中断状態
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
          position: relative;
          
          .ytomo-status-current {
            font-size: 12px;
            color: #92400e;
            margin-bottom: 8px;
            font-weight: 500;
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
            
            // 予約履歴表示（右下に配置）
          }
        }
      }
    }
  }
}

// コンパクトなテーブルスタイル
.ytomo-entrance-table {
  width: 100%;
  max-width: 300px; /* テーブル幅を拡張 */
  border-collapse: collapse;
  margin: 0 auto; /* テーブルを中央揃え */
  
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
    
    &.disabled {
      background: #f3f4f6;
      color: #9ca3af;
      cursor: not-allowed;
      opacity: 0.5;
      
      &:hover {
        background: #f3f4f6;
        border-color: #d1d5db;
      }
    }
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
      border-color: #2c5aa0;
      border-style: solid;
      box-shadow: inset 0 0 0 1px #2c5aa0;
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
    
    .ytomo-selection-area {
      width: 22px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 4px;
    }
    
    .ytomo-selection-number {
      font-size: 12px;
      font-weight: 900;
      color: #059669;
      background: rgba(5, 150, 105, 0.1);
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #059669;
    }
    
    .ytomo-time-text {
      font-size: 11px;
      font-weight: 500;
    }
    
  }
}

/* タブレット対応のメディアクエリ */
@media (min-width: 768px) and (max-width: 1199px) {
  .ytomo-entrance-calendar {
    flex: 0 0 260px;
    height: 320px;
    
    .ytomo-calendar-body {
      padding: 14px;
    }
    
    .ytomo-calendar-grid .ytomo-calendar-days .ytomo-calendar-day {
      font-size: 12px;
      min-height: 26px;
    }
  }
  
  .ytomo-selected-date-display {
    font-size: 15px;
    max-width: 220px;
  }
  
  .ytomo-reservation-table-container {
    font-size: 13px;
  }
}

/* 大画面対応のメディアクエリ */
@media (min-width: 1200px) {
  .ytomo-entrance-layout {
    gap: 24px;
  }
  
  .ytomo-entrance-calendar {
    flex: 0 0 320px; /* 大画面ではさらに幅を広げる */
    height: 400px; /* 高さも大幅拡張 */
    
    .ytomo-calendar-body {
      padding: 20px;
    }
    
    .ytomo-calendar-grid .ytomo-calendar-days .ytomo-calendar-day {
      font-size: 13px;
      min-height: 32px;
    }
  }
  
  .ytomo-selected-date-display {
    font-size: 16px;
    padding: 10px 16px;
    max-width: 250px;
  }
  
  .ytomo-reservation-table-container {
    font-size: 14px; /* 大画面ではテーブルフォントを大きく */
  }
}

/* スマホ対応のメディアクエリ */
@media (max-width: 520px) {
  .ytomo-entrance-calendar {
    flex: 0 0 200px; /* スマホでも適度な幅を確保 */
    height: 240px; /* 高さを少し大きく */
    
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
    height: 180px; /* 極小スマホでは更に縮小 */
    
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