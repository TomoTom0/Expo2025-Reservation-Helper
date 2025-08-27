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
  return ticketsStore.isInitialized && pavilionsStore.isInitialized
})
const reservationResult = ref<ReservationResult | null>(null)

const handleClick = () => {
  if (isInitialized.value) {
    mainDialogStore.showDialog()
  } else {
    console.log('⏳ 初期化中のため、しばらくお待ちください...')
  }
}

// 予約結果を表示する関数
const showReservationResult = (result: ReservationResult) => {
  reservationResult.value = result
  
  // 5秒後に自動で非表示
  setTimeout(() => {
    reservationResult.value = null
  }, 5000)
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