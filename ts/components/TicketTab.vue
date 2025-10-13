<template>
  <div class="ytomo-ticket-tab">
    <!-- チケット簡易選択エリア -->
    <div class="ytomo-quick-select">
      <div class="ytomo-control-left">
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
        
        <button 
          class="ytomo-refresh-button"
          @click="handleRefreshTickets"
          :disabled="isRefreshing"
          title="チケット情報を更新"
        >
          <svg class="ytomo-refresh-icon" :class="{ 'rotating': isRefreshing }" viewBox="0 0 24 24" width="16" height="16">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="ytomo-date-buttons">
        <button 
          v-for="date in availableDates"
          :key="date"
          class="ytomo-date-button"
          :class="{ selected: isDateSelected(date) }"
          :data-date="date"
          @click="handleDateSelection(date)"
          @touchend.prevent="handleDateSelection(date)"
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
          selected: hasSelectedReservations(ticket)
        }"
        :data-ticket-id="ticket.ticket_id"
      >
        <!-- 上半分: チケットID、Tip -->
        <div class="ytomo-ticket-upper">
          <span class="ytomo-ticket-id">{{ ticket.ticket_id }}</span>
          <span 
            :class="ticket.isOwn === false ? 'ytomo-external-tip' : 'ytomo-me-tip'"
          >
            {{ ticket.isOwn === false ? (ticket.label || 'External') : 'Me' }}
          </span>
          <!-- 削除ボタン（自分以外のチケットのみ） -->
          <button 
            v-if="ticket.isOwn === false"
            class="ytomo-ticket-delete-button"
            @click.stop="handleTicketDelete(ticket)"
            title="このチケットを削除"
          >
            ×
          </button>
        </div>
        
        <!-- 下半分: 入場日時ボタン（予約種類も含む） -->
        <div class="ytomo-ticket-lower">
          <div class="ytomo-entrance-dates">
            <!-- 入場予約がない場合 -->
            <span 
              v-if="!ticket.schedules || ticket.schedules.length === 0"
              class="ytomo-no-entrance-dates"
            >
              入場予約取得なし
            </span>
            
            <!-- 利用可能な入場予約がない場合 -->
            <span 
              v-else-if="getVisibleSchedules(ticket).length === 0"
              class="ytomo-no-entrance-dates"
            >
              利用可能な入場予約取得なし
            </span>
            
            <!-- 入場日時ボタンとプラスボタン -->
            <div
              v-else
              v-for="schedule in getVisibleSchedules(ticket)"
              :key="`${schedule.entrance_date}-${schedule.schedule_name}`"
              class="ytomo-entrance-date-group"
            >
              <div class="ytomo-entrance-button-container">
                <!-- 上部: 入場日時表示 -->
                <button
                  class="ytomo-entrance-date-button ytomo-entrance-date-part"
                  :class="{ 
                    disabled: getReservationStatus(schedule, ticket).availableTypes.length === 0,
                    selected: isScheduleSelected(schedule, ticket),
                    'new-reservation': schedule.entrance_date === ''
                  }"
                  :data-date="schedule.entrance_date"
                  :data-use-state="schedule.use_state"
                  :data-available-types="getReservationStatus(schedule, ticket).availableTypes.join(',')"
                  :disabled="getReservationStatus(schedule, ticket).availableTypes.length === 0"
                  @click="handleEntranceDateSelection(schedule, ticket, $event)"
                  @touchend.prevent="handleEntranceDateSelection(schedule, ticket, $event)"
                >
                  <div class="ytomo-schedule-line">
                    {{ schedule.entrance_date === '' ? 'NEW' : formatEntranceDateTimeWithLocation(schedule) }}
                  </div>
                </button>
                
                <!-- 下部: パビリオン予約情報 + プラスボタン機能 -->
                <button 
                  v-if="schedule.entrance_date !== ''"
                  class="ytomo-entrance-date-button ytomo-pavilion-part"
                  :class="{
                    disabled: !ticket.isOwn,
                    expanded: isScheduleExpanded(ticket.ticket_id, schedule)
                  }"
                  :disabled="!ticket.isOwn"
                  @click="handlePavilionReservationAction(schedule, ticket, $event)"
                  @touchend.prevent="handlePavilionReservationAction(schedule, ticket, $event)"
                  :title="!ticket.isOwn ? 'パビリオン予約は自分のチケットのみ操作可能' : 'パビリオン予約詳細・追加'"
                >
                  <div class="ytomo-schedule-line ytomo-reservation-line">
                    <div class="ytomo-reservation-info">
                      <span v-for="reservationType in getReservationTypesForSecondLine(schedule)" :key="reservationType.type"
                            class="ytomo-reservation-type-indicator"
                            :class="reservationType.statusClass">
                        {{ reservationType.shortName }}
                      </span>
                    </div>
                    <span v-if="schedule.user_visiting_reservation_id && getReservationManagement(schedule.user_visiting_reservation_id.toString())?.isLocked" 
                          class="ytomo-lock-indicator">
                      🔒
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- パビリオン予約詳細表示 -->
        <div v-if="hasExpandedSchedules(ticket)" class="ytomo-pavilion-details">
          <div v-for="schedule in getExpandedSchedules(ticket)" :key="`${ticket.ticket_id}-${schedule.entrance_date}`" class="ytomo-schedule-detail">
            <div class="ytomo-schedule-date-header">
              <span class="ytomo-date-text">{{ formatEntranceDate(schedule.entrance_date) }}</span>
              <!-- ロックボタンとラベル表示 -->
              <span v-if="schedule.user_visiting_reservation_id" class="ytomo-date-header-controls">
                <button 
                  class="ytomo-lock-toggle-btn"
                  :class="{ 'locked': getReservationManagement(schedule.user_visiting_reservation_id.toString())?.isLocked }"
                  @click.stop="schedule.user_visiting_reservation_id ? toggleLock(schedule.user_visiting_reservation_id.toString(), ticket.ticket_id) : undefined"
                >
                  {{ getReservationManagement(schedule.user_visiting_reservation_id.toString())?.isLocked ? '🔒' : '🔓' }}
                </button>
                <input 
                  type="text" 
                  class="ytomo-date-header-label-input"
                  placeholder="ラベル"
                  :value="schedule.user_visiting_reservation_id ? getReservationManagement(schedule.user_visiting_reservation_id.toString())?.userLabel || '' : ''"
                  @input="schedule.user_visiting_reservation_id ? updateLabel(schedule.user_visiting_reservation_id.toString(), ($event.target as HTMLInputElement).value, ticket.ticket_id) : undefined"
                  @click.stop
                />
              </span>
            </div>
            
            
            <!-- 予約種類ごとの詳細表示（5,4,3,2の順） -->
            <template v-for="reservationType in getSortedReservationTypes(schedule)" :key="`${ticket.ticket_id}-${schedule.entrance_date}-${reservationType}`">
              <div v-if="schedule.pavilionReservationStatus?.[reservationType]" class="ytomo-pavilion-reservation-group">
                <div class="ytomo-reservation-header">
                  <!-- 左側：予約種類と時間帯 -->
                  <div class="ytomo-reservation-left">
                    <div class="ytomo-reservation-type-badge" :class="getReservationTypeBadgeClass(schedule.pavilionReservationStatus[reservationType])">
                      {{ getReservationTypeName(String(reservationType)) }}
                    </div>
                    <div class="ytomo-time-slot-badge">
                      {{ schedule.pavilionReservationStatus[reservationType]?.winningInfo ? 
                          (formatTimeRange(schedule.pavilionReservationStatus[reservationType].winningInfo.startTime, schedule.pavilionReservationStatus[reservationType].winningInfo.endTime) || schedule.pavilionReservationStatus[reservationType].winningInfo.scheduleName || '時間取得中') : 
                          '—' }}
                    </div>
                  </div>
                  
                  <!-- 右側：パビリオン名または状況 -->
                  <div class="ytomo-reservation-right">
                    <div class="ytomo-pavilion-name" :class="{ 'ytomo-status-text': !schedule.pavilionReservationStatus[reservationType]?.winningInfo }">
                      {{ schedule.pavilionReservationStatus[reservationType]?.winningInfo?.eventName || getStatusText(schedule.pavilionReservationStatus[reservationType]?.periodStatus || 'none', schedule.pavilionReservationStatus[reservationType]?.submissionStatus || 'none') }}
                    </div>
                    <div v-if="schedule.pavilionReservationStatus[reservationType]?.winningInfo?.useState !== undefined" class="ytomo-use-status">
                      {{ getUseStateText(schedule.pavilionReservationStatus[reservationType].winningInfo.useState) }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
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
      
      <!-- 結果表示エリア -->
      <div v-if="addResult" class="ytomo-add-result" :class="{ success: addResult.success, error: !addResult.success }">
        {{ addResult.message }}
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
import { authenticatedFetch } from '@/utils/authManager'
// LocationHelper は location_index プロパティが実装されるまで一時的にコメントアウト
// import { LocationHelper } from '@/modules/entrance-reservation-state-manager'
import { getLongNameFromShortName, getShortNameFromChannel, getAllPavilionReservationTypes } from '@/utils/pavilionReservationMapping'
import { determinePavilionReservationType, getAllPavilionReservationStatus } from '@/utils/pavilionReservationTypes'
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

// 予約ID管理関数
const { getReservationManagement, toggleLock, updateLabel } = ticketsStore

// Composable使用
const { loadAllTickets } = useTickets()

// ローカル状態
const isOwnOnlyToggle = ref(false)
const errorMessage = ref('')
const selectedDateFilter = ref<string | null>(null) // 日付フィルター用の独立した状態
const newTicketId = ref('')
const newTicketLabel = ref('')
const selectedChannel = ref('5')
const addResult = ref<{ success: boolean, message: string } | null>(null)
const expandedSchedules = ref<Set<string>>(new Set())
const isRefreshing = ref(false)


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

    // 自分のチケット: 有効な入場予約または空き枠（NEW）があるもののみ
    if (ticket.isOwn === true) {
      const validSchedules = ticket.schedules?.filter((schedule: ScheduleData) =>
        schedule.isEffective === true || schedule.schedule_name === 'NEW'
      ) || []
      return validSchedules.length > 0
    }

    // 自分以外のチケット: 入場予約がない場合も空白で表示
    return true
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

const handleRefreshTickets = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  logger.info('チケット情報手動更新開始')
  
  try {
    await ticketsStore.loadAllTickets()
    logger.info('チケット情報手動更新完了')
  } catch (error) {
    logger.error('チケット情報更新エラー:', error)
  } finally {
    isRefreshing.value = false
  }
}

