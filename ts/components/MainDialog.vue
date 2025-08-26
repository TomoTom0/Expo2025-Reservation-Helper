<template>
  <div 
    v-if="isVisible" 
    class="ytomo-dialog-overlay" 
    id="ytomo-main-dialog"
    @click="handleOverlayClick"
  >
    <div class="ytomo-dialog ytomo-main-dialog" @click.stop>
      <div class="ytomo-dialog-body">
        <div class="ytomo-tab-navigation">
          <button 
            class="ytomo-tab-button"
            :class="{ active: activeTab === 'ticket' }"
            @click="setActiveTab('ticket')"
            data-tab="ticket"
          >
            <div class="ytomo-tab-content">
              <div class="ytomo-tab-title">チケット<span class="ytomo-tab-count" id="ticket-count">{{ selectedTicketCount }}</span></div>
              <div class="ytomo-pavilion-reservation-info" v-if="pavilionReservationInfo">
                {{ pavilionReservationDisplayText }}
              </div>
            </div>
          </button>
          <button 
            class="ytomo-tab-button"
            :class="{ active: activeTab === 'pavilion' }"
            @click="setActiveTab('pavilion')"
            data-tab="pavilion"
          >
            <div class="ytomo-tab-content">
              <div class="ytomo-tab-title">パビリオン</div>
              <div class="ytomo-tab-dates" id="pavilion-tab-dates">
                <div v-if="latestEntranceDateTime" class="ytomo-latest-time">{{ latestEntranceDateTime }}</div>
              </div>
            </div>
          </button>
          <button class="ytomo-tab-button" data-tab="third">
          </button>
          <button 
            class="ytomo-dialog-close" 
            aria-label="閉じる"
            @click="hideDialog"
          >
            ×
          </button>
        </div>
        <div class="ytomo-tab-content">
          <div 
            class="ytomo-tab-pane"
            :class="{ active: activeTab === 'ticket' }"
            id="ticket-tab"
          >
            <TicketTab />
          </div>
          <div 
            class="ytomo-tab-pane"
            :class="{ active: activeTab === 'pavilion' }"
            id="pavilion-tab"
          >
            <PavilionTab />
          </div>
          <div class="ytomo-tab-pane" id="third-tab">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainDialogStore } from '@/stores/mainDialog'
import { useTicketsStore } from '@/stores/tickets'
import { usePavilionsStore } from '@/stores/pavilions'
import { useTickets } from '@/composables/useTickets'
import type { ScheduleData, TicketData } from '@/types/api'
import { getLongNameFromShortName } from '@/utils/pavilionReservationMapping'
import TicketTab from './TicketTab.vue'
import PavilionTab from './PavilionTab.vue'

const mainDialogStore = useMainDialogStore()
const ticketsStore = useTicketsStore()
const pavilionsStore = usePavilionsStore()

// ストアの状態を取得（リアクティビティ保持）
const { isVisible, activeTab, version } = storeToRefs(mainDialogStore)
const { hideDialog, setActiveTab } = mainDialogStore

// チケット関連の状態
const selectedTicketCount = computed(() => ticketsStore.selectedTicketCount)

// パビリオン予約情報
const pavilionReservationInfo = computed(() => ticketsStore.selectedPavilionReservationInfo)

// パビリオン予約情報の表示テキスト
const pavilionReservationDisplayText = computed(() => {
  const info = pavilionReservationInfo.value
  if (!info) return ''
  
  // 現在有効な予約種類を特定
  const activeEntry = Object.entries(info.allStatus || {})
    .find(([type, status]) => status.periodStatus === 'active')
  
  if (activeEntry) {
    const [type, status] = activeEntry
    const longName = getLongNameFromShortName(type)
    return `${longName} 有効`
  }
  
  // 有効な期間がない場合、次の期間を探す
  const nextEntry = Object.entries(info.allStatus || {})
    .find(([type, status]) => status.periodStatus === 'before')
  
  if (nextEntry) {
    const [type, status] = nextEntry
    const longName = getLongNameFromShortName(type)
    return `${longName} 期間前`
  }
  
  return ''
})

// 選択されたスケジュール一覧を取得
const selectedSchedules = computed(() => {
  const selected: ScheduleData[] = []
  ticketsStore.allTickets.forEach((ticket: TicketData) => {
    ticket.schedules?.forEach((schedule: ScheduleData) => {
      if (schedule.selected) {
        selected.push(schedule)
      }
    })
  })
  return selected
})


// 選択された入場予約のうち、最も遅い入場日時を取得
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

// オーバーレイクリックでダイアログを閉じる
const handleOverlayClick = (e: Event) => {
  if (e.target === e.currentTarget) {
    hideDialog()
  }
}

// Escキーでダイアログを閉じる
const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isVisible) {
    hideDialog()
  }
}

