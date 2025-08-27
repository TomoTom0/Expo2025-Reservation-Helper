import { PageChecker } from './page-utils';
import { createApp, type App } from 'vue'
import { pinia } from '../stores'
import RootApp from '../App.vue'
import { loggers } from '../utils/logger'

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
    private vueApp: App | null = null;
    private appMountPoint: HTMLElement | null = null;
    private pageChecker: PageChecker | null = null;
    private logger = loggers.ui;

    /**
     * メインダイアログFABシステムを初期化
     */
    initialize(): void {
        this.logger.info('メインダイアログFAB初期化開始（Vue/Piniaのみ）');
        
        // PageCheckerを初期化
        if (!this.pageChecker) {
            this.pageChecker = new PageChecker();
        }

        // VueでFABボタンとダイアログを作成
        this.initializeVueComponents();
        
        this.logger.info('メインダイアログFAB初期化完了（Vue/Piniaのみ）');
    }
    
    /**
     * ページ読み込み時のVue統合システム事前初期化
     */
    async preInitializeVueSystem(): Promise<void> {
        this.logger.info('Vue統合システム事前初期化開始');
        
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
            
            this.logger.info('全ストア初期化完了')
        } catch (error) {
            this.logger.error('ストア初期化エラー', error)
        }
    }
    
    /**
     * Vueアプリケーションを初期化
     */
    private initializeVueComponents(): void {
        try {
            // ytomoページの場合は即座にmainタグをクリア
            this.handleYtomoPageImmediate();
            
            // アプリケーションマウントポイント作成
            this.appMountPoint = document.createElement('div');
            this.appMountPoint.id = 'vue-app';
            document.body.appendChild(this.appMountPoint);
            
            // 単一Vue app作成・マウント
            this.vueApp = createApp(RootApp);
            this.vueApp.use(pinia);
            this.vueApp.mount(this.appMountPoint);
            
            this.logger.info('Vueアプリケーション初期化完了');
            
        } catch (error) {
            this.logger.error('Vueアプリケーション初期化エラー', error);
            throw error;
        }
    }
    
    /**
     * ytomoページの即座処理（mainタグクリア）
     */
    private handleYtomoPageImmediate(): void {
        // ytomoページ判定
        if (window.location.pathname !== '/ytomo') {
            return;
        }
        
        this.logger.info('ytomoページ検出 - mainタグを即座にクリア');
        
        // mainタグを探して即座にクリア
        const waitForMainAndClear = () => {
            const mainElement = document.querySelector('main');
            if (mainElement) {
                mainElement.innerHTML = '';
                
                // 読み込み中表示を追加
                const loadingContainer = document.createElement('div');
                loadingContainer.className = 'ytomo-loading-container';
                loadingContainer.innerHTML = `
                    <div class="ytomo-loading-content">
                        <div class="ytomo-loading-spinner"></div>
                        <div class="ytomo-loading-text">読み込み中...</div>
                    </div>
                `;
                mainElement.appendChild(loadingContainer);
                
                // スタイルは_ytomo-page.scssで管理
                
                this.logger.info('ytomoページmainタグクリア完了');
            } else {
                // mainタグが見つからない場合は100ms後に再試行
                setTimeout(waitForMainAndClear, 100);
            }
        };
        
        waitForMainAndClear();
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
        this.logger.info('Vue統合ダイアログ表示（Vueコンポーネントで実装済み）');
        // Vueコンポーネントで実装済み
    }

    /**
     * メインダイアログを非表示
     */
    hideMainDialog(): void {
        this.logger.info('Vue統合ダイアログ非表示（Vueコンポーネントで実装済み）');
        // Vueコンポーネントで実装済み
    }

    /**
     * システムをクリーンアップ
     */
    cleanup(): void {
        this.logger.info('メインダイアログFABシステムクリーンアップ');
        
        // Vue appをアンマウント
        if (this.vueApp) {
            this.vueApp.unmount();
            this.vueApp = null;
        }
        
        // マウントポイントを削除
        if (this.appMountPoint) {
            this.appMountPoint.remove();
            this.appMountPoint = null;
        }
        
        this.logger.info('メインダイアログFABシステムクリーンアップ完了');
    }
}

// グローバルインスタンス
let mainDialogFabInstance: MainDialogFab | null = null;

/**
 * 現在のページでメインダイアログFABを初期化
 */
export const initializeMainDialogFab = (): void => {
    if (mainDialogFabInstance) {
        const logger = loggers.ui;
        logger.debug('メインダイアログFAB既存インスタンス削除');
        mainDialogFabInstance.cleanup();
    }
    
    mainDialogFabInstance = new MainDialogFabImpl();
    mainDialogFabInstance.initialize();
};

// 自動初期化（DOMContentLoaded時）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        const logger = loggers.ui;
        logger.debug('DOM読み込み完了 - ストア事前初期化');
        
        // ストア初期化を先に実行
        const tempInstance = new MainDialogFabImpl()
        await tempInstance.preInitializeVueSystem()
        
        setTimeout(() => {
            initializeMainDialogFab();
        }, 100);
    });
} else {
    const logger = loggers.ui;
    logger.debug('DOM既読み込み済み - ストア事前初理化');
    
    // ストア初期化を先に実行
    (async () => {
        const tempInstance = new MainDialogFabImpl()
        await tempInstance.preInitializeVueSystem()
        
        setTimeout(() => {
            initializeMainDialogFab();
        }, 100);
    })()
}