const handleDateSelection = (date: string) => {
  logger.debug('日付ボタン選択', { date })
  
  // その日付のすべての有効な予約を取得
  const dateReservations: { reservationId: string, schedule: ScheduleData }[] = []
  ticketsArray.value.forEach((ticket: TicketData) => {
    ticket.schedules?.forEach((schedule: ScheduleData) => {
      if (schedule.entrance_date === date && schedule.isEffective === true) {
        const reservationId = schedule.user_visiting_reservation_id?.toString()
        if (reservationId) {
          dateReservations.push({ reservationId, schedule })
        }
      }
    })
  })
  
  if (dateReservations.length === 0) return
  
  // その日付の予約がすべて選択されている場合は選択解除、そうでなければ全選択
  const allSelected = dateReservations.every(({ reservationId }) => {
    const reservationData = ticketsStore.getReservationManagement(reservationId)
    return !!reservationData?.isSelected
  })
  const newSelectedState = !allSelected
  
  // 新しく選択する場合は、まず他の日付の選択を解除
  if (newSelectedState) {
    const allSelectedReservationIds = ticketsStore.getSelectedReservationIds()
    allSelectedReservationIds.forEach(id => {
      ticketsStore.toggleSelection(id)
    })
  }
  
  // 指定日付の予約の選択状態を更新
  dateReservations.forEach(({ reservationId }) => {
    const reservationData = ticketsStore.getReservationManagement(reservationId)
    if (reservationData) {
      const isCurrentlySelected = reservationData.isSelected
      if (isCurrentlySelected !== newSelectedState) {
        ticketsStore.toggleSelection(reservationId)
      }
    }
  })
  
  logger.info('日付スケジュール操作', { 
    date, 
    操作: newSelectedState ? '全選択' : '全選択解除', 
    件数: dateReservations.length 
  })
}


