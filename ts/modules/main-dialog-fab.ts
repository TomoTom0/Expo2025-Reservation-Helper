import { PageChecker } from './page-utils';

/**
 * メインダイアログ用FAB「yt」ボタン実装
 * 既存のFABシステムに統合してメインダイアログを開くボタンを追加
 */

let mainDialogVisible = false;

export interface MainDialogFab {
    initialize(): void;
    addYTFabButton(): void;
    showMainDialog(): void;
    hideMainDialog(): void;
    cleanup(): void;
}

/**
 * YTFABボタンの実装
 */
export class MainDialogFabImpl implements MainDialogFab {
    private ytFabButton: HTMLElement | null = null;
    private mainDialogContainer: HTMLElement | null = null;

    /**
     * メインダイアログFABシステムを初期化
     */
    initialize(): void {
        console.log('🎯 メインダイアログFAB初期化開始');
        
        // ticket.expo2025.or.jp でのみ動作
        if (!PageChecker.isTicketSite()) {
            console.log('⚠️ チケットサイト以外では初期化をスキップ');
            return;
        }

        // 既存のFABコンテナを確認
        let fabContainer = document.getElementById('ytomo-fab-container');
        
        if (!fabContainer) {
            // FABコンテナがない場合は基本構造を作成
            this.createBasicFabContainer();
            fabContainer = document.getElementById('ytomo-fab-container');
        }

        if (fabContainer) {
            this.addYTFabButton();
            console.log('✅ メインダイアログFAB初期化完了');
        } else {
            console.error('❌ FABコンテナの作成に失敗');
        }
    }

    /**
     * 基本的なFABコンテナを作成（既存システムがない場合）
     */
    private createBasicFabContainer(): void {
        const fabContainer = document.createElement('div');
        fabContainer.id = 'ytomo-fab-container';
        fabContainer.className = 'ytomo-fab-container z-normal';
        document.body.appendChild(fabContainer);
    }

