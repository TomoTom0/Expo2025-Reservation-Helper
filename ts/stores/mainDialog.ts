/**
 * メインダイアログ状態管理ストア
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMainDialogStore = defineStore('mainDialog', () => {
  // State - 初期化時に強制的にfalseに設定（永続化の問題を回避）
  const isVisible = ref(false)
  const activeTab = ref<'ticket' | 'pavilion'>('ticket')
  const version = ref('0.5.4') // version.datから動的に読み込む予定
  // selectedEntranceDate は計算プロパティで取得するため削除

  // Getters
  const getIsVisible = () => isVisible.value
  const getActiveTab = () => activeTab.value
  const getVersion = () => version.value

  // Actions
  const showDialog = () => {
    isVisible.value = true
  }

  const hideDialog = () => {
    isVisible.value = false
  }

  const setActiveTab = (tab: 'ticket' | 'pavilion') => {
    activeTab.value = tab
  }

  // 入場日時選択は各scheduleのselectedフラグで管理するため、ここでは削除

  return {
    // State
    isVisible,
    activeTab,
    version,
    
    // Getters
    getIsVisible,
    getActiveTab,
    getVersion,
    
    // Actions
    showDialog,
    hideDialog,
    setActiveTab
  }
}, {
  // Store全体をlocalStorageに自動永続化
  persist: {
    key: 'ytomo-main-dialog',
    pick: ['selectedEntranceDate', 'activeTab'] // 永続化したい状態のみ指定
  }
})