const handleTicketDelete = (ticket: TicketData) => {
  logger.info('チケット削除', { ticketId: ticket.ticket_id })
  ticketsStore.removeTicket(ticket.ticket_id)
  addResult.value = { success: true, message: `チケット ${ticket.ticket_id} を削除しました` }
  
  // 結果表示を3秒後にクリア
  setTimeout(() => {
    addResult.value = null
  }, 3000)
}

// パビリオン予約アクション処理
const handlePavilionReservationAction = (schedule: ScheduleData, ticket: TicketData, event: Event) => {
  event.stopPropagation()
  
  logger.info('パビリオン予約アクション', {
    ticketId: ticket.ticket_id,
    entranceDate: schedule.entrance_date,
    hasReservations: getReservationTypesForSecondLine(schedule).length > 0
  })
  
  // パビリオン予約がない場合は詳細画面を開く（プラスボタンの役割）
  if (getReservationTypesForSecondLine(schedule).length === 0) {
    // パビリオン詳細を展開する
    toggleScheduleExpansion(ticket.ticket_id, schedule)
  } else {
    // 既存予約がある場合も詳細を表示
    toggleScheduleExpansion(ticket.ticket_id, schedule)
  }
}

const handleEntranceDateSelection = (schedule: ScheduleData, ticket: TicketData, event: Event) => {
  event.stopPropagation()
  const target = event.target as HTMLButtonElement

  // 当日予約のデバッグ情報を出力
  logger.temp('入場予約選択デバッグ', {
    ticketId: ticket.ticket_id,
    schedule: schedule,
    use_state: schedule.use_state,
    entrance_date: schedule.entrance_date,
    user_visiting_reservation_id: schedule.user_visiting_reservation_id,
    isDisabled: target.disabled,
    reservationStatus: getReservationStatus(schedule, ticket)
  })

  if (target.disabled) {
    logger.warn('ボタンが無効化されているため処理をスキップ', { ticketId: ticket.ticket_id, schedule })
    return
  }

  const date = schedule.entrance_date
  const reservationId = schedule.user_visiting_reservation_id?.toString()

  // 新規予約枠の場合は特別なIDを生成
  const effectiveReservationId = (reservationId && schedule.entrance_date !== '') ? reservationId : `new-reservation-${ticket.ticket_id}`

  if (!reservationId && schedule.entrance_date !== '') {
    logger.warn('予約IDが存在しません', { ticketId: ticket.ticket_id, schedule })
    return
  }
  
  logger.info('入場日時選択', {
    ticketId: ticket.ticket_id,
    reservationId: effectiveReservationId,
    date: date,
    scheduleName: schedule.schedule_name,
    isNewReservation: schedule.entrance_date === ''
  })

  let reservationData = ticketsStore.getReservationManagement(effectiveReservationId)

  // reservationManagementに存在しない場合は管理データを初期化
  if (!reservationData) {
    ticketsStore.setReservationManagement(effectiveReservationId, {
      ticketId: ticket.ticket_id,
      entranceDate: schedule.entrance_date,
      reservationType: schedule.reservation_type,
      isSelected: false,
      isLocked: false,
      userLabel: schedule.entrance_date === '' ? '新規入場予約' : '',
      isNewReservationSlot: schedule.entrance_date === '' // 新規予約枠フラグ
    })
    reservationData = ticketsStore.getReservationManagement(effectiveReservationId)
    logger.info('予約ID管理データを初期化', {
      reservationId: effectiveReservationId,
      ticketId: ticket.ticket_id,
      isNewReservation: schedule.entrance_date === ''
    })
  }

  const isCurrentlySelected = !!reservationData?.isSelected
  
  // 入場日付は常に一つに限定される: 他の予約の選択を解除
  if (!isCurrentlySelected) {
    // 全ての予約の選択を解除
    const allReservationIds = ticketsStore.getSelectedReservationIds()
    allReservationIds.forEach(id => {
      ticketsStore.toggleSelection(id)
    })
  }
  
  // この予約の選択状態をトグル
  ticketsStore.toggleSelection(effectiveReservationId)

  logger.info('入場日時状態変更', {
    reservationId: effectiveReservationId,
    date,
    scheduleName: schedule.schedule_name || '',
    状態: !isCurrentlySelected ? '選択' : '選択解除',
    isNewReservation: schedule.entrance_date === ''
  })
}

