<template>
  <div id="app">
    <!-- FABボタン -->
    <MainFab />
    
    <!-- メインダイアログ -->
    <MainDialog />
    
    <!-- グローバルオーバーレイ -->
    <ProcessingOverlay />
    <SequentialReservationOverlay />
  </div>
</template>

<script setup lang="ts">
import MainFab from './components/MainFab.vue'
import MainDialog from './components/MainDialog.vue'
import ProcessingOverlay from './components/ProcessingOverlay.vue'
import SequentialReservationOverlay from './components/SequentialReservationOverlay.vue'
</script>

<style>
#app {
  /* アプリ全体のベーススタイルがあれば記述 */
}
</style>