// カスタムイベントハンドラー
const handleShowEvent = async () => {
  console.log('🎯 main-dialog-showイベント受信')
  mainDialogStore.showDialog()
  
  // 事前読み込み完了により初期化処理は不要
}

const handleHideEvent = () => {
  console.log('🎯 main-dialog-hideイベント受信') 
  mainDialogStore.hideDialog()
}

// 事前読み込み完了により初期化処理は削除済み

// 個別タブ初期化（既存実装から移植）
// 事前読み込み完了により個別タブ初期化も削除済み

// ライフサイクル
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('main-dialog-show', handleShowEvent)
  document.addEventListener('main-dialog-hide', handleHideEvent)
  console.log('✅ MainDialog mounted, 初期表示状態:', isVisible.value)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  document.removeEventListener('main-dialog-show', handleShowEvent)
  document.removeEventListener('main-dialog-hide', handleHideEvent)
  console.log('🗑️ MainDialog unmounted')
})
</script>

<style scoped>
/* ダイアログオーバーレイ */
.ytomo-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    animation: fadeIn 0.2s ease-out forwards;
    overflow-y: auto;
}

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

/* メインダイアログコンテナ */
.ytomo-main-dialog {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 90vw;
    max-width: 800px;
    min-width: 600px;
    height: 80vh;
    max-height: 700px;
    min-height: 500px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: scale(0.9);
    animation: dialogAppear 0.2s ease-out forwards;
}

@media (max-width: 768px) {
    .ytomo-main-dialog {
        width: 95vw;
        height: 90vh;
        min-width: 320px;
        min-height: 400px;
    }
}

@keyframes dialogAppear {
    to {
        transform: scale(1);
    }
}

/* ダイアログボディ */
.ytomo-dialog-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f8fafc;
}

/* タブナビゲーション */
.ytomo-tab-navigation {
    display: flex;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
    position: relative;
}

.ytomo-tab-button {
    flex: 1;
    background: none;
    border: none;
    padding: 16px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
    border-bottom: 3px solid transparent;
}

.ytomo-tab-button:hover {
    background-color: #f1f5f9;
    color: #475569;
}

.ytomo-tab-button.active {
    color: #2c5aa0;
    background-color: #f8fafc;
    border-bottom-color: #2c5aa0;
}

.ytomo-tab-button:focus {
    outline: 2px solid #2c5aa0;
    outline-offset: -2px;
}

.ytomo-tab-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
}

.ytomo-tab-title {
    font-size: 14px;
    font-weight: 500;
}

.ytomo-tab-dates {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.2;
    min-height: 14px;
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.ytomo-latest-time {
    font-size: 11px;
    color: #059669;
    font-weight: 500;
}

.ytomo-tab-count {
    display: inline-block;
    margin-left: 8px;
    font-size: 12px;
    color: #475569;
    font-weight: 500;
    min-width: 18px;
    text-align: center;
    transition: all 0.2s;
    background: #f8fafc;
    padding: 2px 6px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
}

.ytomo-tab-button.active .ytomo-tab-count {
    color: #2c5aa0;
    background: #dbeafe;
    border-color: #93c5fd;
}

.ytomo-pavilion-reservation-info {
    font-size: 11px;
    color: #64748b;
    font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
    font-weight: 600;
    margin-top: 1px;
}

.ytomo-tab-button.active .ytomo-pavilion-reservation-info {
    color: #2c5aa0;
}

.ytomo-dialog-close {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: black;
    font-size: 24px;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.ytomo-dialog-close:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.ytomo-dialog-close:focus {
    outline: 2px solid rgba(0, 0, 0, 0.5);
    outline-offset: 2px;
}

/* タブコンテンツ */
.ytomo-tab-content {
    flex: 1;
    overflow: hidden;
    position: relative;
}

.ytomo-tab-pane {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.2s ease-out;
    overflow-y: auto;
    padding: 20px;
    display: none;
}

.ytomo-tab-pane.active {
    opacity: 1;
    transform: translateX(0);
    display: block;
}

/* ローディング表示 */
.ytomo-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    text-align: center;
}

.ytomo-loading::before {
    content: "";
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #2c5aa0;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

.ytomo-loading p {
    margin: 0;
    color: #64748b;
    font-size: 14px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
    .ytomo-dialog-overlay,
    .ytomo-main-dialog,
    .ytomo-tab-pane,
    .ytomo-tab-button,
    .ytomo-loading::before {
        animation: none;
        transition: none;
    }
}

/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
    .ytomo-main-dialog {
        border: 2px solid #000;
    }

    .ytomo-tab-button.active {
        border-bottom-width: 4px;
    }

    .ytomo-dialog-close:focus,
    .ytomo-tab-button:focus {
        outline: 3px solid #000;
    }
}

/* ダークモード対応を無効化（明示的にライトテーマを強制） */
.ytomo-dialog-overlay {
    color-scheme: light;
}

.ytomo-main-dialog {
    color-scheme: light;
    background: white !important;
    color: #1f2937 !important;
}
</style>