const handleAddTicket = async () => {
  if (!newTicketId.value.trim()) return
  
  const ticketId = newTicketId.value.trim()
  const label = newTicketLabel.value.trim() || '外部チケット'
  const channel = selectedChannel.value
  
  logger.info('チケット追加', { id: ticketId, label, channel })
  
  // 成否に関わらず外部チケットをstoreに追加
  const externalTicket: TicketData = {
    ticket_id: ticketId,
    schedules: [],
    isOwn: false,
    label: label
  }
  
  ticketsStore.addTicket(externalTicket)
  
  // API呼び出しを試行（成否は結果表示のみに使用）
  try {
    const response = await authenticatedFetch(`/api/d/proxy_tickets/${ticketId}/add_check?registered_channel=${channel}`)
    
    if (response.ok) {
      const data = await response.json()
      // API成功時は入場予約データで更新
      if (data.schedules && data.schedules.length > 0) {
        const updatedTicket: TicketData = {
          ...externalTicket,
          schedules: data.schedules.map((s: any) => ({
            ...s,
            isEffective: true,
            selected: false
          }))
        }
        ticketsStore.addTicket(updatedTicket)
      }
      addResult.value = { success: true, message: `チケット ${ticketId} を追加しました` }
    } else {
      addResult.value = { success: false, message: `API呼び出し失敗 (${response.status})` }
    }
  } catch (error) {
    addResult.value = { success: false, message: `API接続エラー: ${error}` }
  }
  
  // 入力値をクリア
  newTicketId.value = ''
  newTicketLabel.value = ''
  selectedChannel.value = '5'
  
  // 結果表示を3秒後にクリア
  setTimeout(() => {
    addResult.value = null
  }, 3000)
}



const retryLoad = async () => {
  await loadAllTickets()
}

const getScheduleKey = (ticketId: string, schedule: ScheduleData): string => {
  return `${ticketId}-${schedule.entrance_date}-${schedule.schedule_name || schedule.time_start || ''}`
}

const toggleScheduleExpansion = (ticketId: string, schedule: ScheduleData) => {
  const key = getScheduleKey(ticketId, schedule)
  
  // 同じチケット内の他の展開された入場予約を閉じる
  const keysToRemove = Array.from(expandedSchedules.value).filter(existingKey => 
    existingKey.startsWith(`${ticketId}-`) && existingKey !== key
  )
  keysToRemove.forEach(keyToRemove => expandedSchedules.value.delete(keyToRemove))
  
  // 現在のスケジュールの展開状態を切り替え
  if (expandedSchedules.value.has(key)) {
    expandedSchedules.value.delete(key)
  } else {
    expandedSchedules.value.add(key)
  }
  
  logger.info('入場予約詳細表示切り替え', { ticketId, schedule: schedule.entrance_date, expanded: expandedSchedules.value.has(key) })
}

const isScheduleExpanded = (ticketId: string, schedule: ScheduleData): boolean => {
  const key = getScheduleKey(ticketId, schedule)
  return expandedSchedules.value.has(key)
}

const hasExpandedSchedules = (ticket: TicketData): boolean => {
  const schedules = getVisibleSchedules(ticket)
  return schedules.some(schedule => isScheduleExpanded(ticket.ticket_id, schedule))
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
  if (!Array.isArray(ticket.schedules)) {
    logger.debug('getVisibleSchedules: schedulesが配列でない', { ticketId: ticket.ticket_id, schedules: ticket.schedules })
    return []
  }

  // 有効なスケジュールをフィルター
  const filtered = ticket.schedules.filter(schedule => schedule.isEffective === true)

  return filtered.sort((a, b) => {
      // 日付順でソート
      const dateA = a.entrance_date
      const dateB = b.entrance_date
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB)
      }
      // 同じ日付の場合は時間順
      const timeA = a.time_start || a.schedule_name || ''
      const timeB = b.time_start || b.schedule_name || ''
      return timeA.localeCompare(timeB)
    })
}

