import { PageChecker } from './page-utils';
import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import MainDialog from '../components/MainDialog.vue'
import { useTicketsStore } from '@/stores/tickets'
import { usePavilionsStore } from '@/stores/pavilions'
import { useMainDialogStore } from '@/stores/mainDialog'

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
 * YTFABボタンの実装（簡素化版）
 */
export class MainDialogFabImpl implements MainDialogFab {
    private ytFabButton: HTMLElement | null = null;
    private vueApp: App | null = null;
    private mountPoint: HTMLElement | null = null;
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

        // FABボタンを作成
        this.createFabContainer();
        this.addYTFabButton();
        
        console.log('✅ メインダイアログFAB初期化完了（Vue/Piniaのみ）');
    }
    
    /**
     * ページ読み込み時のVue統合システム事前初期化
     */
    async preInitializeVueSystem(): Promise<void> {
        console.log('🚀 Vue統合システム事前初期化開始');
        await this.initializeVueIntegration();
    }
    
    /**
     * Vue.js統合システムを初期化
     */
    private async initializeVueIntegration(): Promise<void> {
        if (this.vueApp) return; // 既に初期化済み
        
        console.log('🚀 Vue統合システム初期化開始');
        
        try {
            // マウントポイントを作成
            this.mountPoint = document.createElement('div');
            this.mountPoint.id = 'vue-main-dialog-integration';
            document.body.appendChild(this.mountPoint);
            
            // Vue app作成
            const pinia = createPinia();
            pinia.use(createPersistedState());
            this.vueApp = createApp(MainDialog);
            this.vueApp.use(pinia);
            
            // マウント
            this.vueApp.mount(this.mountPoint);
            
            console.log('✅ Vue統合システム初期化完了');
            
            // ストアを初期化（並列実行）
            await this.initializeStores();
            
        } catch (error) {
            console.error('❌ Vue統合システム初期化エラー:', error);
            throw error;
        }
    }
    
    /**
     * 全Piniaストアを初期化
     */
    private async initializeStores(): Promise<void> {
        try {
            console.log('🏪 Piniaストア初期化中...');
            
            const storeInitPromises = [
                this.initTicketsStore(),
                this.initPavilionsStore(),
                this.initMainDialogStore()
            ];
            
            await Promise.allSettled(storeInitPromises);
            console.log('✅ 全Piniaストア初期化完了');
            
        } catch (error) {
            console.warn('⚠️ Piniaストア初期化エラー:', error);
        }
    }

    /**
     * チケットストアの初期化
     */
    private async initTicketsStore(): Promise<void> {
        const ticketsStore = useTicketsStore();
        await ticketsStore.init();
    }

    /**
     * パビリオンストアの初期化
     */
    private async initPavilionsStore(): Promise<void> {
        const pavilionsStore = usePavilionsStore();
        pavilionsStore.initialize();
    }

    /**
     * メインダイアログストアの初期化
     */
    private async initMainDialogStore(): Promise<void> {
        const mainDialogStore = useMainDialogStore();
        // 設定の復元等が自動で行われるため、特別な初期化処理は不要
    }

    /**
     * 基本的なFABコンテナを作成
     */
    private createFabContainer(): void {
        let fabContainer = document.getElementById('ytomo-fab-container');
        
        if (!fabContainer) {
            fabContainer = document.createElement('div');
            fabContainer.id = 'ytomo-fab-container';
            fabContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(fabContainer);
        }
    }

    /**
     * YTダイアログ開閉用FABボタンを追加
     */
    addYTFabButton(): void {
        const fabContainer = document.getElementById('ytomo-fab-container');
        
        if (!fabContainer) {
            console.error('❌ FABコンテナが見つかりません');
            return;
        }
        
        // 既存のボタンがある場合は削除
        if (this.ytFabButton) {
            this.ytFabButton.remove();
        }

        // YTボタンを作成
        this.ytFabButton = document.createElement('button');
        this.ytFabButton.id = 'ytomo-main-dialog-fab';
        this.ytFabButton.textContent = 'YT';
        this.ytFabButton.style.cssText = `
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background-color: #ff6b35;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
            pointer-events: auto;
            z-index: 10000;
        `;
        
        // ホバー効果
        this.ytFabButton.onmouseenter = () => {
            if (this.ytFabButton) {
                this.ytFabButton.style.transform = 'scale(1.1)';
                this.ytFabButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)';
            }
        };
        
        this.ytFabButton.onmouseleave = () => {
            if (this.ytFabButton) {
                this.ytFabButton.style.transform = 'scale(1)';
                this.ytFabButton.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            }
        };

        // クリックイベント
        this.ytFabButton.addEventListener('click', () => {
            this.showMainDialog();
        });

        fabContainer.appendChild(this.ytFabButton);
        console.log('✅ YTメインダイアログFABボタン追加完了');
    }

    /**
     * メインダイアログを表示（Vue統合版）
     */
    async showMainDialog(): Promise<void> {
        console.log('🎯 Vue統合ダイアログ表示');
        
        // Piniaストアを使ってダイアログ表示（既に事前初期化済み）
        const mainDialogStore = useMainDialogStore();
        mainDialogStore.showDialog();
        
        // mainDialogVisibleフラグを更新（既存システムとの互換性）
        mainDialogVisible = true;
        (window as any).mainDialogVisible = true;
    }

    /**
     * メインダイアログを非表示（Vue統合版）
     */
    hideMainDialog(): void {
        console.log('🎯 Vue統合ダイアログ非表示');
        
        // Piniaストアを使ってダイアログ非表示
        if (this.vueApp) {
            const mainDialogStore = useMainDialogStore();
            mainDialogStore.hideDialog();
        }
        
        // mainDialogVisibleフラグを更新
        mainDialogVisible = false;
        (window as any).mainDialogVisible = false;
    }

    /**
     * クリーンアップ
     */
    cleanup(): void {
        console.log('🧹 MainDialogFab クリーンアップ実行');
        
        // FABボタンを削除
        if (this.ytFabButton) {
            this.ytFabButton.remove();
            this.ytFabButton = null;
        }
        
        // Vueアプリを削除
        if (this.vueApp) {
            this.vueApp.unmount();
            this.vueApp = null;
        }
        
        // マウントポイントを削除
        if (this.mountPoint) {
            this.mountPoint.remove();
            this.mountPoint = null;
        }
        
        // FABコンテナを削除（他のボタンがない場合）
        const fabContainer = document.getElementById('ytomo-fab-container');
        if (fabContainer && fabContainer.children.length === 0) {
            fabContainer.remove();
        }
        
        console.log('✅ MainDialogFab クリーンアップ完了');
    }
}

// インスタンス作成
const mainDialogFab = new MainDialogFabImpl();

/**
 * メインダイアログFABシステムを初期化
 */
export function initializeMainDialogFab(): void {
    mainDialogFab.initialize();
}

/**
 * メインダイアログの表示状態を取得
 */
export function isMainDialogVisible(): boolean {
    return mainDialogVisible;
}

// ページ読み込み時点でのVue/Piniaストア事前読み込み
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('📄 DOM読み込み完了 - Vue/Piniaストア事前読み込み開始');
        mainDialogFab.initialize();
        // Vue統合システムとストアを事前初期化
        await mainDialogFab.preInitializeVueSystem();
    });
} else {
    // 既にDOMが読み込み済みの場合は即座に実行
    console.log('📄 DOM既読み込み済み - Vue/Piniaストア事前読み込み開始');
    mainDialogFab.initialize();
    // Vue統合システムとストアを事前初期化
    mainDialogFab.preInitializeVueSystem();
}