<template>
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
import { ref, onMounted } from 'vue'
import { useMainDialogStore } from '@/stores/mainDialog'
import { useTicketsStore } from '@/stores/tickets'
import { usePavilionsStore } from '@/stores/pavilions'

const mainDialogStore = useMainDialogStore()
const ticketsStore = useTicketsStore()
const pavilionsStore = usePavilionsStore()

const isInitialized = ref(false)

const handleClick = () => {
  if (isInitialized.value) {
    mainDialogStore.showDialog()
  } else {
    console.log('⏳ 初期化中のため、しばらくお待ちください...')
  }
}

onMounted(() => {
  // ストア初期化はページ読み込み時にだけ行う
  // ここではボタンを有効化するだけ
  isInitialized.value = true
})
</script>