const extractTimeFromSchedule = (schedule: ScheduleData): string => {
  // 既存実装のextractTimeFromScheduleメソッドを移植
  return schedule.schedule_name || ''
}

const getReservationStatus = (schedule: ScheduleData, ticket: TicketData): ReservationStatus => {
  // 新規入場予約の場合（entrance_dateが空）
  if (schedule.entrance_date === '') {
    return {
      statusText: 'NEW',
      availableTypes: ['select']
    }
  }
  
  // 既存の入場予約がある場合
  if (ticket.isOwn) {
    const canChange = schedule.use_state === 0 ||
                     (schedule.use_state === 1 && schedule.entrance_date === getTodayString())

    // ロック状態をチェック（表示のみ、選択は常に可能）
    const reservationId = schedule.user_visiting_reservation_id?.toString()
    let statusText = canChange ? '変更可能' : '変更不可'
    if (reservationId) {
      const reservationData = ticketsStore.getReservationManagement(reservationId)
      if (reservationData?.isLocked) {
        statusText = 'ロック中'
      }
    }

    // 選択は常に可能（自分のチケットであれば）
    return {
      statusText,
      availableTypes: ['select'] // 選択は常に可能
    }
  }
  
  // 他人の予約でも選択は可能（表示のみ変更不可）
  return {
    statusText: '他人の予約',
    availableTypes: ['select']
  }
}

// 今日の日付を YYYY-MM-DD 形式で取得
const getTodayString = (): string => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

const isScheduleSelected = (schedule: ScheduleData, ticket: TicketData): boolean => {
  // 予約管理の選択状態を確認
  const reservationId = schedule.user_visiting_reservation_id?.toString()
  // 新規予約枠の場合は特別なIDを生成（handleEntranceDateSelectionと同じロジック）
  const effectiveReservationId = (reservationId && schedule.entrance_date !== '') ? reservationId : `new-reservation-${ticket.ticket_id}`

  const reservationData = ticketsStore.getReservationManagement(effectiveReservationId)
  const isSelected = !!reservationData?.isSelected

  // 空き枠の選択状態をデバッグ
  if (schedule.entrance_date === '') {
    logger.temp('空き枠選択状態確認', {
      ticketId: ticket.ticket_id,
      reservationId,
      effectiveReservationId,
      reservationData,
      isSelected
    })
  }

  return isSelected
}

const hasSelectedReservations = (ticket: TicketData): boolean => {
  // このチケットに関連する予約で選択されているものがあるかチェック
  if (!ticket.schedules || ticket.schedules.length === 0) return false
  
  return ticket.schedules.some(schedule => {
    const reservationId = schedule.user_visiting_reservation_id?.toString()
    if (!reservationId) return false
    
    const reservationData = ticketsStore.getReservationManagement(reservationId)
    return !!reservationData?.isSelected
  })
}

const isDateSelected = (date: string): boolean => {
  // その日付の有効な予約をすべて取得
  const dateReservations: string[] = []
  ticketsArray.value.forEach((ticket: TicketData) => {
    ticket.schedules?.forEach((schedule: ScheduleData) => {
      if (schedule.entrance_date === date && schedule.isEffective === true) {
        const reservationId = schedule.user_visiting_reservation_id?.toString()
        if (reservationId) {
          dateReservations.push(reservationId)
        }
      }
    })
  })
  
  // すべての予約が選択されている場合のみtrueを返す
  return dateReservations.length > 0 && dateReservations.every(reservationId => {
    const reservationData = ticketsStore.getReservationManagement(reservationId)
    return !!reservationData?.isSelected
  })
}

// 展開されたスケジュールを取得
const getExpandedSchedules = (ticket: TicketData): ScheduleData[] => {
  if (!ticket.schedules) return []
  return ticket.schedules.filter(schedule => {
    const key = getScheduleKey(ticket.ticket_id, schedule)
    return expandedSchedules.value.has(key)
  })
}

// パビリオン予約関連ヘルパーメソッド（共通関数使用）
const getReservationTypeName = (type: string): string => {
  return getLongNameFromShortName(type)
}

const getPeriodStatusText = (status: string): string => {
  switch (status) {
    case 'before': return '受付前'
    case 'active': return '受付中'
    case 'expired': return '期限切れ'
    default: return status
  }
}

const getSubmissionStatusText = (status: string): string => {
  switch (status) {
    case 'none': return '未申請'
    case 'submitted': return '申請済み'
    case 'won': return '当選'
    default: return status
  }
}

const getUseStateText = (useState: number): string => {
  switch (useState) {
    case 0: return '未使用'
    case 1: return '使用済み'
    case 2: return '期限切れ'
    default: return `状態${useState}`
  }
}

const formatTimeRange = (startTime?: string, endTime?: string): string => {
  if (!startTime) return ''
  if (!endTime) return startTime
  return `${startTime}～${endTime}`
}

const formatEntranceDate = (dateStr: string): string => {
  if (dateStr && dateStr.length === 8) {
    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    return `${year}/${month}/${day}`
  }
  return dateStr
}

