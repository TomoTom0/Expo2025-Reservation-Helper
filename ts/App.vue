<template>
  <div id="app">
    <!-- 特定ページでのみFABボタンを表示 -->
    <MainFab v-if="shouldShowFab" />
    
    <!-- /ytomoページでない場合はダイアログを表示 -->
    <MainDialog v-if="!isYtomoPage" />
    
    <!-- /ytomoページの場合はmainタグに内容を直接表示 -->
    <YtomoPageContent v-if="isYtomoPage" />
    
    <!-- グローバルオーバーレイ -->
    <ProcessingOverlay />
    <SequentialReservationOverlay />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainFab from './components/MainFab.vue'
import MainDialog from './components/MainDialog.vue'
import ProcessingOverlay from './components/ProcessingOverlay.vue'
import SequentialReservationOverlay from './components/SequentialReservationOverlay.vue'
import YtomoPageContent from './components/YtomoPageContent.vue'

// 現在のページが/ytomoかどうかを判定
const isYtomoPage = ref(false)

// URLチェック関数
const checkUrl = () => {
  const pathname = window.location.pathname.toLowerCase()
  isYtomoPage.value = pathname === '/ytomo' || pathname === '/ytomo/'
}

// YTFABボタンを表示すべきページかどうか判定
const shouldShowFab = computed(() => {
  const pathname = window.location.pathname.toLowerCase()
  const allowedPages = ['/', '/invalid', '/ytomo', '/ytomo/']
  return allowedPages.includes(pathname) || pathname.startsWith('/ytomo/')
})

// マウント時とURL変更時にチェック
onMounted(() => {
  checkUrl()
  
  // URLが変更された際の検知（SPA対応）
  window.addEventListener('popstate', checkUrl)
})
</script>

<style>
#app {
  /* アプリ全体のベーススタイルがあれば記述 */
}
</style>