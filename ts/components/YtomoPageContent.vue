<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMainDialogStore } from '@/stores/mainDialog'
import { loggers } from '@/utils/logger'
import MainDialog from './MainDialog.vue'
import { createApp } from 'vue'

const logger = loggers.ui

let mainDialogApp: any = null

const loadMainDialog = (mainElement: Element, loadingContainer: Element) => {
  logger.info('MainDialog読み込み開始')
  
  // 読み込み中表示を削除
  loadingContainer.remove()
  
  // MainDialogをページ用スタイルでマウント
  const dialogContainer = document.createElement('div')
  dialogContainer.id = 'ytomo-page-dialog-container'
  mainElement.appendChild(dialogContainer)
  
  // storeを初期化してからMainDialogをマウント
  const mainDialogStore = useMainDialogStore()
  mainDialogStore.showDialog()
  mainDialogApp = createApp(MainDialog)
  mainDialogApp.mount(dialogContainer)
  
  // スタイルは_ytomo-page.scssで管理
  
  logger.info('/ytomoページでのMainDialog表示完了')
}

// main-dialog-fab.tsで既に読み込み表示が作成されているので、MainDialogの読み込みのみ実行
const waitForMainAndLoadDialog = () => {
  const mainElement = document.querySelector('main')
  if (mainElement) {
    const loadingContainer = mainElement.querySelector('.ytomo-loading-container')
    if (loadingContainer) {
      logger.info('ytomoページ - MainDialog読み込み開始')
      loadMainDialog(mainElement, loadingContainer)
    } else {
      // 読み込み表示が見つからない場合は再試行
      setTimeout(waitForMainAndLoadDialog, 100)
    }
  } else {
    // mainタグが見つからない場合は再試行
    setTimeout(waitForMainAndLoadDialog, 100)
  }
}

// スクリプト読み込み時点で実行
waitForMainAndLoadDialog()

onMounted(() => {
  // ページタイトルを変更
  document.title = 'Expo YTomo'
  
  // ytomoページ用のクラスを追加
  document.body.classList.add('ytomo-page')
  
  logger.info('ytomoページタイトルを変更', { title: document.title })
})

</script>