// 入場日時表示を東・西付きに修正
const formatEntranceDateTimeWithLocation = (schedule: ScheduleData): string => {
  const date = formatDate(schedule.entrance_date)
  const time = (schedule.schedule_name || extractTimeFromSchedule(schedule)).replace(/-$/, '')
  
  // location_indexから東西を判定 (0:東, 1:西)
  const locationText = schedule.location_index === 1 ? '西' : '東'
  
  return `${date} ${locationText} ${time}`
}

const getStatusText = (periodStatus: string, submissionStatus: string): string => {
  const periodText = getPeriodStatusText(periodStatus)
  const submissionText = getSubmissionStatusText(submissionStatus)
  
  // 「未申請」の場合は期間ステータスのみを表示
  if (submissionStatus === 'none') {
    return periodText
  }
  
  return `${periodText}・${submissionText}`
}

// 予約種類を5,4,3,2の順（チャネル順）で並び替え（共通関数使用）
const getSortedReservationTypes = (schedule: ScheduleData): string[] => {
  if (!schedule.pavilionReservationStatus) return []
  
  // チャネル順（5,4,3,2）に対応するshortNameを取得
  const allTypes = getAllPavilionReservationTypes()
  const sortedTypes = allTypes
    .sort((a, b) => parseInt(b.channel) - parseInt(a.channel)) // 5,4,3,2の順
    .map(type => type.shortName)
  
  return sortedTypes.filter(type => schedule.pavilionReservationStatus?.[type])
}

// 予約種類バッジのクラス（優先度順：当選>期限切れ>開始前>提出>未提出）
const getReservationTypeBadgeClass = (reservationStatus: any): string => {
  if (!reservationStatus) return 'badge-none'
  
  if (reservationStatus.submissionStatus === 'won') return 'badge-won'
  if (reservationStatus.periodStatus === 'expired') return 'badge-expired'
  if (reservationStatus.periodStatus === 'active') return 'badge-active'
  if (reservationStatus.periodStatus === 'before') return 'badge-before'
  if (reservationStatus.submissionStatus === 'submitted') return 'badge-submitted'
  return 'badge-none'
}

// 入場予約2行目用の予約種類一覧（共通関数使用）
const getReservationTypesForSecondLine = (schedule: ScheduleData) => {
  // pavilionReservationStatusがない場合は入場日付から計算
  if (!schedule.pavilionReservationStatus && schedule.entrance_date) {
    const allTypes = getAllPavilionReservationTypes()
    const sortedTypes = allTypes
      .sort((a, b) => parseInt(b.channel) - parseInt(a.channel)) // 5,4,3,2の順
      .map(type => type.shortName)
    
    // パビリオン予約期間判定を実行
    const allStatus = getAllPavilionReservationStatus(schedule.entrance_date)
    
    // 当選・受付中・開始前を判定
    const wonOrActive = sortedTypes.filter(type => {
      const status = allStatus[type]
      return status && (status.submissionStatus === 'won' || status.periodStatus === 'active')
    })
    
    const result = wonOrActive.length > 0 ? wonOrActive : 
      sortedTypes.filter(type => {
        const status = allStatus[type]
        return status && status.periodStatus === 'before'
      }).slice(-1)
    
    const displayNames = { '1': '当', '3': '3', '週': '週', '月': '月' }
    return result.map(type => ({
      type,
      shortName: displayNames[type as keyof typeof displayNames] || type,
      statusClass: getSecondLineStatusClassFromPeriod(allStatus[type]?.periodStatus || 'none', allStatus[type]?.submissionStatus || 'none')
    }))
  }
  
  if (!schedule.pavilionReservationStatus) return []
  
  // チャネル順（5,4,3,2）に対応するshortNameを取得
  const allTypes = getAllPavilionReservationTypes()
  const sortedTypes = allTypes
    .sort((a, b) => parseInt(b.channel) - parseInt(a.channel)) // 5,4,3,2の順
    .map(type => type.shortName)
  
  // 2行目表示用の短縮名マッピング
  const displayNames = { '1': '当', '3': '3', '週': '週', '月': '月' }
  
  // まず当選と受付中を抽出
  const wonOrActive = sortedTypes.filter(type => {
    const status = schedule.pavilionReservationStatus?.[type]
    return status && (status.submissionStatus === 'won' || status.periodStatus === 'active')
  })
  
  // 当選・受付中がない場合のみ、開始前の最後の1つを表示
  const result = wonOrActive.length > 0 ? wonOrActive : 
    sortedTypes.filter(type => {
      const status = schedule.pavilionReservationStatus?.[type]
      return status && status.periodStatus === 'before'
    }).slice(-1) // 開始前は最後の1つだけ
    
  return result
    .map(type => ({
      type,
      shortName: displayNames[type as keyof typeof displayNames] || type,
      statusClass: getSecondLineStatusClass(schedule.pavilionReservationStatus![type])
    }))
}

// 2行目の予約種類表示用スタイルクラス
const getSecondLineStatusClass = (reservationStatus: any): string => {
  if (!reservationStatus) return 'indicator-none'
  
  if (reservationStatus.submissionStatus === 'won') return 'indicator-won'
  if (reservationStatus.periodStatus === 'active') return 'indicator-active'
  if (reservationStatus.periodStatus === 'before') return 'indicator-before'
  return 'indicator-none'
}

