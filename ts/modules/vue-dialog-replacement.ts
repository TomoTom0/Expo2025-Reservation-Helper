/**
 * Vue統合ダイアログ置き換えシステム
 * 既存MainDialogFabのshowMainDialog()メソッドをVue版に置き換え
 */

// Vue統合システムは無効化されています
import type { TicketManagerInterface, PavilionManagerInterface } from '../types/api'

// MainDialogFabインターフェース定義
interface MainDialogFabInterface {
  showMainDialog(): Promise<void>
  hideMainDialog(): void
  showMainDialogLegacy(): Promise<void>  // 旧実装（フォールバック用）
  hideMainDialogLegacy(): void           // 旧実装（フォールバック用）
  reactiveTicketManager?: {
    loadAllTickets?(): Promise<void>
  }
  mainDialogContainer?: HTMLElement | null
}

// Vue統合フラグ
let vueIntegrationEnabled = false
let originalShowMainDialog: (() => Promise<void>) | null = null
let originalHideMainDialog: (() => void) | null = null

/**
 * 既存MainDialogFabシステムにVue統合を適用
 */
export const enableVueDialogReplacement = async (): Promise<void> => {
  console.log('🚫 Vue統合ダイアログ置き換えは無効化されています')
  return

  // DISABLED: Vue.js完全移行により不要
  /*
  console.log('🔄 Vue統合ダイアログ置き換え開始')

  try {
    // グローバルMainDialogFabインスタンスを取得
    const mainDialogFab = (window as any).getMainDialogFab?.() as MainDialogFabInterface | undefined
    if (!mainDialogFab) {
      throw new Error('MainDialogFabインスタンスが見つかりません')
    }

    // 必要なマネージャーを取得
    const ticketManager = (window as any).getTicketManager?.() as TicketManagerInterface | undefined
    const pavilionManager = (window as any).getPavilionManager?.() as PavilionManagerInterface | undefined
    
    if (!ticketManager || !pavilionManager) {
      throw new Error('TicketManagerまたはPavilionManagerが見つかりません')
    }

    // Vue統合システムを初期化
    const vueAdapter = await initializeVueIntegration()

    // 既存メソッドを保存（Legacy版をバックアップ）
    if (!originalShowMainDialog) {
      originalShowMainDialog = mainDialogFab.showMainDialogLegacy.bind(mainDialogFab)
      originalHideMainDialog = mainDialogFab.hideMainDialogLegacy.bind(mainDialogFab)
    }

    // showMainDialogをVue版に置き換え
    mainDialogFab.showMainDialog = async function() {
      console.log('🎯 Vue統合ダイアログ表示（置き換え版）')
      
      try {
        // チケットデータを事前読み込み
        await this.reactiveTicketManager?.loadAllTickets?.()
        
        // Vue統合ダイアログを表示
        vueAdapter.showDialog()
        
        // mainDialogVisibleフラグを更新（既存システムとの互換性）
        ;(window as any).mainDialogVisible = true
        
      } catch (error) {
        console.error('❌ Vue統合ダイアログ表示エラー:', error)
        // フォールバック: 元の実装を使用
        if (originalShowMainDialog) {
          await originalShowMainDialog.call(this)
        }
      }
    }

    // hideMainDialogをVue版に置き換え
    mainDialogFab.hideMainDialog = function() {
      console.log('🎯 Vue統合ダイアログ非表示（置き換え版）')
      
      const vueIntegration = getVueIntegration()
      if (vueIntegration) {
        vueIntegration.hideDialog()
      }
      
      // mainDialogVisibleフラグを更新
      ;(window as any).mainDialogVisible = false
      
      // 既存のクリーンアップも実行
      if (this.mainDialogContainer) {
        this.mainDialogContainer.remove()
        this.mainDialogContainer = null
      }
    }

    // Vue統合を有効化
    vueIntegrationEnabled = true

    console.log('✅ Vue統合ダイアログ置き換え完了')

    // デバッグ用のグローバル参照を追加
    ;(window as any).vueDialogReplacement = {
      enabled: () => vueIntegrationEnabled,
      disable: () => disableVueDialogReplacement(),
      getAdapter: () => getVueIntegration()
    }

  } catch (error) {
    console.error('❌ Vue統合ダイアログ置き換えエラー:', error)
    throw error
  }
  */
}

/**
 * Vue統合ダイアログ置き換えを無効化
 */
export const disableVueDialogReplacement = (): void => {
  console.log('🔄 Vue統合ダイアログ置き換え無効化')

  try {
    const mainDialogFab = (window as any).getMainDialogFab?.() as MainDialogFabInterface | undefined
    if (mainDialogFab && originalShowMainDialog && originalHideMainDialog) {
      // 元のメソッドを復元
      mainDialogFab.showMainDialog = originalShowMainDialog
      mainDialogFab.hideMainDialog = originalHideMainDialog
    }

    // Vue統合システムは無効化されています

    // フラグを無効化
    vueIntegrationEnabled = false

    // グローバル参照をクリア
    if ((window as any).vueDialogReplacement) {
      delete (window as any).vueDialogReplacement
    }

    console.log('✅ Vue統合ダイアログ置き換え無効化完了')

  } catch (error) {
    console.error('❌ Vue統合ダイアログ置き換え無効化エラー:', error)
  }
}

/**
 * Vue統合ダイアログが有効かどうか
 */
export const isVueDialogReplacementEnabled = (): boolean => {
  return vueIntegrationEnabled
}

/**
 * Vue統合システム自動初期化（開発モード用）
 * DISABLED: Vue.js完全移行により不要
 */
export const autoInitializeVueDialogReplacement = async (): Promise<void> => {
  console.log('🚫 Vue統合ダイアログ自動初期化は無効化されています')
  return
}