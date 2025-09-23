import { PageChecker } from './page-utils';
import { RouterUtils } from './router-utils';
import { createApp, type App } from 'vue'
import { pinia } from '../stores'
import RootApp from '../App.vue'
import { loggers } from '../utils/logger'
import { useTicketsStore } from '../stores/tickets'
import { usePavilionsStore } from '../stores/pavilions'
import { checkLoginStatus, checkLoginAndRedirect } from '../utils/auth'
import { isApiUsageSuppressed } from '../utils/apiUsageMode'

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
     * FAB機能は廃止のため、常にスキップ
     */
    initialize(): void {
        this.logger.info('FAB機能は廃止のためメインダイアログFAB初期化をスキップ');
        
        // ただし、ytomoページナビゲーション機能は追加
        this.addYtomoNavigationButton();
        return;
    }
    
    /**
     * ページ読み込み時のVue統合システム事前初期化
     * ytomoページでのみVueアプリケーション埋め込み用
     */
    async preInitializeVueSystem(): Promise<void> {
        // 待機室ページでは事前初期化をスキップ
        if (PageChecker.isWaitingRoomPage()) {
            this.logger.info('待機室ページのためVue事前初期化をスキップ');
            return;
        }
        
        // ytomoページ以外では事前初期化をスキップ（FAB廃止のため）
        if (!PageChecker.isYtomoPage()) {
            this.logger.info('ytomoページ以外のためVue事前初期化をスキップ（FAB廃止）');
            return;
        }

        this.logger.info('Vue統合システム事前初期化開始');
        
        // ログイン状態確認
        try {
            // ytomoページの場合は、未ログイン時に自動リダイレクト
            const isYtomoPage = PageChecker.isYtomoPage()
            let isLoggedIn: boolean
            
            if (isYtomoPage) {
                this.logger.info('ytomoページ検出 - 未ログイン時は自動リダイレクト実行')
                isLoggedIn = await checkLoginAndRedirect()
            } else {
                isLoggedIn = await checkLoginStatus()
            }
            
            if (!isLoggedIn) {
                this.logger.warn('未ログイン状態のため初期化をスキップします')
                return
            }
            
            this.logger.info('ログイン済み確認 - ストア初期化を開始')
        } catch (error) {
            this.logger.error('ログイン状態確認エラー - 初期化をスキップします', error)
            return
        }
        
        // ストア初期化は後でVueアプリマウント後に行う
        this.initializeVueApp()
        
        this.logger.info('Vue事前初期化完了')
    }
    
    /**
     * Vueアプリケーションを初期化してマウント
     */
    private initializeVueApp(): void {
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
            
            this.logger.info('Vueアプリケーション初期化・マウント完了');
            
            // マウント後にストア初期化
            this.initializeStores();
            
        } catch (error) {
            this.logger.error('Vueアプリケーション初期化エラー', error);
        }
    }
    
    /**
     * Piniaストアを初期化
     */
    private async initializeStores(): Promise<void> {
        try {
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
     * ytomoページの即座処理（mainタグクリア）
     */
    private handleYtomoPageImmediate(): void {
        // ytomoページ判定（PageChecker統一）
        if (!PageChecker.isYtomoPage()) {
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
     * ドロワーメニューにytomoページ移動ボタンを追加
     * https://ticket.expo2025.or.jp/ から始まるすべてのページで追加
     */
    private addYtomoNavigationButton(): void {
        // ticket.expo2025.or.jpドメインのみで実行
        if (!window.location.hostname.includes('ticket.expo2025.or.jp')) {
            return;
        }
        
        this.logger.info('ドロワーメニューにytomoページボタン追加処理開始');
        
        const waitForDrawerAndAddButton = () => {
            // ドロワーメニューのul要素を検索
            const drawerUl = document.querySelector('#drawer ul[class*="style_gnav__"]');
            
            if (drawerUl) {
                // 既存のytomoボタンが存在するかチェック
                const existingYtomoButton = drawerUl.querySelector('[data-href="/ytomo"]');
                if (existingYtomoButton) {
                    this.logger.debug('ytomoナビゲーションボタンは既に存在します');
                    return;
                }
                
                // ytomoページへの遷移が現在のページと同じかチェック
                const isCurrentPage = PageChecker.isYtomoPage();
                
                // 公式スタイルに合わせたytomoページ移動ボタンのli要素を作成
                const ytomoLi = document.createElement('li');
                
                // ボタン要素を作成（公式構造に合わせる）
                const ytomoButton = document.createElement('button');
                ytomoButton.type = 'button';
                ytomoButton.tabIndex = 0;
                if (isCurrentPage) {
                    ytomoButton.disabled = true;
                }
                
                ytomoButton.innerHTML = `
                    <span class="style_renderer__ip0Pm">
                        <span data-target="_blank" data-href="/ytomo" data-display-type="accentfg" data-margin-type="navigation">
                            YTomo<img data-icon="new_window" alt="新規ウィンドウで開く" src="/asset/img/ico_newwin.svg">
                        </span>
                    </span>
                `;
                
                if (!isCurrentPage) {
                    ytomoButton.addEventListener('click', () => {
                        this.logger.info('ytomoページへ移動');
                        const success = RouterUtils.push('/ytomo');
                        if (!success) {
                            this.logger.warn('Router.push失敗、location.hrefにフォールバック');
                            window.location.href = '/ytomo';
                        }
                    });
                }
                
                ytomoLi.appendChild(ytomoButton);
                
                // ul要素の最初の子要素として追加
                drawerUl.insertBefore(ytomoLi, drawerUl.firstChild);
                
                this.logger.info('ytomoナビゲーションボタン追加完了');
            } else {
                // ドロワーメニューが見つからない場合は100ms後に再試行
                setTimeout(waitForDrawerAndAddButton, 100);
            }
        };
        
        waitForDrawerAndAddButton();
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
        logger.debug('DOM読み込み完了 - 統合初期化');
        
        // ストア事前初期化とFAB初期化を一度に実行
        mainDialogFabInstance = new MainDialogFabImpl();
        await mainDialogFabInstance.preInitializeVueSystem();
        mainDialogFabInstance.initialize();
    });
} else {
    const logger = loggers.ui;
    logger.debug('DOM既読み込み済み - 統合初期化');
    
    // ストア事前初期化とFAB初期化を一度に実行
    (async () => {
        mainDialogFabInstance = new MainDialogFabImpl();
        await mainDialogFabInstance.preInitializeVueSystem();
        mainDialogFabInstance.initialize();
    })()
}