    /**
     * YTボタンをFABシステムに追加
     */
    addYTFabButton(): void {
        const fabContainer = document.getElementById('ytomo-fab-container');
        if (!fabContainer) {
            console.error('❌ FABコンテナが見つかりません');
            return;
        }

        // 既存のYTボタンを削除
        const existingYTButton = document.getElementById('ytomo-yt-fab');
        if (existingYTButton) {
            existingYTButton.remove();
        }

        // YTボタンを作成
        this.ytFabButton = document.createElement('button');
        this.ytFabButton.id = 'ytomo-yt-fab';
        this.ytFabButton.className = 'ytomo-sub-fab ytomo-yt-button';
        this.ytFabButton.innerHTML = `
            <span class="ytomo-fab-icon">YT</span>
        `;
        this.ytFabButton.title = 'メインダイアログを開く';

        // クリックイベントを設定
        this.ytFabButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMainDialog();
        });

        // FABコンテナに追加（メインFABボタンの手前に配置）
        const mainFab = fabContainer.querySelector('#ytomo-main-fab');
        if (mainFab) {
            fabContainer.insertBefore(this.ytFabButton, mainFab);
        } else {
            fabContainer.appendChild(this.ytFabButton);
        }

        console.log('✅ YTボタンをFABに追加');
    }

    /**
     * メインダイアログの表示切り替え
     */
    private toggleMainDialog(): void {
        if (mainDialogVisible) {
            this.hideMainDialog();
        } else {
            this.showMainDialog();
        }
    }

    /**
     * メインダイアログを表示
     */
    showMainDialog(): void {
        console.log('🎯 メインダイアログ表示');
        
        // 既存のダイアログを削除
        this.hideMainDialog();

        // メインダイアログコンテナを作成
        this.mainDialogContainer = document.createElement('div');
        this.mainDialogContainer.id = 'ytomo-main-dialog';
        this.mainDialogContainer.className = 'ytomo-dialog-overlay';

        // ダイアログ内容を作成
        this.mainDialogContainer.innerHTML = `
            <div class="ytomo-dialog ytomo-main-dialog">
                <div class="ytomo-dialog-header">
                    <h2 class="ytomo-dialog-title">万博予約ツール</h2>
                    <button class="ytomo-dialog-close" aria-label="閉じる">×</button>
                </div>
                <div class="ytomo-dialog-body">
                    <div class="ytomo-tab-navigation">
                        <button class="ytomo-tab-button active" data-tab="ticket">
                            チケット<span class="ytomo-tab-count" id="ticket-count"></span>
                        </button>
                        <button class="ytomo-tab-button" data-tab="pavilion">
                            パビリオン<span class="ytomo-tab-type" id="pavilion-type"></span>
                        </button>
                        <button class="ytomo-tab-button" data-tab="third">
                            その他
                        </button>
                    </div>
                    <div class="ytomo-tab-content">
                        <div class="ytomo-tab-pane active" id="ticket-tab">
                            <div class="ytomo-loading">
                                <p>チケット情報を読み込み中...</p>
                            </div>
                        </div>
                        <div class="ytomo-tab-pane" id="pavilion-tab">
                            <div class="ytomo-loading">
                                <p>パビリオン情報を読み込み中...</p>
                            </div>
                        </div>
                        <div class="ytomo-tab-pane" id="third-tab">
                            <div class="ytomo-placeholder">
                                <p>この機能は今後実装予定です</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // DOMに追加
        document.body.appendChild(this.mainDialogContainer);

        // イベントリスナーを設定
        this.setupDialogEventListeners();

        // 表示状態を更新
        mainDialogVisible = true;

        // 初期化処理を開始
        this.initializeDialogContent();
    }

    /**
     * メインダイアログを非表示
     */
    hideMainDialog(): void {
        if (this.mainDialogContainer) {
            this.mainDialogContainer.remove();
            this.mainDialogContainer = null;
        }
        mainDialogVisible = false;
        console.log('🎯 メインダイアログ非表示');
    }

    /**
     * ダイアログのイベントリスナーを設定
     */
    private setupDialogEventListeners(): void {
        if (!this.mainDialogContainer) return;

        // 閉じるボタン
        const closeButton = this.mainDialogContainer.querySelector('.ytomo-dialog-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideMainDialog();
            });
        }

        // オーバーレイクリックで閉じる
        this.mainDialogContainer.addEventListener('click', (e) => {
            if (e.target === this.mainDialogContainer) {
                this.hideMainDialog();
            }
        });

        // Escキーで閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainDialogVisible) {
                this.hideMainDialog();
            }
        });

        // タブ切り替え
        const tabButtons = this.mainDialogContainer.querySelectorAll('.ytomo-tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const tabName = target.dataset['tab'];
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
    }

    /**
     * タブを切り替え
     */
    private switchTab(tabName: string): void {
        if (!this.mainDialogContainer) return;

        // タブボタンの状態を更新
        const tabButtons = this.mainDialogContainer.querySelectorAll('.ytomo-tab-button');
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if ((button as HTMLElement).dataset['tab'] === tabName) {
                button.classList.add('active');
            }
        });

        // タブコンテンツの状態を更新
        const tabPanes = this.mainDialogContainer.querySelectorAll('.ytomo-tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${tabName}-tab`) {
                pane.classList.add('active');
            }
        });

        console.log(`🔄 タブ切り替え: ${tabName}`);
    }

    /**
     * ダイアログ内容の初期化
     */
    private async initializeDialogContent(): Promise<void> {
        console.log('🔄 ダイアログ内容初期化開始');
        
        try {
            // チケットタブの初期化
            await this.initializeTicketTab();
            
            // パビリオンタブの初期化
            await this.initializePavilionTab();
            
            console.log('✅ ダイアログ内容初期化完了');
        } catch (error) {
            console.error('❌ ダイアログ内容初期化エラー:', error);
        }
    }

    /**
     * チケットタブの初期化
     */
    private async initializeTicketTab(): Promise<void> {
        const ticketTab = this.mainDialogContainer?.querySelector('#ticket-tab');
        if (!ticketTab) return;

        // 一旦プレースホルダーを表示
        ticketTab.innerHTML = `
            <div class="ytomo-tab-placeholder">
                <h3>🎫 チケット管理</h3>
                <p>チケット統合管理システムは次のフェーズで実装予定です</p>
                <div class="ytomo-feature-preview">
                    <h4>実装予定機能:</h4>
                    <ul>
                        <li>自分のチケット一覧表示</li>
                        <li>他人のチケットID追加</li>
                        <li>日付別チケット選択</li>
                        <li>入場予約状況表示</li>
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * パビリオンタブの初期化
     */
    private async initializePavilionTab(): Promise<void> {
        const pavilionTab = this.mainDialogContainer?.querySelector('#pavilion-tab');
        if (!pavilionTab) return;

        // 一旦プレースホルダーを表示
        pavilionTab.innerHTML = `
            <div class="ytomo-tab-placeholder">
                <h3>🏛️ パビリオン予約</h3>
                <p>パビリオン統合管理システムは次のフェーズで実装予定です</p>
                <div class="ytomo-feature-preview">
                    <h4>実装予定機能:</h4>
                    <ul>
                        <li>パビリオン検索</li>
                        <li>お気に入り管理</li>
                        <li>空き時間帯フィルター</li>
                        <li>予約実行機能</li>
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.hideMainDialog();
        
        if (this.ytFabButton) {
            this.ytFabButton.remove();
            this.ytFabButton = null;
        }
        
        console.log('🧹 メインダイアログFABクリーンアップ完了');
    }
}

// グローバルインスタンス
export const mainDialogFab = new MainDialogFabImpl();

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