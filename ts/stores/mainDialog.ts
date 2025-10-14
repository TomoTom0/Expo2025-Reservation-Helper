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
  const activeTab = ref<'ticket' | 'pavilion' | 'entrance' | 'others'>('ticket')
  const version = ref(process.env.APP_VERSION || '0.0.0') // package.jsonから自動取得
  // selectedEntranceDate は計算プロパティで取得するため削除

  // Getters
  const getIsVisible = () => isVisible.value
  const getActiveTab = () => activeTab.value
  const getVersion = () => version.value

  // Actions
  const showDialog = (preserveTab: boolean = false) => {
    isVisible.value = true
    // preserveTab=trueの場合は現在のタブを保持、falseの場合はチケットタブに切り替え
    if (!preserveTab) {
      activeTab.value = 'ticket'
    }
  }

  const hideDialog = () => {
    isVisible.value = false
  }

  const setActiveTab = (tab: 'ticket' | 'pavilion' | 'entrance' | 'others') => {
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
    pick: ['activeTab'] // 永続化したい状態のみ指定
  }
})