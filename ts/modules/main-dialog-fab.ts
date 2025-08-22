import { PageChecker } from './page-utils';
import { getTicketManager, TicketManager } from './ticket-manager';

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
    private ticketManager!: TicketManager;

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

        // チケットマネージャーを初期化
        this.ticketManager = getTicketManager();

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

        console.log('🎫 チケットタブ初期化開始');

        // ローディング表示
        ticketTab.innerHTML = `
            <div class="ytomo-loading">
                <p>チケット情報を読み込み中...</p>
            </div>
        `;

        try {
            // チケット情報を取得
            const tickets = await this.ticketManager.loadAllTickets();
            const availableDates = this.ticketManager.getAvailableDates();

            // チケットタブUIを構築
            this.buildTicketTabUI(ticketTab as HTMLElement, tickets, availableDates);

            // タブカウント更新
            this.updateTicketTabCount();

            console.log('✅ チケットタブ初期化完了');

        } catch (error) {
            console.error('❌ チケットタブ初期化エラー:', error);
            
            // エラー表示
            ticketTab.innerHTML = `
                <div class="ytomo-error">
                    <h3>⚠️ チケット情報の取得に失敗しました</h3>
                    <p>ログインしているか確認してください</p>
                    <button class="ytomo-button retry-button">再試行</button>
                </div>
            `;

            // 再試行ボタンのイベント
            const retryButton = ticketTab.querySelector('.retry-button');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    this.initializeTicketTab();
                });
            }
        }
    }

    /**
     * チケットタブUIを構築
     */
    private buildTicketTabUI(container: HTMLElement, tickets: any[], availableDates: string[]): void {
        container.innerHTML = `
            <div class="ytomo-ticket-tab">
                <!-- チケット簡易選択エリア -->
                <div class="ytomo-quick-select">
                    <div class="ytomo-quick-select-header">
                        <label class="ytomo-toggle-container">
                            <input type="checkbox" id="own-only-toggle" class="ytomo-toggle-input">
                            <span class="ytomo-toggle-slider"></span>
                            <span class="ytomo-toggle-label">自分のチケットのみ</span>
                        </label>
                    </div>
                    <div class="ytomo-date-buttons" id="date-buttons-container">
                        ${this.buildDateButtons(availableDates)}
                    </div>
                </div>

                <!-- チケット一覧エリア -->
                <div class="ytomo-ticket-list" id="ticket-list-container">
                    ${this.buildTicketList(tickets)}
                </div>

                <!-- チケット追加エリア -->
                <div class="ytomo-add-ticket">
                    <h4>🎫 チケットID追加</h4>
                    <div class="ytomo-add-ticket-form">
                        <input type="text" id="ticket-id-input" placeholder="チケットIDを入力" class="ytomo-input">
                        <input type="text" id="ticket-label-input" placeholder="ラベル（任意）" class="ytomo-input">
                        <button id="add-ticket-button" class="ytomo-button primary">追加</button>
                    </div>
                </div>
            </div>
        `;

        // イベントリスナーを設定
        this.setupTicketTabEventListeners(container);
    }

    /**
     * 日付ボタンを構築
     */
    private buildDateButtons(dates: string[]): string {
        return dates.map(date => {
            const formattedDate = this.formatDate(date);
            return `
                <button class="ytomo-date-button" data-date="${date}">
                    ${formattedDate}
                </button>
            `;
        }).join('');
    }

    /**
     * チケット一覧を構築
     */
    private buildTicketList(tickets: any[]): string {
        if (tickets.length === 0) {
            return `
                <div class="ytomo-empty-state">
                    <p>チケットが見つかりませんでした</p>
                </div>
            `;
        }

        return tickets.map(ticket => `
            <div class="ytomo-ticket-item" data-ticket-id="${ticket.id}">
                <div class="ytomo-ticket-header">
                    <span class="ytomo-ticket-id">${ticket.id}</span>
                    ${ticket.isOwn ? 
                        '<span class="ytomo-me-tip">Me</span>' : 
                        `<span class="ytomo-label-tag">${ticket.label || '外部'}</span>`
                    }
                </div>
                <div class="ytomo-ticket-body">
                    <div class="ytomo-entrance-dates">
                        ${this.buildEntranceDateButtons(ticket.entranceDates)}
                    </div>
                    <div class="ytomo-reservation-types">
                        ${this.buildReservationTypes(ticket.reservationTypes)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * 入場日時ボタンを構築
     */
    private buildEntranceDateButtons(dates: string[]): string {
        return dates.map(date => `
            <button class="ytomo-entrance-date-button" data-date="${date}">
                ${this.formatDate(date)}
            </button>
        `).join('');
    }

    /**
     * 予約種類表示を構築
     */
    private buildReservationTypes(types: any[]): string {
        if (types.length === 0) {
            return '<span class="ytomo-no-reservation-types">予約種類不明</span>';
        }

        return types.map(type => `
            <span class="ytomo-reservation-type ${type.isActive ? 'active' : 'inactive'}">
                ${type.type}
            </span>
        `).join('');
    }

    /**
     * 日付フォーマット
     */
    private formatDate(dateStr: string): string {
        try {
            const date = new Date(dateStr);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        } catch {
            return dateStr;
        }
    }

    /**
     * チケットタブのイベントリスナーを設定
     */
    private setupTicketTabEventListeners(container: HTMLElement): void {
        // 自分のみトグル
        const ownOnlyToggle = container.querySelector('#own-only-toggle') as HTMLInputElement;
        if (ownOnlyToggle) {
            ownOnlyToggle.addEventListener('change', () => {
                this.handleOwnOnlyToggle(ownOnlyToggle.checked);
            });
        }

        // 日付ボタン
        const dateButtons = container.querySelectorAll('.ytomo-date-button');
        dateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const date = target.dataset['date'];
                if (date) {
                    this.handleDateSelection(date, ownOnlyToggle?.checked || false);
                }
            });
        });

        // チケット追加
        const addButton = container.querySelector('#add-ticket-button');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.handleAddTicket();
            });
        }

        // Enter キーでチケット追加
        const ticketIdInput = container.querySelector('#ticket-id-input') as HTMLInputElement;
        const labelInput = container.querySelector('#ticket-label-input') as HTMLInputElement;
        
        [ticketIdInput, labelInput].forEach(input => {
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.handleAddTicket();
                    }
                });
            }
        });
    }

    /**
     * 自分のみトグル処理
     */
    private handleOwnOnlyToggle(ownOnly: boolean): void {
        console.log(`🔄 自分のみトグル: ${ownOnly}`);
        // 表示フィルター処理
        this.filterTicketDisplay(ownOnly);
    }

    /**
     * 日付選択処理
     */
    private handleDateSelection(date: string, ownOnly: boolean): void {
        console.log(`📅 日付選択: ${date} (自分のみ: ${ownOnly})`);
        
        // チケットマネージャーで日付別選択
        this.ticketManager.selectTicketsByDate(date, ownOnly);
        
        // UI更新
        this.updateTicketSelection();
        this.updateTicketTabCount();
    }

    /**
     * チケット追加処理
     */
    private async handleAddTicket(): Promise<void> {
        const ticketIdInput = this.mainDialogContainer?.querySelector('#ticket-id-input') as HTMLInputElement;
        const labelInput = this.mainDialogContainer?.querySelector('#ticket-label-input') as HTMLInputElement;
        
        if (!ticketIdInput) return;

        const ticketId = ticketIdInput.value.trim();
        const label = labelInput?.value.trim() || '外部チケット';

        if (!ticketId) {
            alert('チケットIDを入力してください');
            return;
        }

        try {
            await this.ticketManager.addExternalTicket(ticketId, label);
            
            // 成功時はタブを再初期化
            await this.initializeTicketTab();
            
            // 入力をクリア
            ticketIdInput.value = '';
            if (labelInput) labelInput.value = '';

            console.log(`✅ チケット追加成功: ${ticketId}`);

        } catch (error) {
            console.error('❌ チケット追加エラー:', error);
            alert(`チケット追加に失敗しました: ${error}`);
        }
    }

    /**
     * チケット表示フィルター
     */
    private filterTicketDisplay(ownOnly: boolean): void {
        const ticketItems = this.mainDialogContainer?.querySelectorAll('.ytomo-ticket-item');
        
        ticketItems?.forEach(item => {
            const ticketId = (item as HTMLElement).dataset['ticketId'];
            const ticket = this.ticketManager.getAllTickets().find(t => t.id === ticketId);
            
            if (ticket) {
                if (ownOnly && !ticket.isOwn) {
                    (item as HTMLElement).style.display = 'none';
                } else {
                    (item as HTMLElement).style.display = '';
                }
            }
        });
    }

    /**
     * チケット選択状態をUI更新
     */
    private updateTicketSelection(): void {
        const selectedTickets = this.ticketManager.getSelectedTickets();
        const selectedIds = new Set(selectedTickets.map(t => t.id));

        // チケット項目の選択状態を更新
        const ticketItems = this.mainDialogContainer?.querySelectorAll('.ytomo-ticket-item');
        ticketItems?.forEach(item => {
            const ticketId = (item as HTMLElement).dataset['ticketId'];
            if (ticketId && selectedIds.has(ticketId)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    /**
     * チケットタブカウントを更新
     */
    private updateTicketTabCount(): void {
        const count = this.ticketManager.getSelectedTicketCount();
        const tabCount = this.mainDialogContainer?.querySelector('#ticket-count');
        
        if (tabCount) {
            tabCount.textContent = count > 0 ? ` (${count})` : '';
        }
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