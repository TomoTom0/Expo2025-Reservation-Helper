<template>
  <div class="ytomo-pavilion-tab">
    <!-- 検索コントロールエリア -->
    <div class="ytomo-search-controls">
      <div class="ytomo-search-input-container">
        <input 
          type="text" 
          id="pavilion-search-input" 
          placeholder="パビリオン名で検索" 
          class="ytomo-search-input"
          v-model="searchInput"
          @keydown.enter="handlePavilionSearch"
        >
      </div>
      <div class="ytomo-control-buttons">
        <button 
          id="search-button" 
          class="ytomo-icon-button" 
          title="検索"
          @click="handlePavilionSearch"
          :disabled="isLoading"
        >
          <span>🔍</span>
        </button>
        <button 
          id="favorites-button" 
          class="ytomo-icon-button" 
          title="お気に入り"
          @click="handleLoadFavorites"
          :disabled="isLoading"
        >
          <span>⭐</span>
        </button>
        <div class="ytomo-button-separator"></div>
        <button 
          id="filter-button" 
          class="ytomo-icon-button" 
          :class="{ active: isAvailableOnlyFilter }"
          title="空きのみ表示"
          @click="handleToggleAvailableOnlyFilter"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/>
          </svg>
          <span id="available-count" class="ytomo-count-badge">{{ availablePavilionsCount }}</span>
        </button>
        <div class="ytomo-button-separator"></div>
        <button 
          id="refresh-button" 
          class="ytomo-icon-button" 
          title="更新"
          @click="handleRefresh"
          :disabled="isLoading"
        >
          <span>🔄</span>
          <span 
            v-if="allPavilions.length > 0" 
            class="ytomo-count-badge"
          >
            {{ allPavilions.length }}
          </span>
        </button>
      </div>
    </div>


    <!-- パビリオン一覧エリア -->
    <div class="ytomo-pavilion-list" id="pavilion-list-container">
      <div v-if="isLoading" class="ytomo-loading">
        <p>パビリオン情報を読み込み中...</p>
      </div>
      <div v-else-if="allPavilions.length === 0" class="ytomo-empty-state">
        <p>🔍 検索ボタンを押してパビリオンを検索してください</p>
      </div>
      <div v-else>
        <div 
          v-for="pavilion in filteredPavilions" 
          :key="pavilion.id"
          class="ytomo-pavilion-item"
          :data-pavilion-id="pavilion.id"
        >
          <div class="ytomo-pavilion-header">
            <button 
              class="ytomo-star-button"
              :class="{ active: isFavorite(pavilion.id) }"
              @click="toggleFavorite(pavilion)"
            >
              {{ isFavorite(pavilion.id) ? '⭐' : '☆' }}
            </button>
            <span class="ytomo-pavilion-name">{{ pavilion.name }}</span>
            <div class="ytomo-pavilion-status">
              <span 
                v-if="(pavilion.timeSlots?.filter(slot => slot.available).length || 0) > 0"
                class="ytomo-status-available"
              >
                {{ pavilion.timeSlots?.filter(slot => slot.available).length || 0 }}枠
              </span>
              <span 
                v-else
                class="ytomo-status-full"
              >
                満員
              </span>
            </div>
          </div>
          <div class="ytomo-time-slots">
            <button
              v-for="timeSlot in getFilteredTimeSlots(pavilion)"
              :key="`${pavilion.id}-${timeSlot.time}`"
              class="ytomo-time-slot-button"
              :class="getTimeSlotClasses(pavilion.id, timeSlot)"
              :data-pavilion-id="pavilion.id"
              :data-time-slot="timeSlot.time"
              :disabled="isTimeSlotDisabledByEntranceTime(timeSlot)"
              @click="handleTimeSlotClick(pavilion.id, timeSlot)"
            >
              {{ formatTimeSlot(timeSlot.time) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ENDLESSトグルボタン -->
    <button 
      id="endless-toggle-button"
      class="ytomo-endless-toggle"
      :class="{ active: mainDialogStore.endlessMode }"
      title="ENDLESSモード切替"
      @click="mainDialogStore.toggleEndlessMode"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 9.14c-.64-.64-1.49-.99-2.4-.99-1.87 0-3.39 1.51-3.39 3.38s1.52 3.38 3.39 3.38c.91 0 1.76-.35 2.4-.99L12 12.4l1.52 1.52c.64.64 1.49.99 2.4.99 1.87 0 3.39-1.51 3.39-3.38s-1.52-3.38-3.39-3.38c-.9 0-1.76.35-2.4.99l-.96.96-.96-.96c-.64-.64-1.5-.99-2.4-.99z"/>
      </svg>
    </button>

    <!-- 予約実行FABボタン -->
    <button 
      id="reservation-button" 
      class="ytomo-reservation-fab" 
      :disabled="selectedSlotsCount === 0"
      :title="`予約実行 (${selectedSlotsCount}件選択中)`"
      @click="handleReservationExecution"
    >
      📋
      <span 
        v-if="selectedSlotsCount > 0" 
        class="ytomo-count-badge"
      >
        {{ selectedSlotsCount }}
      </span>
    </button>
    
    <!-- ステータスFAB（予約結果表示用） -->
    <button 
      id="status-fab" 
      class="ytomo-status-fab" 
      :class="{ 'ytomo-visible': statusFabVisible }"
    >
      📋
    </button>
    
    <!-- 予約結果表示（非表示） -->
    <div 
      class="ytomo-result-display" 
      id="result-display" 
      :class="{ 'ytomo-visible': resultDisplayVisible }"
    ></div>
    
    <!-- 選択情報表示 -->
    <div class="ytomo-selected-info" id="selected-info">
      <div v-if="selectedSlotsCount > 0" class="ytomo-selection-summary">
        選択中: {{ selectedSlotsCount }}時間帯
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePavilionsStore } from '@/stores/pavilions'
import { useTicketsStore } from '@/stores/tickets'
import { useMainDialogStore } from '@/stores/mainDialog'
import { useOverlaysStore } from '@/stores/overlays'
import { usePavilions } from '@/composables/usePavilions'
import type { ScheduleData, TicketData } from '@/types/api'

// 型定義
interface TimeSlotData {
  time: string
  available: boolean
  status?: string
  reservationType?: string
}

interface PavilionData {
  id: string
  name: string
  timeSlots: TimeSlotData[]
  availableSlots: number
}

// Store アクセス
const pavilionsStore = usePavilionsStore()
const ticketsStore = useTicketsStore()
const mainDialogStore = useMainDialogStore()
const overlaysStore = useOverlaysStore()
const { allPavilions, filteredPavilions, isLoading, isAvailableOnlyFilter, availablePavilionsCount } = storeToRefs(pavilionsStore)

// Composable使用
const { 
  searchPavilions,
  refreshPavilionData,
  loadFavoritePavilions, 
  toggleAvailableOnlyFilter, 
  addToFavorites, 
  removeFromFavorites,
  addSelectedTimeSlot,
  removeSelectedTimeSlot,
  isTimeSlotSelected,
  executeReservation 
} = usePavilions()

// ローカル状態
const searchInput = ref('')
const statusFabVisible = ref(false)
const resultDisplayVisible = ref(false)

// 計算プロパティ
const selectedSlotsCount = computed(() => pavilionsStore.selectedTimeSlotsCount)

// 分散状態管理から選択されたスケジュール一覧を取得
const selectedSchedules = computed(() => {
  const selected: ScheduleData[] = []
  ticketsStore.ticketsArray.forEach((ticket: TicketData) => {
    ticket.schedules?.forEach((schedule: ScheduleData) => {
      if (schedule.selected) {
        selected.push(schedule)
      }
    })
  })
  return selected
})

// 分散状態管理から選択された入場日付を取得
const selectedEntranceDate = computed(() => {
  return selectedSchedules.value.length > 0 ? selectedSchedules.value[0].entrance_date : null
})

// 選択された入場予約のうち、最も遅い入場時刻+10分を取得（HH:MM形式）
const getLatestEntranceTime = (): string => {
  if (selectedSchedules.value.length === 0) {
    console.log('⏰ 選択された入場予約なし')
    return ''
  }
  
  // 各スケジュールの日時文字列を比較可能な形式に変換して最新を取得
  const latest = selectedSchedules.value.reduce((latest, current) => {
    const latestDateTime = `${latest.entrance_date}${latest.time_start || '0000'}`
    const currentDateTime = `${current.entrance_date}${current.time_start || '0000'}`
    return currentDateTime > latestDateTime ? current : latest
  })
  
  
  // time_startをHH:MM形式に変換
  let timeStr = latest.time_start || ''
  
  // 時間に10分を追加
  if (timeStr && timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + 10
    const newHours = Math.floor(totalMinutes / 60)
    const newMinutes = totalMinutes % 60
    const result = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
    return result
  }
  
  return ''
}

// 選択された入場予約のうち、最も遅い入場日時を取得（表示用）
const latestEntranceDateTime = computed(() => {
  if (selectedSchedules.value.length === 0) return ''
  
  // 各スケジュールの日時文字列を比較可能な形式に変換して最新を取得
  const latest = selectedSchedules.value.reduce((latest, current) => {
    const latestDateTime = `${latest.entrance_date}${latest.time_start || '0000'}`
    const currentDateTime = `${current.entrance_date}${current.time_start || '0000'}`
    return currentDateTime > latestDateTime ? current : latest
  })
  
  // 日時を表示形式に変換
  const date = latest.entrance_date
  let timeDisplay = ''
  
  if (latest.schedule_name) {
    // 末尾の「-」を除去
    timeDisplay = latest.schedule_name.replace(/-$/, '')
  } else if (latest.time_start) {
    // HHMMまたはHH:MM形式をHH:MM形式に統一
    const timeStr = latest.time_start.replace(':', '')
    if (timeStr.length === 4) {
      timeDisplay = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`
    } else {
      timeDisplay = latest.time_start
    }
  }
  
  // 日付をMM/DD形式に変換（formatDate()と同じ処理）
  if (date && date.length === 8) {
    const year = date.slice(0, 4)
    const month = date.slice(4, 6)
    const day = date.slice(6, 8)
    const dateObj = new Date(`${year}-${month}-${day}`)
    const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
    return timeDisplay ? `${formattedDate} ${timeDisplay}` : formattedDate
  }
  
  return timeDisplay || date || ''
})

const availableCount = computed(() => {
  return allPavilions.value.reduce((count: number, pavilion: any) => {
    return count + (pavilion.timeSlots?.filter((slot: any) => slot.available).length || 0)
  }, 0)
})

// メソッド
const handlePavilionSearch = async () => {
  try {
    console.log('🔍 パビリオン検索:', searchInput.value)
    showProcessingOverlay('パビリオンを検索中...')
    
    // 選択されたチケットIDsを取得
    const selectedTickets = ticketsStore.ticketsArray.filter(ticket => 
      ticket.schedules?.some(schedule => schedule.selected)
    )
    const ticketIds = selectedTickets.map(t => t.ticket_id)
    
    // 選択された入場日付を取得  
    const entranceDate = selectedEntranceDate.value
    
    // 入場予約から正しいパビリオン予約種類を取得
    const pavilionReservationInfo = ticketsStore.selectedPavilionReservationInfo
    const registeredChannel = pavilionReservationInfo?.activeChannel || '4' // デフォルトはfast
    
    console.log('🎫 検索パラメータ:', { 
      query: searchInput.value.trim(), 
      ticketIds, 
      entranceDate,
      registeredChannel 
    })
    
    // パビリオン検索実行
    const results = await searchPavilions(
      searchInput.value.trim(),
      ticketIds,
      entranceDate || undefined
    )
    
    // 検索直後は空きのみフィルタを自動ON（旧仕様に合わせる）
    if (!isAvailableOnlyFilter.value) {
      toggleAvailableOnlyFilter()
      console.log('📂 検索後に空きのみフィルター自動ON')
    }
    
    console.log(`✅ パビリオン検索完了: ${results.length}件`)
    hideProcessingOverlay()
  } catch (error) {
    console.error('❌ パビリオン検索エラー:', error)
    hideProcessingOverlay()
  }
}

const handleLoadFavorites = async () => {
  try {
    console.log('⭐ お気に入り読み込み')
    showProcessingOverlay('お気に入りを読み込み中...')
    
    // 選択されたチケットIDsを取得
    const selectedTickets = ticketsStore.ticketsArray.filter(ticket => 
      ticket.schedules?.some(schedule => schedule.selected)
    )
    const ticketIds = selectedTickets.map(t => t.ticket_id)
    
    // 選択された入場日付を取得  
    const entranceDate = selectedEntranceDate.value
    
    const results = await loadFavoritePavilions(entranceDate || undefined, ticketIds)
    
    // お気に入り読み込み後はフィルターをOFFにして全て表示
    if (isAvailableOnlyFilter.value) {
      toggleAvailableOnlyFilter()
      console.log('📂 お気に入り読み込み後にフィルターOFF')
    }
    
    console.log(`✅ お気に入り読み込み完了: ${results.length}件`)
    console.log('🔍 現在の表示パビリオン数:', allPavilions.value.length)
    console.log('🔍 お気に入りパビリオン:', results.map(p => p.name))
    
    hideProcessingOverlay()
  } catch (error) {
    console.error('❌ お気に入り読み込みエラー:', error)
    hideProcessingOverlay()
  }
}

const handleToggleAvailableOnlyFilter = () => {
  toggleAvailableOnlyFilter()
  console.log('🔍 空きのみフィルター:', isAvailableOnlyFilter.value ? 'ON' : 'OFF')
}

const handleRefresh = async () => {
  try {
    console.log('🔄 データ更新（選択リセットなし）')
    showProcessingOverlay('パビリオン情報を更新中...')
    
    // 選択されたチケットIDsを取得
    const selectedTickets = ticketsStore.ticketsArray.filter(ticket => 
      ticket.schedules?.some(schedule => schedule.selected)
    )
    const ticketIds = selectedTickets.map(t => t.ticket_id)
    
    // 選択された入場日付を取得  
    const entranceDate = selectedEntranceDate.value
    
    await refreshPavilionData(ticketIds, entranceDate || undefined)
    hideProcessingOverlay()
  } catch (error) {
    console.error('❌ データ更新エラー:', error)
    hideProcessingOverlay()
  }
}

// オーバーレイ制御（ストア連携）
const showProcessingOverlay = (message: string) => {
  overlaysStore.showProcessingOverlay(message)
  console.log(`🛡️ 誤操作防止オーバーレイ表示: ${message}`)
}

const hideProcessingOverlay = () => {
  overlaysStore.hideProcessingOverlay()
  console.log('🛡️ 誤操作防止オーバーレイ非表示')
}

// お気に入り状態をリアクティブに判定
const isFavorite = (pavilionId: string) => {
  return pavilionsStore.favoriteIds.has(pavilionId)
}

const toggleFavorite = (pavilion: any) => {
  if (isFavorite(pavilion.id)) {
    removeFromFavorites(pavilion.id)
    console.log(`⭐ お気に入り削除:`, pavilion.name)
  } else {
    addToFavorites(pavilion.id, pavilion.name)  
    console.log(`⭐ お気に入り追加:`, pavilion.name)
  }
}

const getFilteredTimeSlots = (pavilion: any) => {
  if (!pavilion.timeSlots) return []
  
  // フィルターONの場合は空きのある時間帯のみ表示
  if (isAvailableOnlyFilter.value) {
    return pavilion.timeSlots.filter((slot: TimeSlotData) => slot.available)
  }
  
  // フィルターOFFの場合は全時間帯を表示
  return pavilion.timeSlots
}

const getTimeSlotClasses = (pavilionId: string, timeSlot: TimeSlotData) => {
  const classes = []
  
  if (timeSlot.available) {
    classes.push('available')
  } else {
    classes.push('unavailable', 'full')
  }
  
  // 選択状態をチェック
  if (isTimeSlotSelected(pavilionId, timeSlot.time)) {
    classes.push('selected')
  }
  
  return classes
}

const handleTimeSlotClick = (pavilionId: string, timeSlot: TimeSlotData) => {
  const pavilion = pavilionsStore.pavilions.get(pavilionId)
  if (!pavilion) return

  // 満員時間帯でも選択可能（監視機能のため）
  if (!timeSlot.available) {
    console.log('🔴 満員時間帯クリック（選択）:', { pavilionId, timeSlot })
  } else {
    console.log('🟢 空き時間帯クリック（選択）:', { pavilionId, timeSlot })
  }
  
  // 空き時間帯クリック → 選択状態を切り替え
  const isSelected = isTimeSlotSelected(pavilionId, timeSlot.time)
  
  if (isSelected) {
    // 選択解除
    removeSelectedTimeSlot(pavilionId, timeSlot.time)
    console.log('🟡 時間帯選択解除:', { pavilionName: pavilion.name, timeSlot: timeSlot.time })
  } else {
    // 選択追加
    const selection = {
      pavilionId,
      pavilionName: pavilion.name,
      timeSlot: {
        ...timeSlot,
        selected: true,
        reservationType: timeSlot.reservationType || 'normal'
      },
      entranceDate: selectedEntranceDate.value || ''
    }
    addSelectedTimeSlot(selection)
    console.log('🟢 時間帯選択追加:', { pavilionName: pavilion.name, timeSlot: timeSlot.time })
  }
}

const handleReservationExecution = async () => {
  if (selectedSlotsCount.value === 0) {
    console.log('⚠️ 選択された時間帯なし')
    return
  }
  
  try {
    console.log('📋 予約実行開始:', selectedSlotsCount.value, '件')
    
    // 順次予約オーバーレイを表示
    overlaysStore.showSequentialOverlay(selectedSlotsCount.value)
    
    const selectedSlots = pavilionsStore.selectedTimeSlots
    const entranceDate = selectedEntranceDate.value || ''
    
    // 入場予約から正しいパビリオン予約種類を取得
    const pavilionReservationInfo = ticketsStore.selectedPavilionReservationInfo
    if (!pavilionReservationInfo?.activeChannel) {
      throw new Error('パビリオン予約種類が特定できません')
    }
    const registeredChannel = pavilionReservationInfo.activeChannel
    
    // 選択されたチケットIDsを取得
    const selectedTickets = ticketsStore.ticketsArray.filter(ticket => 
      ticket.schedules?.some(schedule => schedule.selected)
    )
    const ticketIds = selectedTickets.map(t => t.ticket_id)
    
    if (ticketIds.length === 0) {
      throw new Error('チケットが選択されていません')
    }
    
    // 各選択された時間帯に対して予約実行
    const results = []
    for (const selection of selectedSlots) {
      const result = await executeReservation(
        selection.pavilionId,
        selection.timeSlot,
        entranceDate,
        registeredChannel,
        ticketIds
      )
      results.push(result)
    }
    
    // 成功した予約数をカウント
    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount
    
    console.log(`📋 予約実行完了: 成功${successCount}件, 失敗${failureCount}件`)
    
    // 結果詳細をログ出力
    results.forEach(result => {
      if (result.details) {
        console.log(`  ${result.success ? '✅' : '❌'} ${result.details.pavilionName} ${result.details.timeSlot}: ${result.message}`)
      }
    })
    
    hideProcessingOverlay()
    
    // 予約結果をMainFab.vueと同様の形式で発火
    results.forEach(result => {
      if (result.details) {
        const reservationResult = {
          success: result.success,
          reason: result.success ? undefined : result.message,
          pavilionName: result.details.pavilionName || '',
          datetime: `${formatDate(entranceDate)} ${result.details.timeSlot || ''}`
        }
        
        // CustomEventでMainFab.vueに結果を通知
        const event = new CustomEvent('reservation-result', { detail: reservationResult })
        document.dispatchEvent(event)
      }
    })
    
    // 結果メッセージ表示
    if (successCount > 0) {
      statusFabVisible.value = true
      setTimeout(() => { statusFabVisible.value = false }, 5000)
    }
    
  } catch (error) {
    console.error('❌ 予約実行エラー:', error)
    overlaysStore.hideSequentialOverlay()
  }
}

// ヘルパー関数
const formatDate = (dateStr: string | null): string => {
  // YYYYMMDD形式（例：20250826）をパース
  if (dateStr && dateStr.length === 8) {
    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    const date = new Date(`${year}-${month}-${day}`)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
  return dateStr || ''
}

// 入場時刻制約により時間帯がdisabledかどうかを判定
const isTimeSlotDisabledByEntranceTime = (timeSlot: TimeSlotData): boolean => {
  const latestEntranceTime = getLatestEntranceTime()
  if (!latestEntranceTime) return false
  
  // 時間帯の開始時間をHH:MM形式に変換
  const slotStartTime = formatTimeSlot(timeSlot.time)
  if (!slotStartTime) return false
  
  // デバッグログ
  const isDisabled = slotStartTime <= latestEntranceTime
  if (isDisabled) {
    console.log(`⏰ 時間帯disabled: ${slotStartTime} <= ${latestEntranceTime}`)
  }
  
  // 時間比較（HH:MM形式で辞書順比較）
  return isDisabled
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


// ライフサイクル
onMounted(() => {
  console.log('🏛️ PavilionTab mounted')
  // ストア初期化はページ読み込み時に行済み
})

onUnmounted(() => {
  console.log('🗑️ PavilionTab unmounted')
})
</script>

<style scoped lang="scss">
/**
 * パビリオンタブのスタイル定義
 */

.ytomo-pavilion-tab {
    padding: 0 8px 20px 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    color-scheme: light;
}

/* 検索コントロールエリア */
.ytomo-search-controls {
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
    display: flex;
    gap: 12px;
    align-items: center;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
}

.ytomo-search-input-container {
    flex: 1;
}

.ytomo-search-input {
    width: 100%;
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;

    &:focus {
        outline: none;
        border-color: #2c5aa0;
    }

    &::placeholder {
        color: #9ca3af;
    }
}

.ytomo-control-buttons {
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    @media (max-width: 600px) {
        justify-content: center;
    }
}

.ytomo-icon-button {
    width: 40px;
    height: 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 16px;
    position: relative;

    &:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &.active {
        background: #2c5aa0;
        border-color: #2c5aa0;
        color: white;

        &:hover {
            background: #1a365d;
        }
    }
    
    /* カウントバッジ */
    .ytomo-count-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff4444;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: bold;
        min-width: 16px;
        text-align: center;
        line-height: 1.2;
        pointer-events: none;
        z-index: 10;
    }

    &:focus {
        outline: none;
    }

    span {
        display: block;
        line-height: 1;
    }
}

/* パビリオン一覧エリア */
.ytomo-pavilion-list {
    flex: 1;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.ytomo-pavilion-item {
    background: white;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s;
    color: #374151;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: #f8fafc;
    }

    &.hidden {
        display: none;
    }
}

.ytomo-pavilion-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    cursor: pointer;
}

.ytomo-star-button {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 4px;
    border-radius: 4px;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &:hover {
        background: rgba(255, 193, 7, 0.1);
    }

    &.favorite {
        color: #ffc107;
    }

    &:focus {
        outline: none;
    }
}

.ytomo-pavilion-checkbox-container {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.ytomo-pavilion-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.ytomo-pavilion-name {
    flex: 1;
    font-size: 15px;
    font-weight: 500;
    color: #374151;
    line-height: 1.4;
}

.ytomo-pavilion-status {
    display: flex;
    align-items: center;
    gap: 8px;
}

.ytomo-status-available {
    background: #dcfce7;
    color: #166534;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.ytomo-status-full {
    background: #fef2f2;
    color: #991b1b;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.ytomo-expand-button {
    background: none;
    border: none;
    font-size: 12px;
    color: #6b7280;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        background: #f3f4f6;
        color: #374151;
    }

    &.expanded {
        background: #e2e8f0;
        color: #374151;
    }

    &:focus {
        outline: none;
    }
}

/* 時間帯エリア */
.ytomo-time-slots {
    padding: 0 16px 16px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    transition: all 0.3s ease;

    &.hidden {
        display: none;
    }
}

.ytomo-time-slot-button {
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid;
    min-width: 70px;
    text-align: center;
    display: inline-block;
    
    /* 子要素のポインターイベントを無効化してボタン全体をクリック可能にする */
    * {
        pointer-events: none;
    }

    &.available {
        background: #dcfce7;
        border-color: #22c55e;
        color: #166534;

        &:hover {
            background: #bbf7d0;  // 選択より薄い色
            color: #166534;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        &.selected {
            background: #22c55e;  // しっかりとした濃い色
            color: white;
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }
    }

    &.unavailable {
        background: #fef2f2;
        border-color: #ef4444;
        color: #991b1b;
        cursor: pointer;
        opacity: 1;

        &:hover {
            background: #fecaca;  // hover時の色変化
            color: #991b1b;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        &.selected {
            background: #ef4444;  // 選択時の色変化
            color: white;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }
    }

    &.rate-limited {
        background: #f3f4f6;
        border-color: #9ca3af;
        color: #6b7280;
        cursor: not-allowed;
        opacity: 0.6;

        &:hover {
            background: #f3f4f6;
            color: #6b7280;
            transform: none;
            box-shadow: none;
        }

        &:disabled {
            cursor: not-allowed;
            pointer-events: none;
        }
    }

    &:focus {
        outline: none;  // focus囲みを削除
    }

    &.hidden {
        display: none;
    }
}

/* 予約コントロールエリア */
.ytomo-reservation-controls {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
}

.ytomo-selected-info {
    flex: 1;
    font-size: 14px;
    color: #374151;
    font-weight: 500;

    @media (max-width: 600px) {
        text-align: center;
    }
}

.ytomo-reservation-controls .ytomo-button {
    padding: 10px 20px;
    font-weight: 600;
    white-space: nowrap;

    @media (max-width: 600px) {
        width: 100%;
    }
}

/* Cookie設定ボタンを非表示 */
#ot-sdk-btn-floating {
    display: none !important;
}

/* 予約結果表示 */
.ytomo-result-display {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s;
    pointer-events: none;
    max-width: 300px;
    z-index: 10001;
    display: none;  /* デフォルト非表示 */
    
    &.ytomo-visible {
        display: block;
    }

    &.show {
        opacity: 1;
        transform: translateY(0);
    }

    &.success {
        background: #22c55e;
        color: white;
    }

    &.error {
        background: #ef4444;
        color: white;
    }

    &.info {
        background: #3b82f6;
        color: white;
    }

    @media (max-width: 600px) {
        position: static;
        transform: none;
        margin: 8px 0 0 0;
        text-align: center;
    }
}

/* 空の状態・エラー表示 */
.ytomo-pavilion-tab .ytomo-empty-state,
.ytomo-pavilion-tab .ytomo-error {
    padding: 40px 20px;
    text-align: center;
}

.ytomo-pavilion-tab .ytomo-empty-state p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
}

.ytomo-pavilion-tab .ytomo-error p {
    margin: 0;
    color: #dc2626;
    font-size: 14px;
}

/* ローディング表示の調整 */
.ytomo-pavilion-tab .ytomo-loading {
    height: 150px;
}

/* スクロールバーのスタイル */
.ytomo-pavilion-list::-webkit-scrollbar {
    width: 6px;
}

.ytomo-pavilion-list::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.ytomo-pavilion-list::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
        background: #94a3b8;
    }
}

/* 選択入場日表示エリア */
.ytomo-selected-dates-display {
    background: white;
    border-radius: 8px;
    padding: 10px 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
    min-height: 36px;
    display: flex;
    align-items: center;
}

.ytomo-selected-dates-content {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.ytomo-dates-label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    flex-shrink: 0;
}

.ytomo-dates-text {
    font-size: 14px;
    color: #2c5aa0;
    font-weight: 500;
    
    &:empty::before {
        content: "なし";
        color: #9ca3af;
        font-style: italic;
    }
}

/* ステータスFAB（予約結果表示用） */
.ytomo-status-fab {
    position: fixed;
    bottom: 86px;  /* 予約FABの上に配置 */
    right: 20px;
    min-width: 120px;
    min-height: 50px;
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    z-index: 1001;  /* 予約FABより上 */
    display: none;  /* デフォルト非表示 */
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 8px 12px;
    line-height: 1.2;
    
    &.ytomo-visible {
        display: flex;
    }
    
    /* 成功状態 */
    &.success {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
    }
    
    /* エラー状態 */
    &.error {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }
    
    /* 情報状態 */
    &.info {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }
    
    &:active:not(:disabled) {
        transform: translateY(0);
    }
    
    &:focus {
        outline: none;
    }
}

/* 予約実行FABボタン */
.ytomo-reservation-fab {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #2c5aa0 0%, #1a365d 100%);
    border: none;
    border-radius: 28px;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(44, 90, 160, 0.3);
    transition: all 0.3s ease;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;

    .ytomo-count-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff4444;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: bold;
        min-width: 16px;
        text-align: center;
        line-height: 1.2;
        pointer-events: none;
        z-index: 10;
    }

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(44, 90, 160, 0.4);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(44, 90, 160, 0.3);
    }

    &:disabled {
        background: #94a3b8;
        cursor: not-allowed;
        box-shadow: 0 2px 8px rgba(148, 163, 184, 0.3);
        opacity: 0.8;
        display: flex; /* 無効時でも表示を維持 */
    }

    &:focus {
        outline: none;
    }
}

/* ENDLESSトグルボタン */
.ytomo-endless-toggle {
    position: fixed;
    bottom: 96px;
    right: 20px;
    width: 40px;
    height: 32px;
    background: #6b7280;
    border: none;
    border-radius: 16px;
    color: white;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    z-index: 998;
    display: flex;
    align-items: center;
    justify-content: center;

    &.active {
        background: #ff8c00;
        box-shadow: 0 2px 8px rgba(255, 140, 0, 0.4);
    }

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    &:active {
        transform: translateY(0);
    }

    &:focus {
        outline: none;
    }
}

/* ボタン間の縦線セパレータ */
.ytomo-button-separator {
    width: 1px;
    height: 32px;
    background: #d1d5db;
    margin: 0 6px;
    align-self: center;
}

/* アニメーション */
.ytomo-pavilion-item {
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

/* ホバー効果の強化 */
.ytomo-time-slot-button.available:hover {
    animation: pulse 0.6s ease-in-out;
}

@keyframes pulse {
    0% { transform: translateY(-1px); }
    50% { transform: translateY(-2px); }
    100% { transform: translateY(-1px); }
}

/* フォーカス状態の統一 */
.ytomo-pavilion-tab input:focus {
    outline: none;
    border-color: #2c5aa0;
}

.ytomo-pavilion-tab button:focus {
    outline: none;
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
    .ytomo-pavilion-item,
    .ytomo-time-slot-button,
    .ytomo-icon-button,
    .ytomo-result-display,
    .ytomo-time-slots {
        animation: none;
        transition: none;
    }

    .ytomo-time-slot-button.available:hover {
        animation: none;
        transform: none;
    }
}

/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
    .ytomo-pavilion-item {
        border-bottom-width: 2px;
    }

    .ytomo-time-slot-button {
        border-width: 2px;
    }

    .ytomo-icon-button.active {
        border-width: 3px;
    }

    .ytomo-pavilion-tab input:focus,
    .ytomo-pavilion-tab button:focus {
        outline: 3px solid #000;
    }
}

/* 誤操作防止オーバーレイ */
.ytomo-processing-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001; /* メインダイアログより高いが、全画面ブロックは避ける */
    opacity: 0;
    animation: fadeIn 0.2s ease-out forwards;
}

.ytomo-processing-content {
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
    min-width: 300px;
    transform: scale(0.9);
    animation: dialogAppear 0.2s ease-out forwards;
}

.ytomo-processing-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #2c5aa0;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

.ytomo-processing-message {
    margin: 0 0 24px;
    color: #374151;
    font-size: 16px;
    font-weight: 500;
}

.ytomo-cancel-button {
    background: #6b7280;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background: #4b5563;
    }

    &:focus {
        outline: 2px solid #2c5aa0;
        outline-offset: 2px;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
    .ytomo-processing-overlay,
    .ytomo-processing-content,
    .ytomo-processing-spinner {
        animation: none;
        transition: none;
    }
}
</style>