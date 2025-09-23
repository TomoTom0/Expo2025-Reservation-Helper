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
import { computed, onMounted } from 'vue'
import MainFab from './components/MainFab.vue'
import MainDialog from './components/MainDialog.vue'
import ProcessingOverlay from './components/ProcessingOverlay.vue'
import SequentialReservationOverlay from './components/SequentialReservationOverlay.vue'
import YtomoPageContent from './components/YtomoPageContent.vue'
import { PageChecker } from './modules/page-utils'

// 現在のページが/ytomoかどうかを判定（PageCheckerに統一）
const isYtomoPage = computed(() => PageChecker.isYtomoPage())

// YTFABボタンを表示すべきページかどうか判定（ytomoページでは非表示）
const shouldShowFab = computed(() => {
  const pathname = window.location.pathname.toLowerCase()
  const allowedPages = ['/', '/invalid']
  // ytomoページでは FABボタンを表示しない
  return allowedPages.includes(pathname) && !isYtomoPage.value
})
</script>

<style>
#app {
  /* アプリ全体のベーススタイルがあれば記述 */
}
</style>