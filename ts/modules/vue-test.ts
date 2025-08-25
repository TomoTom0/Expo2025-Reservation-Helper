/**
 * Vue.js統合テストモジュール
 * Phase 2: MainDialogシステム統合テスト
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import HelloVue from '../components/HelloVue.vue'
import MainDialog from '../components/MainDialog.vue'
import { useMainDialogStore } from '../stores/mainDialog'

let vueTestApp: any = null
let mainDialogApp: any = null

/**
 * Vue.jsテストを初期化・表示（Phase 1）
 */
export const initVueTest = () => {
  console.log('🚀 Vue.js統合テスト開始')
  
  try {
    // テスト用のマウントポイントを作成
    const mountPoint = document.createElement('div')
    mountPoint.id = 'vue-test-mount'
    mountPoint.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `
    document.body.appendChild(mountPoint)
    
    // Vueアプリケーションを作成・マウント
    vueTestApp = createApp(HelloVue)
    vueTestApp.mount('#vue-test-mount')
    
    console.log('✅ Vue.js統合テスト: マウント完了')
    return true
  } catch (error) {
    console.error('❌ Vue.js統合テストエラー:', error)
    return false
  }
}

/**
 * MainDialogシステムの統合テスト（Phase 2）
 */
export const initMainDialogTest = () => {
  console.log('🚀 MainDialog統合テスト開始')
  
  try {
    // 模擬TicketManager・PavilionManagerを作成
    const mockTicketManager = {
      loadAllTickets: async () => {
        console.log('🎫 模擬チケット読み込み')
        await new Promise(resolve => setTimeout(resolve, 500)) // 読み込み遅延をシミュレート
        return [
          {
            ticket_id: 'TEST001',
            label: 'テストチケット1',
            isOwn: true,
            schedules: [
              {
                entrance_date: '20250501',
                isEffective: true,
                schedule_name: 'ゴールデンウィーク特別',
                time_start: '10:00',
                time_end: '18:00',
                use_state: 1,
                reservation_type: 'normal'
              }
            ]
          },
          {
            ticket_id: 'TEST002',
            label: 'テストチケット2',
            isOwn: false,
            schedules: [
              {
                entrance_date: '20250505',
                isEffective: true,
                schedule_name: 'こどもの日特別',
                time_start: '09:00',
                time_end: '20:00',
                use_state: 1,
                reservation_type: 'special'
              }
            ]
          }
        ]
      },
      addTicket: async (ticketId: string, label: string, isExternal: boolean) => {
        console.log(`🎫 模擬チケット追加: ${ticketId} (${label}, external: ${isExternal})`)
        await new Promise(resolve => setTimeout(resolve, 200))
      },
      selectTicket: (ticketId: string, selected: boolean) => {
        console.log(`🎫 模擬チケット選択: ${ticketId} = ${selected}`)
      }
    }
    
    const mockPavilionManager = {
      searchPavilions: async (query: string, ticketIds: string[], entranceDate?: string) => {
        console.log(`🏛️ 模擬パビリオン検索: "${query}" (チケット: ${ticketIds.length}個, 入場日: ${entranceDate || '未指定'})`)
        await new Promise(resolve => setTimeout(resolve, 800)) // 検索遅延をシミュレート
        return [
          {
            id: 'PAVILION001',
            name: 'テストパビリオン1',
            dateStatus: 1,
            isFavorite: false,
            timeSlots: [
              { time: '10:00', available: true, selected: false, reservationType: 'normal' },
              { time: '12:00', available: true, selected: false, reservationType: 'normal' },
              { time: '14:00', available: false, selected: false, reservationType: 'lottery' },
              { time: '16:00', available: true, selected: false, reservationType: 'priority' }
            ]
          },
          {
            id: 'PAVILION002',
            name: 'テストパビリオン2',
            dateStatus: 2, // 満席
            isFavorite: true,
            timeSlots: [
              { time: '11:00', available: false, selected: false, reservationType: 'normal' },
              { time: '13:00', available: false, selected: false, reservationType: 'normal' }
            ]
          },
          {
            id: 'PAVILION003',
            name: 'テストパビリオン3',
            dateStatus: 1,
            isFavorite: false,
            timeSlots: [
              { time: '09:00', available: true, selected: false, reservationType: 'normal' },
              { time: '15:00', available: true, selected: false, reservationType: 'normal' },
              { time: '17:00', available: true, selected: false, reservationType: 'normal' }
            ]
          }
        ]
      },
      
      refreshPavilionData: async () => {
        console.log('🔄 模擬パビリオンデータ再取得')
        await new Promise(resolve => setTimeout(resolve, 300))
        return [] // 簡略化
      },
      
      selectTimeSlot: (pavilionId: string, timeSlot: any) => {
        console.log(`🕐 模擬時間帯選択: ${pavilionId} - ${timeSlot.time} = ${timeSlot.selected}`)
      },
      
      clearSelectedTimeSlots: () => {
        console.log('🧹 模擬選択済み時間帯をクリア')
      },
      
      executeReservation: async (pavilionId: string, timeSlot: any, entranceDate: string, registeredChannel: string) => {
        console.log(`🎯 模擬予約実行: ${pavilionId} - ${timeSlot.time}`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // 予約処理遅延をシミュレート
        
        // ランダムで成功/失敗を決める
        const success = Math.random() > 0.3 // 70%の確率で成功
        return {
          success,
          message: success ? '予約が完了しました' : '予約枠が埋まりました',
          details: {
            pavilionId,
            timeSlot: timeSlot.time,
            entranceDate,
            registeredChannel
          }
        }
      }
    }

    // MainDialog用のマウントポイントを作成
    const mountPoint = document.createElement('div')
    mountPoint.id = 'vue-main-dialog-mount'
    document.body.appendChild(mountPoint)
    
    // Pinia + Vueアプリケーションを作成
    const pinia = createPinia()
    mainDialogApp = createApp(MainDialog)
    mainDialogApp.use(pinia)
    
    // 依存関係インジェクション（模擬Manager）
    mainDialogApp.provide('ticketManager', mockTicketManager)
    mainDialogApp.provide('pavilionManager', mockPavilionManager)
    
    // MainDialogをマウント
    const vueInstance = mainDialogApp.mount('#vue-main-dialog-mount')
    
    // ストアにアクセスしてダイアログを表示
    const mainDialogStore = useMainDialogStore()
    mainDialogStore.showDialog()
    
    console.log('✅ MainDialog統合テスト: マウント完了')
    
    // デバッグ用のグローバル参照を作成
    ;(window as any).vueMainDialog = {
      instance: vueInstance,
      store: mainDialogStore,
      show: () => mainDialogStore.showDialog(),
      hide: () => mainDialogStore.hideDialog(),
      switchTab: (tab: 'ticket' | 'pavilion') => mainDialogStore.setActiveTab(tab),
      mockTicketManager,
      mockPavilionManager
    }
    
    console.log('🎯 MainDialogテスト: window.vueMainDialog でアクセス可能')
    console.log('📋 利用可能操作:')
    console.log('  - vueMainDialog.show() : ダイアログ表示')
    console.log('  - vueMainDialog.hide() : ダイアログ非表示')
    console.log('  - vueMainDialog.switchTab("ticket") : チケットタブ')
    console.log('  - vueMainDialog.switchTab("pavilion") : パビリオンタブ')
    
    return true
  } catch (error) {
    console.error('❌ MainDialog統合テストエラー:', error)
    return false
  }
}

/**
 * Vue.jsテストを終了
 */
export const destroyVueTest = () => {
  if (vueTestApp) {
    vueTestApp.unmount()
    vueTestApp = null
  }
  
  const mountPoint = document.getElementById('vue-test-mount')
  if (mountPoint) {
    document.body.removeChild(mountPoint)
  }
  
  console.log('🔄 Vue.js統合テスト終了')
}

/**
 * MainDialogテストを終了
 */
export const destroyMainDialogTest = () => {
  if (mainDialogApp) {
    mainDialogApp.unmount()
    mainDialogApp = null
  }
  
  const mountPoint = document.getElementById('vue-main-dialog-mount')
  if (mountPoint) {
    document.body.removeChild(mountPoint)
  }
  
  // グローバル参照をクリア
  if ((window as any).vueMainDialog) {
    delete (window as any).vueMainDialog
  }
  
  console.log('🔄 MainDialog統合テスト終了')
}

// グローバル関数として公開（デバッグ用）
if (typeof window !== 'undefined') {
  (window as any).initVueTest = initVueTest;
  (window as any).destroyVueTest = destroyVueTest;
  (window as any).initMainDialogTest = initMainDialogTest;
  (window as any).destroyMainDialogTest = destroyMainDialogTest;
}