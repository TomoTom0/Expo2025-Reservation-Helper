<template>
  <!-- 予約結果表示 -->
  <div 
    v-if="reservationResult"
    class="ytomo-reservation-result"
    :class="{ success: reservationResult.success, failed: !reservationResult.success }"
  >
    <div class="ytomo-result-status">
      {{ reservationResult.success ? '予約成功' : `予約失敗: ${reservationResult.reason}` }}
    </div>
    <div class="ytomo-result-pavilion">{{ reservationResult.pavilionName }}</div>
    <div class="ytomo-result-time">{{ reservationResult.datetime }}</div>
  </div>
  
  <button 
    class="ytomo-main-fab"
    :disabled="!isInitialized"
    :title="isInitialized ? 'YTダイアログを開く' : '初期化中...'"
    @click="handleClick"
  >
    YT
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMainDialogStore } from '@/stores/mainDialog'
import { useTicketsStore } from '@/stores/tickets'
import { usePavilionsStore } from '@/stores/pavilions'
import { loggers } from '@/utils/logger'

const logger = loggers.ui

interface ReservationResult {
  success: boolean
  reason?: string
  pavilionName: string
  datetime: string
}

const mainDialogStore = useMainDialogStore()
const ticketsStore = useTicketsStore()
const pavilionsStore = usePavilionsStore()

const isInitialized = computed(() => {
  // lastUpdateTimeが存在すれば初期化済みと判定
  return ticketsStore.lastUpdateTime > 0 && pavilionsStore.isInitialized
})
const reservationResult = ref<ReservationResult | null>(null)

const handleClick = () => {
  if (isInitialized.value) {
    mainDialogStore.showDialog()
  } else {
    logger.warn('初期化中のため待機中')
  }
}

// 時刻を「11:14」形式にフォーマット
const formatTime = (timeStr: string): string => {
  // 「1114」形式を「11:14」に変換
  const match = timeStr.match(/(\d{2})(\d{2})/)
  if (match) {
    return `${match[1]}:${match[2]}`
  }
  return timeStr
}

// エラーメッセージを日本語に変換
const translateErrorMessage = (reason: string): string => {
  if (reason.includes('select ticket valid error')) {
    return '無効'
  }
  return reason
}

// 予約結果を表示する関数
const showReservationResult = (result: ReservationResult) => {
  // 時刻フォーマットを修正
  const formattedResult = {
    ...result,
    datetime: result.datetime.replace(/(\d{4})$/, (match) => formatTime(match)),
    reason: result.reason ? translateErrorMessage(result.reason) : undefined
  }
  
  reservationResult.value = formattedResult
  
  // 10秒後に自動で非表示（表示時間を延長）
  setTimeout(() => {
    reservationResult.value = null
  }, 10000)
}

// 予約結果イベントリスナー
const handleReservationResult = (event: CustomEvent<ReservationResult>) => {
  showReservationResult(event.detail)
}

onMounted(() => {
  // 予約結果イベントリスナーを設定
  document.addEventListener('reservation-result', handleReservationResult as EventListener)
})

onUnmounted(() => {
  // イベントリスナーをクリーンアップ
  document.removeEventListener('reservation-result', handleReservationResult as EventListener)
})
</script>