import { PageChecker } from './page-utils';
import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import MainDialog from '../components/MainDialog.vue'
import MainFab from '../components/MainFab.vue'

/**
 * 簡素化されたメインダイアログFAB実装
 * Vue/Piniaのみに依存、旧システムは完全に削除
 */

let mainDialogVisible = false;

export interface MainDialogFab {
    initialize(): void;
    addYTFabButton(): void;
    showMainDialog(): Promise<void>;
    hideMainDialog(): void;
    cleanup(): void;
    preInitializeVueSystem(): Promise<void>;
}

/**
 * YTFABボタンの実装（Vue統合版）
 */
export class MainDialogFabImpl implements MainDialogFab {
    private vueDialogApp: App | null = null;
    private vueFabApp: App | null = null;
    private dialogMountPoint: HTMLElement | null = null;
    private fabMountPoint: HTMLElement | null = null;
    private pageChecker: PageChecker | null = null;

    /**
     * メインダイアログFABシステムを初期化
     */
    initialize(): void {
        console.log('🎯 メインダイアログFAB初期化開始（Vue/Piniaのみ）');
        
        // PageCheckerを初期化
        if (!this.pageChecker) {
            this.pageChecker = new PageChecker();
        }

        // VueでFABボタンとダイアログを作成
        this.initializeVueComponents();
        
        console.log('✅ メインダイアログFAB初期化完了（Vue/Piniaのみ）');
    }
    
    /**
     * ページ読み込み時のVue統合システム事前初期化
     */
    async preInitializeVueSystem(): Promise<void> {
        console.log('🚀 Vue統合システム事前初期化開始');
        
        // ストア初期化をページ読み込み時に1回だけ行う
        try {
            const { useTicketsStore } = await import('@/stores/tickets')
            const { usePavilionsStore } = await import('@/stores/pavilions')
            
            const ticketsStore = useTicketsStore()
            const pavilionsStore = usePavilionsStore()
            
            await Promise.all([
                ticketsStore.init(),
                pavilionsStore.init()
            ])
            
            console.log('✅ 全ストア初期化完了')
        } catch (error) {
            console.error('❌ ストア初期化エラー:', error)
        }
    }
    
    /**
     * Vueコンポーネントを初期化
     */
    private initializeVueComponents(): void {
        try {
            // Piniaセットアップ
            const pinia = createPinia();
            pinia.use(createPersistedState());
            
            // MainDialogマウントポイント作成
            this.dialogMountPoint = document.createElement('div');
            this.dialogMountPoint.id = 'vue-main-dialog';
            document.body.appendChild(this.dialogMountPoint);
            
            // MainFabマウントポイント作成
            this.fabMountPoint = document.createElement('div');
            this.fabMountPoint.id = 'vue-main-fab';
            document.body.appendChild(this.fabMountPoint);
            
            // MainDialog Vue app作成・マウント
            this.vueDialogApp = createApp(MainDialog);
            this.vueDialogApp.use(pinia);
            this.vueDialogApp.mount(this.dialogMountPoint);
            
            // MainFab Vue app作成・マウント
            this.vueFabApp = createApp(MainFab);
            this.vueFabApp.use(pinia);
            this.vueFabApp.mount(this.fabMountPoint);
            
            console.log('✅ Vueコンポーネント初期化完了');
            
        } catch (error) {
            console.error('❌ Vueコンポーネント初期化エラー:', error);
            throw error;
        }
    }
    
    /**
     * 旧インターフェース用の空実装
     */
    addYTFabButton(): void {
        // Vueコンポーネントで実装済み
    }

    /**
     * メインダイアログを表示（Vue統合版）
     */
    async showMainDialog(): Promise<void> {
        console.log('🎯 Vue統合ダイアログ表示（Vueコンポーネントで実装済み）');
        // Vueコンポーネントで実装済み
    }

    /**
     * メインダイアログを非表示
     */
    hideMainDialog(): void {
        console.log('🔄 Vue統合ダイアログ非表示（Vueコンポーネントで実装済み）');
        // Vueコンポーネントで実装済み
    }

    /**
     * システムをクリーンアップ
     */
    cleanup(): void {
        console.log('🧹 メインダイアログFABシステムクリーンアップ');
        
        // Vue appsをアンマウント
        if (this.vueDialogApp) {
            this.vueDialogApp.unmount();
            this.vueDialogApp = null;
        }
        
        if (this.vueFabApp) {
            this.vueFabApp.unmount();
            this.vueFabApp = null;
        }
        
        // マウントポイントを削除
        if (this.dialogMountPoint) {
            this.dialogMountPoint.remove();
            this.dialogMountPoint = null;
        }
        
        if (this.fabMountPoint) {
            this.fabMountPoint.remove();
            this.fabMountPoint = null;
        }
        
        console.log('✅ メインダイアログFABシステムクリーンアップ完了');
    }
}

// グローバルインスタンス
let mainDialogFabInstance: MainDialogFab | null = null;

/**
 * 現在のページでメインダイアログFABを初期化
 */
export const initializeMainDialogFab = (): void => {
    if (mainDialogFabInstance) {
        console.log('🔄 メインダイアログFAB既存インスタンス削除');
        mainDialogFabInstance.cleanup();
    }
    
    mainDialogFabInstance = new MainDialogFabImpl();
    mainDialogFabInstance.initialize();
};

// 自動初期化（DOMContentLoaded時）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('📄 DOM読み込み完了 - ストア事前初期化');
        
        // ストア初期化を先に実行
        const tempInstance = new MainDialogFabImpl()
        await tempInstance.preInitializeVueSystem()
        
        setTimeout(() => {
            initializeMainDialogFab();
        }, 100);
    });
} else {
    console.log('📄 DOM既読み込み済み - ストア事前初期化');
    
    // ストア初期化を先に実行
    (async () => {
        const tempInstance = new MainDialogFabImpl()
        await tempInstance.preInitializeVueSystem()
        
        setTimeout(() => {
            initializeMainDialogFab();
        }, 100);
    })()
}