// 期間と提出状況から2行目スタイルクラスを取得（外部チケット用）
const getSecondLineStatusClassFromPeriod = (periodStatus: string, submissionStatus: string): string => {
  if (submissionStatus === 'won') return 'indicator-won'
  if (periodStatus === 'active') return 'indicator-active'
  if (periodStatus === 'before') return 'indicator-before'
  return 'indicator-none'
}

// ライフサイクル
onMounted(async () => {
  logger.info('TicketTab mounted', {
    現在のチケット数: ticketsArray.value.length,
    ticketsArrayサイズ: ticketsArray.value.length,
    filteredTicketsサイズ: filteredTickets.value.length,
    設定: {}
  })

  // チケットタブ初期化時の時間経過判定
  try {
    await ticketsStore.refreshOnTabActivation()
    logger.info('TicketTab初期化時リフレッシュ完了')
  } catch (error) {
    logger.error('TicketTab初期化時リフレッシュエラー', error)
  }
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
    
    .ytomo-control-left {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-right: auto;
    }
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.ytomo-refresh-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    color: #475569;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
        background: #e2e8f0;
        border-color: #94a3b8;
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: #f1f5f9;
    }
}

.ytomo-refresh-icon {
    flex-shrink: 0;
    
    &.rotating {
        animation: spin 1s linear infinite;
    }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    
    // モバイルでのタッチ操作改善
    & {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        -webkit-touch-callout: none;
    }
    
    @media (pointer: coarse) {
        min-height: 44px;
        padding: 8px 12px;
        -webkit-tap-highlight-color: rgba(44, 90, 160, 0.3);
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
}

.ytomo-ticket-item:first-of-type {
    margin-top: 12px;
}

.hidden {
    display: none;
}

.ytomo-ticket-item {
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

.ytomo-ticket-delete-button {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    transition: all 0.2s ease;
}

.ytomo-ticket-delete-button:hover {
    background: #dc2626;
    transform: scale(1.1);
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

/* 追加結果表示 */
.ytomo-add-result {
    margin-top: 8px;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    
    &.success {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #22c55e;
    }
    
    &.error {
        background: #fee2e2;
        color: #dc2626;
        border: 1px solid #ef4444;
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
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    background: white;
    cursor: pointer;
    width: 80px;
    min-width: 80px;
    
    &:focus {
        outline: none;
        border-color: #2c5aa0;
        box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.1);
    }
    
    &:hover {
        border-color: #9ca3af;
        background-color: #f9fafb;
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
}

// 入場ボタンコンテナ（上下分割）
.ytomo-entrance-button-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.ytomo-entrance-date-part {
  border-radius: 0 !important;
  border: none !important;
  border-bottom: 1px solid #e5e7eb !important;
  margin: 0 !important;
  
  &.new-reservation {
    background: #f0f9ff;
    color: #0369a1;
    font-weight: 600;
    
    &:hover {
      background: #e0f2fe;
    }
  }
}

.ytomo-pavilion-part {
  border-radius: 0 !important;
  border: none !important;
  margin: 0 !important;
  background: #fafafa;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
  }
  
  // 展開状態での色変化
  &.expanded {
    background: #e5e7eb; // 濃いグレー
    
    &:hover {
      background: #d1d5db; // ホバー時のより濃いグレー
    }
  }
  
  .ytomo-no-reservation {
    color: #059669;
    font-weight: 500;
  }
}

// 予約種類インジケーター（入場予約2行目）
.ytomo-reservation-type-indicator {
    display: inline-block;
    width: 16px;
    height: 13px;
    font-size: 10px;
    font-weight: 400;
    text-align: center;
    line-height: 13px;
    border-radius: 3px;
    border: 1px solid transparent;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    
    &.indicator-won {
        background: #10b981;
        color: white;
        border-color: #059669;
    }
    
    &.indicator-active {
        background: #10b981;
        color: white;
        border-color: #059669;
    }
    
    &.indicator-before {
        background: #6b7280;
        color: white;
        border-color: #4b5563;
    }
    
    &.indicator-none {
        background: #e5e7eb;
        color: #6b7280;
        border-color: #d1d5db;
    }
}

.ytomo-no-reservation {
    font-style: italic;
    color: #9ca3af;
}

.ytomo-entrance-date-button {

    &.selected {
        background: #0284c7;
        color: white;
        border-color: #0284c7;

        .ytomo-reservation-status {
            background: rgba(255, 255, 255, 0.95);
            color: #0891b2;

            &:empty {
                background: transparent;
            }
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

/* 2行表示スタイル */
.ytomo-entrance-date-button {
    .ytomo-schedule-line {
        padding: 2px 0;
        font-size: 11px;
        line-height: 1.2;
        
        &.ytomo-reservation-line {
            color: #6b7280;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 10px;
            
            .ytomo-reservation-info {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .ytomo-lock-indicator {
                font-size: 11px;
                color: #dc2626;
                opacity: 0.8;
                margin-left: 8px;
                flex-shrink: 0;
            }
        }
    }
    
    .ytomo-schedule-divider {
        height: 1px;
        background: #d1d5db;
        margin: 3px 0;
        width: 100%;
        opacity: 0.8;
    }
    
    &.selected {
        .ytomo-schedule-line.ytomo-reservation-line {
            color: rgba(255, 255, 255, 0.8);
        }
        
        .ytomo-schedule-divider {
            background: rgba(255, 255, 255, 0.4);
        }
    }
}

/* 入場日時ボタンとプラスボタンのグループ */
.ytomo-entrance-date-group {
    display: flex;
    gap: 6px;
    align-items: stretch;
}

/* プラスボタン */
.ytomo-expand-button {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    color: #374151;
    font-size: 12px;
    font-weight: 600;
    padding: 3px 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    min-width: 24px;
    
    &:disabled {
        background: #f3f4f6;
        border-color: #d1d5db;
        color: #9ca3af;
        cursor: not-allowed;
        opacity: 0.5;
    }
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: flex-end;
    
    &:hover {
        background: #e2e8f0;
        border-color: #94a3b8;
        transform: translateY(-1px);
    }
    
    &:active {
        transform: translateY(0);
    }
    
    &:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(44, 90, 160, 0.2);
    }
}

/* パビリオン予約詳細 */
.ytomo-pavilion-details {
    margin-top: 12px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
}

.ytomo-schedule-detail {
    margin-bottom: 16px;
    
    &:last-child {
        margin-bottom: 0;
    }
}

.ytomo-schedule-date-header {
    font-weight: 600;
    color: #334155;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .ytomo-date-text {
        flex: 1;
    }
    
    .ytomo-date-header-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 12px;
    }
    
    .ytomo-lock-toggle-btn {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 4px;
        padding: 4px 6px;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 20px;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        
        &:hover {
            background: rgba(255, 255, 255, 1);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        &.locked {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
            color: #dc2626;
            
            &:hover {
                background: rgba(239, 68, 68, 0.15);
            }
        }
    }
    
    .ytomo-date-header-label-input {
        font-size: 11px;
        color: #374151;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 3px;
        padding: 2px 6px;
        width: 80px;
        height: 20px;
        transition: all 0.2s ease;
        
        &:focus {
            outline: none;
            background: rgba(255, 255, 255, 1);
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
        }
        
        &::placeholder {
            color: #9ca3af;
            font-size: 10px;
        }
    }
    font-size: 13px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e2e8f0;
}

.ytomo-pavilion-reservation-group {
    margin-bottom: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
    
    &:last-child {
        margin-bottom: 0;
        border-bottom: none;
    }
}

.ytomo-reservation-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.ytomo-reservation-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 80px;
    flex-shrink: 0;
}

.ytomo-reservation-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ytomo-reservation-type-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    text-align: center;
    
    // 優先度順の背景色
    &.badge-won {
        background: #10b981;
        color: white;
    }
    
    &.badge-expired {
        background: #ef4444;
        color: white;
    }
    
    &.badge-active {
        background: #10b981;
        color: white;
    }
    
    &.badge-before {
        background: #f59e0b;
        color: white;
    }
    
    &.badge-submitted {
        background: #8b5cf6;
        color: white;
    }
    
    &.badge-none {
        background: #6b7280;
        color: white;
    }
}

.ytomo-time-slot-badge {
    background: #f8fafc;
    color: #475569;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 500;
    text-align: center;
    border: 1px solid #e2e8f0;
    
    &:empty::after {
        content: '—';
    }
}

.ytomo-pavilion-name {
    font-weight: 600;
    color: #334155;
    font-size: 13px;
    line-height: 1.3;
    
    &.ytomo-status-text {
        color: #6b7280;
        font-style: italic;
        font-weight: 500;
    }
}

.ytomo-use-status {
    color: #475569;
    font-size: 11px;
    font-weight: 500;
}

.ytomo-reservation-type-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 80px;
    flex-shrink: 0;
}

.ytomo-reservation-type-badge {
    background: #3b82f6;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    line-height: 1.2;
}

.ytomo-time-slot-badge {
    background: #2c5aa0;
    color: white;
    padding: 3px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
}

.ytomo-pavilion-info {
    flex: 1;
    color: #374151;
    font-size: 12px;
    line-height: 1.4;
    display: flex;
    align-items: center;
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

/* 重複したスタイル定義を削除（上部で定義済み） */

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

/* 予約管理UI */
.ytomo-reservation-management {
    margin: 8px 0;
    padding: 8px;
    background: #f0f9ff;
    border-radius: 6px;
    border-left: 3px solid #0ea5e9;
}

.ytomo-management-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.ytomo-lock-checkbox {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 13px;
    color: #374151;
    
    input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
    }
}

.ytomo-lock-icon {
    font-size: 14px;
}

.ytomo-lock-text {
    font-weight: 500;
}

.ytomo-user-label-input {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 13px;
    min-width: 120px;
    max-width: 200px;
    
    &:focus {
        outline: none;
        border-color: #0ea5e9;
        box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
    }
    
    &::placeholder {
        color: #9ca3af;
    }
}

/* ロック状態の視覚的フィードバック */
.ytomo-lock-checkbox input[type="checkbox"]:checked + .ytomo-lock-icon {
    color: #dc2626;
}

.ytomo-lock-checkbox input[type="checkbox"]:checked ~ .ytomo-lock-text {
    color: #dc2626;
    font-weight: 600;
}
</style>