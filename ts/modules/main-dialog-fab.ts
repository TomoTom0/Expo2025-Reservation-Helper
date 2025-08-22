import { PageChecker } from './page-utils';
import { getTicketManager, TicketManager } from './ticket-manager';
import { getPavilionManager, PavilionManager } from './pavilion-manager';

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
    private pavilionManager!: PavilionManager;

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
        
        // パビリオンマネージャーを初期化
        this.pavilionManager = getPavilionManager();

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

        console.log('🏛️ パビリオンタブ初期化開始');

        // ローディング表示
        pavilionTab.innerHTML = `
            <div class="ytomo-loading">
                <p>パビリオン情報を読み込み中...</p>
            </div>
        `;

        try {
            // 選択チケットを取得
            const selectedTickets = this.ticketManager.getSelectedTickets();
            
            // 予約種類を判定
            const reservationType = this.determineReservationType(selectedTickets);
            
            // パビリオンタブUIを構築
            this.buildPavilionTabUI(pavilionTab as HTMLElement, reservationType);

            // タブタイプ更新
            this.updatePavilionTabType(reservationType);

            console.log('✅ パビリオンタブ初期化完了');

        } catch (error) {
            console.error('❌ パビリオンタブ初期化エラー:', error);
            
            // エラー表示
            pavilionTab.innerHTML = `
                <div class="ytomo-error">
                    <h3>⚠️ パビリオン情報の取得に失敗しました</h3>
                    <p>チケットが選択されているか確認してください</p>
                    <button class="ytomo-button retry-button">再試行</button>
                </div>
            `;

            // 再試行ボタンのイベント
            const retryButton = pavilionTab.querySelector('.retry-button');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    this.initializePavilionTab();
                });
            }
        }
    }

    /**
     * パビリオンタブUIを構築
     */
    private buildPavilionTabUI(container: HTMLElement, _reservationType: string): void {
        container.innerHTML = `
            <div class="ytomo-pavilion-tab">
                <!-- 検索コントロールエリア -->
                <div class="ytomo-search-controls">
                    <div class="ytomo-search-input-container">
                        <input type="text" id="pavilion-search-input" placeholder="パビリオン名で検索" class="ytomo-search-input">
                    </div>
                    <div class="ytomo-control-buttons">
                        <button id="search-button" class="ytomo-icon-button" title="検索">
                            <span>🔍</span>
                        </button>
                        <button id="favorites-button" class="ytomo-icon-button" title="お気に入り">
                            <span>⭐</span>
                        </button>
                        <button id="filter-button" class="ytomo-icon-button" title="空きのみ表示">
                            <span>🔽</span>
                        </button>
                        <button id="refresh-button" class="ytomo-icon-button" title="更新">
                            <span>🔄</span>
                        </button>
                    </div>
                </div>

                <!-- パビリオン一覧エリア -->
                <div class="ytomo-pavilion-list" id="pavilion-list-container">
                    <div class="ytomo-empty-state">
                        <p>🔍 検索ボタンを押してパビリオンを検索してください</p>
                    </div>
                </div>

                <!-- 予約コントロールエリア -->
                <div class="ytomo-reservation-controls">
                    <div class="ytomo-selected-info" id="selected-info">
                        選択中: なし
                    </div>
                    <button id="reservation-button" class="ytomo-button primary" disabled>
                        予約実行
                    </button>
                    <div class="ytomo-result-display" id="result-display"></div>
                </div>
            </div>
        `;

        // イベントリスナーを設定
        this.setupPavilionTabEventListeners(container);
    }

    /**
     * 予約種類を判定
     */
    private determineReservationType(tickets: any[]): string {
        if (tickets.length === 0) return '1';
        
        // 最初のチケットの予約種類を使用
        const firstTicket = tickets[0];
        if (firstTicket.reservationTypes?.length > 0) {
            const type = firstTicket.reservationTypes[0].type;
            switch (type) {
                case '1日券': return '1';
                case '3日券': return '3';
                case '週末券': return '週';
                case '月間券': return '月';
                default: return '1';
            }
        }
        
        return '1';
    }

    /**
     * パビリオンタブのイベントリスナーを設定
     */
    private setupPavilionTabEventListeners(container: HTMLElement): void {
        // 検索ボタン
        const searchButton = container.querySelector('#search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.handlePavilionSearch();
            });
        }

        // お気に入りボタン
        const favoritesButton = container.querySelector('#favorites-button');
        if (favoritesButton) {
            favoritesButton.addEventListener('click', () => {
                this.handleLoadFavorites();
            });
        }

        // フィルターボタン
        const filterButton = container.querySelector('#filter-button');
        if (filterButton) {
            filterButton.addEventListener('click', () => {
                this.handleToggleFilter();
            });
        }

        // 更新ボタン
        const refreshButton = container.querySelector('#refresh-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.handleRefreshPavilions();
            });
        }

        // 予約ボタン
        const reservationButton = container.querySelector('#reservation-button');
        if (reservationButton) {
            reservationButton.addEventListener('click', () => {
                this.handleMakeReservation();
            });
        }

        // 検索入力でEnterキー
        const searchInput = container.querySelector('#pavilion-search-input') as HTMLInputElement;
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handlePavilionSearch();
                }
            });
        }
    }

    /**
     * パビリオン検索処理
     */
    private async handlePavilionSearch(): Promise<void> {
        console.log('🔍 パビリオン検索実行');

        const searchInput = this.mainDialogContainer?.querySelector('#pavilion-search-input') as HTMLInputElement;
        const query = searchInput?.value.trim() || '';

        try {
            this.showPavilionLoading('検索中...');

            const selectedTickets = this.ticketManager.getSelectedTickets();
            const ticketIds = selectedTickets.map(t => t.id);

            const pavilions = await this.pavilionManager.searchPavilions(query, ticketIds);
            this.displayPavilions(pavilions);

            console.log(`✅ パビリオン検索完了: ${pavilions.length}個`);

        } catch (error) {
            console.error('❌ パビリオン検索エラー:', error);
            this.showPavilionError('検索に失敗しました');
        }
    }

    /**
     * お気に入り読み込み処理
     */
    private async handleLoadFavorites(): Promise<void> {
        console.log('⭐ お気に入り読み込み');

        try {
            this.showPavilionLoading('お気に入りを読み込み中...');

            const pavilions = await this.pavilionManager.loadFavoritePavilions();
            this.displayPavilions(pavilions);

            console.log(`✅ お気に入り読み込み完了: ${pavilions.length}個`);

        } catch (error) {
            console.error('❌ お気に入り読み込みエラー:', error);
            this.showPavilionError('お気に入りの読み込みに失敗しました');
        }
    }

    /**
     * フィルター切り替え処理
     */
    private handleToggleFilter(): void {
        const filterButton = this.mainDialogContainer?.querySelector('#filter-button');
        const isActive = filterButton?.classList.contains('active');

        if (isActive) {
            filterButton?.classList.remove('active');
            console.log('🔽 フィルター無効化');
        } else {
            filterButton?.classList.add('active');
            console.log('🔽 フィルター有効化 - 空きのみ表示');
        }

        // 現在の表示を再フィルター
        this.applyCurrentFilter();
    }

    /**
     * パビリオン更新処理
     */
    private async handleRefreshPavilions(): Promise<void> {
        console.log('🔄 パビリオン情報更新');

        try {
            this.showPavilionLoading('更新中...');

            const pavilions = await this.pavilionManager.refreshPavilionData();
            this.displayPavilions(pavilions);

            console.log(`✅ パビリオン更新完了: ${pavilions.length}個`);

        } catch (error) {
            console.error('❌ パビリオン更新エラー:', error);
            this.showPavilionError('更新に失敗しました');
        }
    }

    /**
     * 予約実行処理
     */
    private async handleMakeReservation(): Promise<void> {
        console.log('🎯 予約実行開始');

        const selectedTimeSlots = this.pavilionManager.getSelectedTimeSlots();
        if (selectedTimeSlots.length === 0) {
            this.showReservationResult('時間帯を選択してください', 'error');
            return;
        }

        const selectedTickets = this.ticketManager.getSelectedTickets();
        if (selectedTickets.length === 0) {
            this.showReservationResult('チケットを選択してください', 'error');
            return;
        }

        try {
            // 最初の選択時間帯で予約実行
            const { pavilionId, timeSlot } = selectedTimeSlots[0];
            
            this.showReservationResult('予約処理中...', 'info');

            const result = await this.pavilionManager.makeReservation(
                pavilionId,
                timeSlot,
                selectedTickets
            );

            if (result.success) {
                this.showReservationResult(
                    `🎉 予約成功！${result.details?.pavilionName} ${result.details?.timeSlot}～`,
                    'success'
                );
                
                // UI更新
                this.updateSelectedInfo();
                this.updateReservationButton();
                
            } else {
                this.showReservationResult(`❌ ${result.message}`, 'error');
            }

        } catch (error) {
            console.error('❌ 予約実行エラー:', error);
            this.showReservationResult(`❌ 予約に失敗しました: ${error}`, 'error');
        }
    }

    /**
     * パビリオン一覧を表示
     */
    private displayPavilions(pavilions: any[]): void {
        const container = this.mainDialogContainer?.querySelector('#pavilion-list-container');
        if (!container) return;

        if (pavilions.length === 0) {
            container.innerHTML = `
                <div class="ytomo-empty-state">
                    <p>パビリオンが見つかりませんでした</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pavilions.map(pavilion => `
            <div class="ytomo-pavilion-item" data-pavilion-id="${pavilion.id}">
                <div class="ytomo-pavilion-header">
                    <button class="ytomo-star-button ${pavilion.isFavorite ? 'favorite' : ''}" 
                            data-pavilion-id="${pavilion.id}" data-pavilion-name="${pavilion.name}">
                        ${pavilion.isFavorite ? '⭐' : '☆'}
                    </button>
                    <label class="ytomo-pavilion-checkbox-container">
                        <input type="checkbox" class="ytomo-pavilion-checkbox" data-pavilion-id="${pavilion.id}">
                    </label>
                    <span class="ytomo-pavilion-name">${pavilion.name}</span>
                    <button class="ytomo-expand-button" data-pavilion-id="${pavilion.id}">
                        ▼
                    </button>
                </div>
                <div class="ytomo-time-slots" id="time-slots-${pavilion.id}">
                    ${this.buildTimeSlotButtons(pavilion.timeSlots, pavilion.id)}
                </div>
            </div>
        `).join('');

        // イベントリスナーを設定
        this.setupPavilionItemEventListeners(container as HTMLElement);
    }

    /**
     * 時間帯ボタンを構築
     */
    private buildTimeSlotButtons(timeSlots: any[], pavilionId: string): string {
        return timeSlots.map(slot => `
            <button class="ytomo-time-slot-button ${slot.available ? 'available' : 'unavailable'} ${slot.selected ? 'selected' : ''}"
                    data-pavilion-id="${pavilionId}"
                    data-time="${slot.time}"
                    ${slot.available ? '' : 'disabled'}>
                ${slot.time}
                ${slot.endTime ? `～${slot.endTime}` : ''}
            </button>
        `).join('');
    }

    /**
     * パビリオン項目のイベントリスナーを設定
     */
    private setupPavilionItemEventListeners(container: HTMLElement): void {
        // お気に入りボタン
        const starButtons = container.querySelectorAll('.ytomo-star-button');
        starButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const pavilionId = target.dataset['pavilionId'];
                const pavilionName = target.dataset['pavilionName'];
                
                if (pavilionId && pavilionName) {
                    this.toggleFavorite(pavilionId, pavilionName, target);
                }
            });
        });

        // 時間帯ボタン
        const timeSlotButtons = container.querySelectorAll('.ytomo-time-slot-button');
        timeSlotButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const pavilionId = target.dataset['pavilionId'];
                const time = target.dataset['time'];
                
                if (pavilionId && time) {
                    this.selectTimeSlot(pavilionId, time, target);
                }
            });
        });

        // 展開ボタン
        const expandButtons = container.querySelectorAll('.ytomo-expand-button');
        expandButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const pavilionId = target.dataset['pavilionId'];
                
                if (pavilionId) {
                    this.toggleTimeSlotDisplay(pavilionId, target);
                }
            });
        });
    }

    /**
     * お気に入り切り替え
     */
    private toggleFavorite(pavilionId: string, pavilionName: string, button: HTMLElement): void {
        const isFavorite = button.classList.contains('favorite');
        
        if (isFavorite) {
            this.pavilionManager.removeFromFavorites(pavilionId);
            button.classList.remove('favorite');
            button.textContent = '☆';
        } else {
            this.pavilionManager.addToFavorites(pavilionId, pavilionName);
            button.classList.add('favorite');
            button.textContent = '⭐';
        }
    }

    /**
     * 時間帯選択
     */
    private selectTimeSlot(pavilionId: string, time: string, button: HTMLElement): void {
        const isSelected = button.classList.contains('selected');
        
        // 時間帯情報を構築
        const timeSlot = {
            time: time,
            available: !(button as HTMLButtonElement).disabled,
            selected: !isSelected,
            reservationType: '1日券' // TODO: 実際の予約種類を取得
        };

        // パビリオンマネージャーで選択状態を更新
        this.pavilionManager.selectTimeSlot(pavilionId, timeSlot);

        // UI更新
        if (isSelected) {
            button.classList.remove('selected');
        } else {
            button.classList.add('selected');
        }

        // 選択情報とボタン状態を更新
        this.updateSelectedInfo();
        this.updateReservationButton();
    }

    /**
     * 時間帯表示切り替え
     */
    private toggleTimeSlotDisplay(pavilionId: string, button: HTMLElement): void {
        const timeSlotsContainer = this.mainDialogContainer?.querySelector(`#time-slots-${pavilionId}`);
        if (!timeSlotsContainer) return;

        const isExpanded = button.classList.contains('expanded');
        
        if (isExpanded) {
            timeSlotsContainer.classList.add('hidden');
            button.classList.remove('expanded');
            button.textContent = '▼';
        } else {
            timeSlotsContainer.classList.remove('hidden');
            button.classList.add('expanded');
            button.textContent = '▲';
        }
    }

    /**
     * 現在のフィルターを適用
     */
    private applyCurrentFilter(): void {
        const filterButton = this.mainDialogContainer?.querySelector('#filter-button');
        const isFilterActive = filterButton?.classList.contains('active');

        if (!isFilterActive) return;

        // 空きのみフィルターを適用
        const pavilionItems = this.mainDialogContainer?.querySelectorAll('.ytomo-pavilion-item');
        pavilionItems?.forEach(item => {
            const timeSlotButtons = item.querySelectorAll('.ytomo-time-slot-button.available');
            
            if (timeSlotButtons.length === 0) {
                (item as HTMLElement).style.display = 'none';
            } else {
                (item as HTMLElement).style.display = '';
            }
        });
    }

    /**
     * 選択情報を更新
     */
    private updateSelectedInfo(): void {
        const selectedTimeSlots = this.pavilionManager.getSelectedTimeSlots();
        const selectedInfo = this.mainDialogContainer?.querySelector('#selected-info');
        
        if (selectedInfo) {
            if (selectedTimeSlots.length === 0) {
                selectedInfo.textContent = '選択中: なし';
            } else {
                const { pavilionId, timeSlot } = selectedTimeSlots[0];
                selectedInfo.textContent = `選択中: ${pavilionId} ${timeSlot.time}`;
            }
        }
    }

    /**
     * 予約ボタン状態を更新
     */
    private updateReservationButton(): void {
        const reservationButton = this.mainDialogContainer?.querySelector('#reservation-button') as HTMLButtonElement;
        const selectedTimeSlots = this.pavilionManager.getSelectedTimeSlots();
        const selectedTickets = this.ticketManager.getSelectedTickets();
        
        if (reservationButton) {
            const canReserve = selectedTimeSlots.length > 0 && selectedTickets.length > 0;
            reservationButton.disabled = !canReserve;
        }
    }

    /**
     * パビリオンローディング表示
     */
    private showPavilionLoading(message: string): void {
        const container = this.mainDialogContainer?.querySelector('#pavilion-list-container');
        if (container) {
            container.innerHTML = `
                <div class="ytomo-loading">
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * パビリオンエラー表示
     */
    private showPavilionError(message: string): void {
        const container = this.mainDialogContainer?.querySelector('#pavilion-list-container');
        if (container) {
            container.innerHTML = `
                <div class="ytomo-error">
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * 予約結果表示
     */
    private showReservationResult(message: string, type: 'success' | 'error' | 'info'): void {
        const resultDisplay = this.mainDialogContainer?.querySelector('#result-display');
        if (!resultDisplay) return;

        resultDisplay.textContent = message;
        resultDisplay.className = `ytomo-result-display show ${type}`;

        // 10秒後に自動非表示
        setTimeout(() => {
            resultDisplay.classList.remove('show');
        }, 10000);
    }

    /**
     * パビリオンタブタイプを更新
     */
    private updatePavilionTabType(reservationType: string): void {
        const tabType = this.mainDialogContainer?.querySelector('#pavilion-type');
        if (tabType) {
            tabType.textContent = ` (${reservationType})`;
        }
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