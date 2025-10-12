<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMainDialogStore } from '@/stores/mainDialog'
import { useRedirectStore } from '@/stores/redirect'
import { loggers } from '@/utils/logger'
import MainDialog from './MainDialog.vue'
import { createApp } from 'vue'
import { RouterUtils } from '@/modules/router-utils'

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
  mainDialogStore.showDialog(true) // ytomoページでは現在のタブを保持
  mainDialogApp = createApp(MainDialog)
  mainDialogApp.mount(dialogContainer)

  // スタイルは_ytomo-page.scssで管理

  logger.info('/ytomoページでのMainDialog表示完了')
}

// redirect_codeパラメータをチェックし、該当する場合はページ遷移を実行
const handleRedirect = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const redirectCode = urlParams.get('redirect_code')

    if (!redirectCode) {
      logger.info('redirect_codeパラメータなし - 通常のytomoページ表示')
      return false
    }

    logger.info('redirect_code検出', { redirectCode })

    // Redirect情報を取得
    const redirectStore = useRedirectStore()
    const redirectInfo = redirectStore.getRedirectInfo(redirectCode)

    if (!redirectInfo) {
      logger.warn('有効なRedirect情報が見つかりません', { redirectCode })
      return false
    }

    logger.info('Redirect実行', {
      targetUrl: redirectInfo.targetUrl,
      pavilionId: redirectInfo.pavilionId
    })

    // Router.push()で遷移
    const success = RouterUtils.push(redirectInfo.targetUrl)

    if (success) {
      // 使用済みのRedirect情報をクリーンアップ
      redirectStore.clearRedirectInfo(redirectCode)
      logger.info('Redirect完了 - 情報をクリーンアップ', { redirectCode })
      return true
    } else {
      logger.warn('Router.push()失敗 - location.hrefにフォールバック')
      window.location.href = redirectInfo.targetUrl
      return true
    }

  } catch (error) {
    logger.error('Redirect処理エラー', error)
    return false
  }
}

// main-dialog-fab.tsで既に読み込み表示が作成されているので、MainDialogの読み込みのみ実行
const waitForMainAndLoadDialog = () => {
  const mainElement = document.querySelector('main')
  if (mainElement) {
    const loadingContainer = mainElement.querySelector('.ytomo-loading-container')
    if (loadingContainer) {
      logger.info('ytomoページ - MainDialog読み込み開始')

      // redirect_codeがある場合は先に処理
      const isRedirecting = handleRedirect()

      // Redirect中でなければMainDialogを表示
      if (!isRedirecting) {
        loadMainDialog(mainElement, loadingContainer)
      }
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