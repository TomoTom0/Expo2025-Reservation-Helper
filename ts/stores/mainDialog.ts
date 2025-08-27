/**
 * メインダイアログ状態管理ストア
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loggers } from '@/utils/logger'

export const useMainDialogStore = defineStore('mainDialog', () => {
  const logger = loggers.ui
  
  // State - 初期化時に強制的にfalseに設定（永続化の問題を回避）
  const isVisible = ref(false)
  const activeTab = ref<'ticket' | 'pavilion'>('ticket')
  const version = ref('0.5.4') // version.datから動的に読み込む予定
  const endlessMode = ref(false) // ENDLESSモードの状態
  // selectedEntranceDate は計算プロパティで取得するため削除

  // Getters
  const getIsVisible = () => isVisible.value
  const getActiveTab = () => activeTab.value
  const getVersion = () => version.value
  const getEndlessMode = () => endlessMode.value

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

  const toggleEndlessMode = () => {
    endlessMode.value = !endlessMode.value
    logger.info('ENDLESSモード切り替え', { enabled: endlessMode.value })
  }

  // 入場日時選択は各scheduleのselectedフラグで管理するため、ここでは削除

  return {
    // State
    isVisible,
    activeTab,
    version,
    endlessMode,
    
    // Getters
    getIsVisible,
    getActiveTab,
    getVersion,
    getEndlessMode,
    
    // Actions
    showDialog,
    hideDialog,
    setActiveTab,
    toggleEndlessMode
  }
}, {
  // Store全体をlocalStorageに自動永続化
  persist: {
    key: 'ytomo-main-dialog',
    pick: ['activeTab', 'endlessMode'] // 永続化したい状態のみ指定
  }
})