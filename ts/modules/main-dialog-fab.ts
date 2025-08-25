import { PageChecker } from './page-utils';
import { getTicketManager, TicketManager, TicketData, ScheduleData } from './ticket-manager';
import { ReactiveTicketManager, getReactiveTicketManager } from './reactive-ticket-manager';
import { getPavilionManager, PavilionManager, PavilionData, PavilionTimeSlot } from './pavilion-manager';

/**
 * 抽選カレンダーデータ型定義
 */
interface LotteryCalendarData {
    availableSlots?: string[];
    status?: string;
    lottery_type?: string;
    registration_period?: {
        start: string;
        end: string;
    };
    // 実際に使用される他のフィールドがあれば追加
}

/**
 * メインダイアログ用FAB「yt」ボタン実装
 * 既存のFABシステムに統合してメインダイアログを開くボタンを追加
 */

let mainDialogVisible = false;

export interface MainDialogFab {
    initialize(): void;
    addYTFabButton(): void;
    showMainDialog(): Promise<void>;
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
    private reactiveTicketManager!: ReactiveTicketManager;
    private pavilionManager!: PavilionManager;
    private lastSearchResults: PavilionData[] = [];
    private isAvailableOnlyFilterActive: boolean = false;
    private dataPreloadPromise: Promise<void> | null = null;

    /**
     * ページ読み込み時点での事前データ読み込みを開始
     */
    startDataPreload(): void {
        if (this.dataPreloadPromise) return; // 既に開始済み
        
        console.log('🚀 メインダイアログ用データの事前読み込み開始');
        
        if (!PageChecker.isTicketSite()) {
            console.log('⚠️ チケットサイト以外では事前読み込みをスキップ');
            return;
        }
        
        this.dataPreloadPromise = this.preloadData();
    }
    
    /**
     * データの事前読み込み（バックグラウンド実行）
     */
    private async preloadData(): Promise<void> {
        try {
            // マネージャー初期化（軽量）
            this.ticketManager = getTicketManager();
            this.reactiveTicketManager = getReactiveTicketManager(this.ticketManager);
            this.pavilionManager = getPavilionManager();
            
            // 重いデータ読み込みを並列で開始
            const preloadPromises = [
                this.ticketManager.loadAllTickets(), // チケットデータ取得
                // パビリオンデータの事前読み込みは現在のAPIでは不可（検索条件が必要）
            ];
            
            await Promise.allSettled(preloadPromises);
            console.log('✅ メインダイアログ用データの事前読み込み完了');
            
        } catch (error) {
            console.warn('⚠️ メインダイアログ用データの事前読み込み中にエラー:', error);
        }
    }

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

        // 事前読み込みが未開始の場合は開始
        if (!this.dataPreloadPromise) {
            this.startDataPreload();
        }

        // マネージャーの初期化確認（事前読み込み済みの場合はスキップ）
        if (!this.ticketManager) {
            this.ticketManager = getTicketManager();
            this.reactiveTicketManager = getReactiveTicketManager(this.ticketManager);
            this.pavilionManager = getPavilionManager();
        }
        
        // リアクティブUI更新を設定
        this.setupReactiveUIUpdaters();

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
    private async toggleMainDialog(): Promise<void> {
        if (mainDialogVisible) {
            this.hideMainDialog();
        } else {
            await this.showMainDialog();
        }
    }

    /**
     * メインダイアログを表示
     */
    async showMainDialog(): Promise<void> {
        console.log('🎯 メインダイアログ表示');
        
        // 既存のダイアログを削除
        this.hideMainDialog();
        
        // チケットマネージャーにチケットデータをロード
        await this.reactiveTicketManager.loadAllTickets();
        
        // デバッグ: 読み込まれたチケットID一覧
        const loadedTickets = this.ticketManager.getAllTickets();
        console.log(`🎫 読み込まれたチケットID一覧:`, loadedTickets.map(t => `${t.ticket_id}`));

        // メインダイアログコンテナを作成
        this.mainDialogContainer = document.createElement('div');
        this.mainDialogContainer.id = 'ytomo-main-dialog';
        this.mainDialogContainer.className = 'ytomo-dialog-overlay';

        // ダイアログ内容を作成
        this.mainDialogContainer.innerHTML = `
            <div class="ytomo-dialog ytomo-main-dialog">
                <div class="ytomo-dialog-body">
                    <div class="ytomo-tab-navigation">
                        <button class="ytomo-tab-button active" data-tab="ticket">
                            チケット<span class="ytomo-tab-count" id="ticket-count"></span>
                        </button>
                        <button class="ytomo-tab-button" data-tab="pavilion">
                            <div class="ytomo-tab-content">
                                <div class="ytomo-tab-title">パビリオン</div>
                                <div class="ytomo-tab-dates" id="pavilion-tab-dates"></div>
                            </div>
                        </button>
                        <button class="ytomo-tab-button" data-tab="third">
                        </button>
                        <button class="ytomo-dialog-close" aria-label="閉じる">×</button>
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
                        </div>
                    </div>
                </div>
            </div>
        `;

        // DOMに追加
        document.body.appendChild(this.mainDialogContainer);

        // イベントリスナーを設定
        this.setupDialogEventListeners();
        this.setupPavilionTabEvents();

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
                const tabButton = target.closest('.ytomo-tab-button') as HTMLElement;
                const tabName = tabButton?.dataset['tab'];
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
        console.log(`🔍 タブ切り替え時のselectedTicketIds:`, Array.from(this.reactiveTicketManager.getSelectedTicketIds()));
    }

    /**
     * リアクティブUI更新を設定
     */
    private setupReactiveUIUpdaters(): void {
        // チケット選択関連のUI更新をまとめて登録
        this.reactiveTicketManager.registerUIUpdaters({
            ticketSelection: () => {
                this.updateTicketSelection();
                this.updateTicketTabCount();
                this.updateSelectedInfo();
                this.updatePavilionTabSelectedDates();
                this.updateReservationButton();
            },
            ticketList: () => {
                // チケット一覧が変更された場合の更新
                // 必要に応じて実装
            }
        });
        
        console.log('✅ リアクティブUI更新システム設定完了');
    }

    /**
     * ダイアログ内容の初期化
     */
    private async initializeDialogContent(): Promise<void> {
        console.log('🔄 ダイアログ内容初期化開始（並列処理）');
        
        try {
            // チケットタブとパビリオンタブの初期化を並列実行
            const [ticketResult, pavilionResult] = await Promise.allSettled([
                this.initializeTicketTab(),
                this.initializePavilionTab()
            ]);
            
            // 結果確認
            if (ticketResult.status === 'rejected') {
                console.error('❌ チケットタブ初期化エラー:', ticketResult.reason);
            }
            if (pavilionResult.status === 'rejected') {
                console.error('❌ パビリオンタブ初期化エラー:', pavilionResult.reason);
            }
            
            const successCount = [ticketResult, pavilionResult].filter(r => r.status === 'fulfilled').length;
            console.log(`✅ ダイアログ内容初期化完了 (成功: ${successCount}/2)`);
            
        } catch (error) {
            console.error('❌ ダイアログ内容初期化エラー:', error);
            
            // スマホ環境でのエラーアラート
            if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                alert(`スマホ環境: 初期化エラー\n${error}`);
            }
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
            console.log('⚡ チケットタブ初期化（事前読み込み活用）');
            
            // 事前読み込み完了を待機（既に完了している場合は即座に解決）
            if (this.dataPreloadPromise) {
                console.log('🔄 事前読み込み完了を待機中...');
                await this.dataPreloadPromise;
                console.log('✅ 事前読み込み完了');
            }
            
            // 事前読み込み済みデータを取得（キャッシュから）
            let tickets = this.ticketManager.getAllTickets();
            console.log(`📋 キャッシュからチケット取得: ${tickets.length}件`);
            
            // データがない場合は改めて読み込み（フォールバック）
            if (tickets.length === 0) {
                console.log('🔄 キャッシュが空、API呼び出し実行');
                tickets = await this.ticketManager.loadAllTickets();
            }
            
            console.log('🔍 チケットマネージャーデータ:', tickets);
            
            if (tickets.length === 0) {
                throw new Error('チケットデータが見つかりません');
            }
            
            const availableDates = await this.extractAvailableDates(tickets);

            // チケットタブUIを構築
            await this.buildTicketTabUI(ticketTab as HTMLElement, tickets, availableDates);

            // タブカウント更新
            this.updateTicketTabCount();

            // キャッシュから入場予約選択を復元
            this.restoreEntranceSelectionFromCache();

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
    private async buildTicketTabUI(container: HTMLElement, tickets: TicketData[], availableDates: string[]): Promise<void> {
        container.innerHTML = `
            <div class="ytomo-ticket-tab">
                <!-- チケット簡易選択エリア -->
                <div class="ytomo-quick-select">
                    <label class="ytomo-toggle-container">
                        <input type="checkbox" id="own-only-toggle" class="ytomo-toggle-input">
                        <span class="ytomo-toggle-slider"></span>
                        <span class="ytomo-toggle-label">自分</span>
                    </label>
                    ${this.buildDateButtons(availableDates)}
                </div>

                <!-- チケット一覧エリア -->
                <div class="ytomo-ticket-list" id="ticket-list-container">
                    ${await this.buildTicketList(tickets)}
                </div>

                <!-- チケットID追加（同様のレイアウト） -->
                <div class="ytomo-ticket-item ytomo-add-ticket-item">
                    <div class="ytomo-ticket-upper">
                        <input type="text" id="ticket-id-input" placeholder="チケットID" class="ytomo-input-inline ytomo-input-ticket-id">
                        <input type="text" id="ticket-label-input" placeholder="Label" class="ytomo-input-inline ytomo-input-label">
                        <select id="channel-select" class="ytomo-select-inline">
                            <option value="5">1</option>
                            <option value="4">3</option>
                            <option value="3">週</option>
                            <option value="2">月</option>
                        </select>
                        <button id="add-ticket-button" class="ytomo-button primary">Add</button>
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
     * チケット一覧を構築（調査結果に基づく）
     */
    private async buildTicketList(tickets: TicketData[]): Promise<string> {
        if (tickets.length === 0) {
            return `
                <div class="ytomo-empty-state">
                    <p>チケットが見つかりませんでした</p>
                </div>
            `;
        }

        // 有効な入場予約があるチケットのみ表示
        const validTickets = tickets.filter(ticket => {
            const schedules = ticket.schedules || [];
            return schedules.some((schedule: ScheduleData) => schedule.isEffective);
        });

        if (validTickets.length === 0) {
            return `
                <div class="ytomo-empty-state">
                    <p>利用可能なチケットが見つかりませんでした</p>
                </div>
            `;
        }

        const ticketPromises = validTickets.map(async ticket => {
            const isExternal = ticket.isOwn === false;
            const tipText = isExternal ? (ticket.label || 'External') : 'Me';
            const tipClass = isExternal ? 'ytomo-external-tip' : 'ytomo-me-tip';
            
            return `
                <div class="ytomo-ticket-item" data-ticket-id="${ticket.ticket_id}">
                    <!-- 上半分: チケットID、Tip -->
                    <div class="ytomo-ticket-upper">
                        <span class="ytomo-ticket-id">${ticket.ticket_id}</span>
                        <span class="${tipClass}">${tipText}</span>
                    </div>
                    <!-- 下半分: 入場日時ボタン（予約種類も含む） -->
                    <div class="ytomo-ticket-lower">
                        <div class="ytomo-entrance-dates">
                            ${await this.buildEntranceDateButtons(ticket.schedules || [], ticket)}
                        </div>
                    </div>
                </div>
            `;
        });
        
        const ticketResults = await Promise.all(ticketPromises);
        return ticketResults.join('');
    }

    /**
     * 入場日時ボタンを構築（調査結果に基づく）
     */
    private async buildEntranceDateButtons(schedules: ScheduleData[], ticket: TicketData): Promise<string> {
        if (!Array.isArray(schedules) || schedules.length === 0) {
            return '<span class="ytomo-no-entrance-dates">入場予約なし</span>';
        }

        // 有効フラグが付いた入場予約のみを表示
        const visibleSchedules = schedules.filter(schedule => schedule.isEffective);
        
        if (visibleSchedules.length === 0) {
            return '<span class="ytomo-no-entrance-dates">利用可能な入場予約なし</span>';
        }

        const buttonPromises = visibleSchedules.map(async schedule => {
            // 抽選カレンダーデータを取得
            const lotteryData = await this.fetchLotteryCalendar(schedule.entrance_date);
            const reservationStatus = this.getReservationStatus(schedule, lotteryData, ticket);
            const isDisabled = reservationStatus.availableTypes.length === 0;
            
            return `
                <button class="ytomo-entrance-date-button${isDisabled ? ' disabled' : ''}" 
                        data-date="${schedule.entrance_date}" 
                        data-use-state="${schedule.use_state}"
                        data-available-types="${reservationStatus.availableTypes.join(',')}"
                        ${isDisabled ? 'disabled' : ''}>
                    <span class="ytomo-date-text">${this.formatDate(schedule.entrance_date)} ${schedule.schedule_name || this.extractTimeFromSchedule(schedule)}</span>
                    <div class="ytomo-reservation-status">
                        ${reservationStatus.statusText}
                    </div>
                </button>
            `;
        });
        
        const buttonResults = await Promise.all(buttonPromises);
        return buttonResults.join('');
    }

    /**
     * 入場予約の詳細な予約状況を取得
     */
    private getReservationStatus(schedule: ScheduleData, lotteryData?: LotteryCalendarData | null, ticket?: TicketData): { statusText: string, availableTypes: string[] } {
        // すべての入場予約をable（選択可能）にする
        console.log('🔍 予約種類判定（すべてable）:', { schedule, lotteryData, ticket });
        
        return { 
            statusText: 'able', 
            availableTypes: ['able'] 
        };
    }

    /**
     * 入場予約選択をキャッシュに保存
     */
    private saveEntranceSelectionToCache(date: string): void {
        try {
            localStorage.setItem('ytomo_entrance_selection', date);
            console.log(`💾 入場予約選択をキャッシュに保存: ${date}`);
        } catch (error) {
            console.warn('⚠️ 入場予約選択キャッシュ保存失敗:', error);
        }
    }

    /**
     * 入場予約選択をキャッシュから削除
     */
    private clearEntranceSelectionFromCache(): void {
        try {
            localStorage.removeItem('ytomo_entrance_selection');
            console.log('🗑️ 入場予約選択キャッシュをクリア');
        } catch (error) {
            console.warn('⚠️ 入場予約選択キャッシュクリア失敗:', error);
        }
    }

    /**
     * キャッシュから入場予約選択を復元
     */
    private restoreEntranceSelectionFromCache(): void {
        try {
            const cachedDate = localStorage.getItem('ytomo_entrance_selection');
            if (!cachedDate) return;

            // キャッシュされた日付のボタンを探す
            const targetButton = this.mainDialogContainer?.querySelector(
                `.ytomo-entrance-date-button[data-date="${cachedDate}"]`
            ) as HTMLButtonElement;

            if (targetButton && !targetButton.disabled) {
                targetButton.classList.add('selected');
                console.log(`🔄 入場予約選択をキャッシュから復元: ${cachedDate}`);
            } else {
                // ボタンが見つからない、または無効化されている場合はキャッシュクリア
                this.clearEntranceSelectionFromCache();
                console.log(`🗑️ 入場予約選択復元失敗、キャッシュクリア: ${cachedDate}`);
            }
        } catch (error) {
            console.warn('⚠️ 入場予約選択復元失敗:', error);
        }
    }

    /**
     * 利用可能日付を抽出（調査結果に基づく）
     */
    private async extractAvailableDates(tickets: TicketData[]): Promise<string[]> {
        const dates = new Set<string>();
        
        for (const ticket of tickets) {
            if (ticket.schedules && Array.isArray(ticket.schedules)) {
                // 有効フラグが付いたスケジュールのみを処理
                const effectiveSchedules = ticket.schedules.filter((schedule: ScheduleData) => schedule.isEffective);
                
                for (const schedule of effectiveSchedules) {
                    if (schedule.entrance_date) {
                        // 利用可能な予約タイプがあるかチェック
                        const lotteryData = await this.fetchLotteryCalendar(schedule.entrance_date);
                        const reservationStatus = this.getReservationStatus(schedule, lotteryData, ticket);
                        if (reservationStatus.availableTypes.length > 0) {
                            dates.add(schedule.entrance_date);
                        }
                    }
                }
            }
        }

        const sortedDates = Array.from(dates).sort((a, b) => {
            // YYYYMMDD形式の場合は文字列比較で十分（例：20250908 < 20250911）
            // それ以外の形式の場合はDate変換してソート
            if (/^\d{8}$/.test(a) && /^\d{8}$/.test(b)) {
                // YYYYMMDD形式は文字列比較
                return a.localeCompare(b);
            } else {
                // その他の形式はDate変換
                const dateA = new Date(a);
                const dateB = new Date(b);
                return dateA.getTime() - dateB.getTime();
            }
        });
        return sortedDates;
    }

    /**
     * 抽選カレンダーデータを取得
     */
    private async fetchLotteryCalendar(entranceDate: string): Promise<LotteryCalendarData | null> {
        try {
            const response = await fetch(`/api/d/lottery_calendars?entrance_date=${entranceDate}`, {
                method: 'GET',
                headers: {
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                    'X-Api-Lang': 'ja'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) return null;

            // API境界でanyを遮断し、型安全な構造に変換
            const rawData: any = await response.json();
            const sourceData = rawData.data || rawData;
            
            // 型安全なLotteryCalendarDataに変換
            const calendarData: LotteryCalendarData = {
                availableSlots: Array.isArray(sourceData.availableSlots) ? sourceData.availableSlots : [],
                status: typeof sourceData.status === 'string' ? sourceData.status : undefined,
                lottery_type: typeof sourceData.lottery_type === 'string' ? sourceData.lottery_type : undefined,
                registration_period: sourceData.registration_period && 
                                   typeof sourceData.registration_period === 'object' ? {
                    start: sourceData.registration_period.start || '',
                    end: sourceData.registration_period.end || ''
                } : undefined
            };
            
            return calendarData;
        } catch (error) {
            console.error('❌ 抽選カレンダー取得エラー:', error);
            return null;
        }
    }


    /**
     * 日付フォーマット（YYYYMMDD → M/D）
     */
    private formatDate(dateStr: string): string {
        try {
            // YYYYMMDD形式（例：20250826）をパース
            if (dateStr && dateStr.length === 8) {
                const year = dateStr.slice(0, 4);
                const month = dateStr.slice(4, 6);
                const day = dateStr.slice(6, 8);
                const date = new Date(`${year}-${month}-${day}`);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            }
            // それ以外の形式も試す
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return `${date.getMonth() + 1}/${date.getDate()}`;
            }
            return dateStr;
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

        // 入場日時ボタン
        const entranceButtons = container.querySelectorAll('.ytomo-entrance-date-button');
        entranceButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                if (target.disabled) return;

                const date = target.dataset['date'];
                if (!date) return;

                const isCurrentlySelected = target.classList.contains('selected');
                
                if (isCurrentlySelected) {
                    // 現在選択中のボタンをクリック → 選択解除
                    target.classList.remove('selected');
                    console.log(`🎫 入場日時選択解除: ${date}`);
                    
                    // キャッシュから削除
                    this.clearEntranceSelectionFromCache();
                    
                    // チケット選択もクリア
                    this.reactiveTicketManager.clearSelection();
                    console.log('🧹 チケット選択をクリア');
                    
                    // パビリオンタブの日付表示を更新
                    this.updatePavilionTabSelectedDates();
                } else {
                    // 未選択のボタンをクリック → 全ての入場予約ボタンを解除してから選択
                    const allEntranceButtons = this.mainDialogContainer?.querySelectorAll('.ytomo-entrance-date-button.selected');
                    allEntranceButtons?.forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    
                    target.classList.add('selected');
                    console.log(`🎫 入場日時選択: ${date} (他の日付は自動解除)`);
                    
                    // 選択をキャッシュに保存
                    this.saveEntranceSelectionToCache(date);
                    
                    // 該当日付のチケットを自動選択
                    this.reactiveTicketManager.selectTicketsByDate(date);
                    console.log(`🎯 該当日付 ${date} のチケットを自動選択`);
                    
                    // スマホデバッグ: 選択後の状態確認
                    const selectedCount = this.reactiveTicketManager.getSelectedTicketCount();
                    console.log(`📱 スマホデバッグ: 選択後のチケット数 = ${selectedCount}`);
                    
                    // パビリオンタブの日付表示を更新
                    this.updatePavilionTabSelectedDates();
                }
            });
        });

        // チケットアイテムクリック
        const ticketItems = container.querySelectorAll('.ytomo-ticket-item:not(.ytomo-add-ticket-item)');
        ticketItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const ticketItem = target.closest('.ytomo-ticket-item') as HTMLElement;
                const ticketId = ticketItem?.dataset['ticketId'];
                
                if (ticketId) {
                    // 入場予約ボタンやその子要素がクリックされた場合
                    const isEntranceButton = target.closest('.ytomo-entrance-date-btn');
                    
                    if (isEntranceButton) {
                        // 入場予約ボタンの選択状態に応じてチケット選択を制御
                        const isButtonSelected = isEntranceButton.classList.contains('selected');
                        const selectedTickets = this.ticketManager.getSelectedTickets();
                        const isTicketSelected = selectedTickets.some(t => t.ticket_id === ticketId);
                        
                        if (isButtonSelected && !isTicketSelected) {
                            // ボタン選択済み、チケット未選択 → チケット選択
                            this.reactiveTicketManager.toggleTicketSelection(ticketId);
                        } else if (!isButtonSelected && isTicketSelected) {
                            // ボタン未選択、チケット選択済み → チケット選択解除
                            this.reactiveTicketManager.toggleTicketSelection(ticketId);
                        }
                    } else {
                        // チケット個別選択は無効化（入場予約選択で連動するため）
                        console.log('🔒 チケット個別選択は無効化されています');
                    }
                    // UI更新はリアクティブシステムで自動実行される
                }
            });
        });

        // チケット追加ボタン
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
        
        // 日付ボタンの選択状態を更新
        const dateButtons = this.mainDialogContainer?.querySelectorAll('.ytomo-date-button');
        dateButtons?.forEach(button => {
            const buttonDate = (button as HTMLElement).dataset['date'];
            if (buttonDate === date) {
                button.classList.toggle('selected');
            } else {
                button.classList.remove('selected');
            }
        });
        
        // 対応する入場予約ボタンの選択状態も更新
        const entranceButtons = this.mainDialogContainer?.querySelectorAll('.ytomo-entrance-date-button');
        const isDateSelected = this.mainDialogContainer?.querySelector(`.ytomo-date-button[data-date="${date}"]`)?.classList.contains('selected');
        
        entranceButtons?.forEach(button => {
            const buttonDate = (button as HTMLElement).dataset['date'];
            if (buttonDate === date) {
                if (isDateSelected) {
                    button.classList.add('selected');
                } else {
                    button.classList.remove('selected');
                }
            } else if (isDateSelected) {
                // 選択された日付以外の入場予約ボタンを解除
                button.classList.remove('selected');
            }
        });
        
        // UI更新はリアクティブシステムで自動実行される（チケット選択は入場予約ボタンで制御）
    }


    /**
     * チケット表示フィルター
     */
    private filterTicketDisplay(ownOnly: boolean): void {
        const ticketItems = this.mainDialogContainer?.querySelectorAll('.ytomo-ticket-item');
        
        ticketItems?.forEach(item => {
            const ticketId = (item as HTMLElement).dataset['ticketId'];
            const ticket = this.ticketManager.getAllTickets().find(t => t.ticket_id === ticketId);
            
            if (ticket) {
                if (ownOnly && !ticket.isOwn) {
                    (item as HTMLElement).classList.add('hidden');
                } else {
                    (item as HTMLElement).classList.remove('hidden');
                }
            }
        });
    }

    /**
     * チケット追加処理
     */
    private async handleAddTicket(): Promise<void> {
        const ticketIdInput = this.mainDialogContainer?.querySelector('#ticket-id-input') as HTMLInputElement;
        const labelInput = this.mainDialogContainer?.querySelector('#ticket-label-input') as HTMLInputElement;
        const channelSelect = this.mainDialogContainer?.querySelector('#channel-select') as HTMLSelectElement;
        
        if (!ticketIdInput) return;

        const ticketId = ticketIdInput.value.trim();
        const label = labelInput?.value.trim() || '外部チケット';
        const channel = channelSelect?.value || '5'; // デフォルトは当日(1)

        if (!ticketId) {
            alert('チケットIDを入力してください');
            return;
        }

        try {
            await this.reactiveTicketManager.addExternalTicket(ticketId, label, channel);
            
            // デバッグ: チケット追加後の状態確認
            const allTickets = this.ticketManager.getAllTickets();
            console.log(`🎫 チケット追加後の全チケット数: ${allTickets.length}`);
            console.log(`🎫 追加されたチケットID: ${ticketId} (channel: ${channel}) が含まれているか:`, 
                allTickets.some(t => t.ticket_id === ticketId));
            
            // 成功時はタブを再初期化
            await this.initializeTicketTab();
            
            // 入力をクリア
            ticketIdInput.value = '';
            if (labelInput) labelInput.value = '';
            channelSelect.selectedIndex = 0; // チャンネルもリセット

            console.log(`✅ チケット追加成功: ${ticketId} (channel: ${channel})`);

        } catch (error) {
            console.error('❌ チケット追加エラー:', error);
            alert(`チケット追加に失敗しました: ${error}`);
        }
    }

    /**
     * チケット選択状態をUI更新
     */
    private updateTicketSelection(): void {
        const selectedTickets = this.ticketManager.getSelectedTickets();
        const selectedIds = new Set(selectedTickets.map(t => t.ticket_id));

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
        const count = this.reactiveTicketManager.getSelectedTicketCount();
        const tabCount = this.mainDialogContainer?.querySelector('#ticket-count');
        
        if (tabCount) {
            tabCount.textContent = ` (${count})`;
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/>
                            </svg>
                            <span id="available-count" class="ytomo-count-badge">0</span>
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

                <!-- 予約実行FABボタン -->
                <button id="reservation-button" class="ytomo-reservation-fab" disabled title="予約実行">
                    📋
                </button>
                
                <!-- ステータスFAB（予約結果表示用） -->
                <button id="status-fab" class="ytomo-status-fab" style="display: none;">
                    📋
                </button>
                
                <!-- 予約結果表示（非表示） -->
                <div class="ytomo-result-display" id="result-display" style="display: none;"></div>
                
                <!-- 選択情報表示 -->
                <div class="ytomo-selected-info" id="selected-info"></div>
            </div>
        `;

        // イベントリスナーを設定
        this.setupPavilionTabEventListeners(container);
    }

    /**
     * 予約種類を判定
     */
    private determineReservationType(tickets: TicketData[]): string {
        if (tickets.length === 0) return '1';
        
        // TODO: 実際の予約種類を判断する
        return '';
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
                this.toggleAvailableOnlyFilter();
            });
        }

        // 更新ボタン
        const refreshButton = container.querySelector('#refresh-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.handleRefreshAllPavilions();
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
     * お気に入り読み込み処理
     */
    private async handleLoadFavorites(): Promise<void> {
        console.log('⭐ お気に入り読み込み');

        try {
            this.showPavilionLoading('お気に入りを読み込み中...');
            const { ticketIds, entranceDate } = this.getSearchParameters();

            const pavilions = await this.pavilionManager.loadFavoritePavilions();
            
            // お気に入り未登録時は即座に終了
            if (pavilions.length === 0) {
                console.log('⭐ お気に入り未登録のため処理終了');
                this.showPavilionError('お気に入りが登録されていません');
                return;
            }
            
            // お気に入りパビリオンは最初から全パビリオンの時間帯情報を取得
            const allPavilionIds = pavilions.map(p => p.id);
            const timeSlotsMap = await this.fetchTimeSlotsForPavilionIds(allPavilionIds, ticketIds, entranceDate);
            
            // 全パビリオンに時間帯情報を設定し、dateStatusを更新
            for (const pavilion of pavilions) {
                pavilion.timeSlots = timeSlotsMap.get(pavilion.id) || [];
                
                // 時間帯情報から満員状態を判定してdateStatusを設定
                const hasAvailableSlots = pavilion.timeSlots.some(slot => slot.available);
                if (!hasAvailableSlots && pavilion.timeSlots.length > 0) {
                    pavilion.dateStatus = 2; // 全て満員
                } else if (pavilion.timeSlots.length === 0) {
                    pavilion.dateStatus = 2; // 時間帯なし（満員扱い）
                } else {
                    pavilion.dateStatus = 1; // 空きあり
                }
            }

            // 検索結果を保存
            this.lastSearchResults = [...pavilions];
            
            this.displayPavilions(pavilions);

            // 空きパビリオン数を更新
            this.updateAvailableCount(pavilions);

            // お気に入り検索時はフィルタをOFFに設定
            this.isAvailableOnlyFilterActive = false;
            this.updateFilterButtonUI();
            this.applyStyleFilters();

            console.log(`✅ お気に入り読み込み完了: ${pavilions.length}個（時間帯情報付き）`);

        } catch (error) {
            console.error('❌ お気に入り読み込みエラー:', error);
            this.showPavilionError('お気に入りの読み込みに失敗しました');
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
            // 複数選択時は順次予約、単一選択時は単一予約
            if (selectedTimeSlots.length === 1) {
                await this.executeSingleReservation(selectedTimeSlots[0], selectedTickets);
            } else {
                await this.executeSequentialReservations(selectedTimeSlots, selectedTickets);
            }


        } catch (error) {
            console.error('❌ 予約実行エラー:', error);
            // errorオブジェクトからメッセージ部分のみ抽出
            const errorMessage = String(error).replace('Error: ', '');
            this.showReservationResult(`予約失敗: ${errorMessage}`, 'error');
        } finally {
            // 予約完了後にFABボタンを再有効化
            this.updateReservationButton();
            
            // オーバーレイを非表示
            this.hideProcessingOverlay();
        }
    }

    /**
     * 単一予約実行
     */
    private async executeSingleReservation(selectedTimeSlot: {pavilionId: string, timeSlot: PavilionTimeSlot}, selectedTickets: TicketData[]): Promise<void> {
        const { pavilionId, timeSlot } = selectedTimeSlot;
        
        // 誤操作防止オーバーレイを表示
        this.showProcessingOverlay('予約を実行中...');
        
        // 予約実行中はFABボタンを無効化
        const reservationButton = this.mainDialogContainer?.querySelector('#reservation-button') as HTMLButtonElement;
        if (reservationButton) {
            reservationButton.disabled = true;
        }
        
        // 登録チャンネルを取得
        const registeredChannel = this.getRegisteredChannelFromSelection();
        const entranceDate = this.getSearchParameters().entranceDate;
        
        if (!entranceDate) {
            this.showReservationResult('❗ 入場日が選択されていません', 'error');
            return;
        }
        
        // 予約を実行
        const result = await this.pavilionManager.makeReservation(
            pavilionId,
            timeSlot,
            selectedTickets,
            entranceDate,
            registeredChannel
        );
        
        if (result.success) {
            this.showReservationResult('予約成功', 'success');
            
            // パビリオン情報を再取得して表示を更新
            const pavilionName = this.lastSearchResults.find(p => p.id === pavilionId)?.name || pavilionId;
            const entranceDate = this.getSearchParameters().entranceDate;
            if (entranceDate) {
                const dateTimeInfo = `${this.formatDate(entranceDate)} ${this.formatTime(timeSlot.time)}`;
                
                // 3行のステータスFAB表示
                const statusFab = this.mainDialogContainer?.querySelector('.ytomo-status-fab');
                if (statusFab) {
                    statusFab.className = 'ytomo-status-fab success';
                    statusFab.innerHTML = `
                        <div>予約成功</div>
                        <div>${pavilionName}</div>
                        <div>${dateTimeInfo}</div>
                    `;
                }
            }
            
            console.log(`✅ 予約成功: ${pavilionId} ${timeSlot.time}`);
        } else {
            this.showReservationResult(`予約失敗: ${result.message}`, 'error');
        }
    }

    // 180回制限カウンター
    private attemptCount = 0;
    private readonly FAST_INTERVAL_LIMIT = 180;

    /**
     * 順次予約実行（複数選択時）
     */
    private async executeSequentialReservations(selectedTimeSlots: {pavilionId: string, timeSlot: PavilionTimeSlot}[], selectedTickets: TicketData[]): Promise<void> {
        // タイムスタンプ順でソート（選択順序を保持）
        const sortedTimeSlots = this.sortTimeSlotsByTimestamp(selectedTimeSlots);
        
        // 拡張オーバーレイを表示
        this.showSequentialReservationOverlay(sortedTimeSlots.length);
        
        // 予約実行中はFABボタンを無効化
        const reservationButton = this.mainDialogContainer?.querySelector('#reservation-button') as HTMLButtonElement;
        if (reservationButton) {
            reservationButton.disabled = true;
        }

        let successCount = 0;
        let failureCount = 0;
        const results: Array<{success: boolean, pavilionId: string, timeSlot: string, message?: string}> = [];

        // オーバーレイ表示後に初期モード取得（UI構築完了後）
        await new Promise(resolve => setTimeout(resolve, 100)); // DOM構築待機
        console.log(`🎯 順次実行開始`);
        
        // 実行処理（循環対応）
        let cycleCount = 0;
        while (successCount === 0) {
            cycleCount++;
            console.log(`🔄 循環 ${cycleCount} 回目開始`);
            
            for (let i = 0; i < sortedTimeSlots.length; i++) {
            const currentSlot = sortedTimeSlots[i];
            const { pavilionId, timeSlot } = currentSlot;
            
            try {
                // オーバーレイの進行状況を更新
                this.updateSequentialOverlay(i + 1, sortedTimeSlots.length, pavilionId, timeSlot.time, cycleCount);
                
                // 各予約実行前にモードを確認（リアルタイム切り替え）
                const currentMode = this.getCurrentMode();
                let result;
                
                if (currentMode === 'monitoring') {
                    // 監視モード：全対象を並列チェック
                    const availableSlot = await this.checkAllSlotsAvailability(sortedTimeSlots, selectedTickets);
                    
                    if (availableSlot) {
                        console.log(`✅ 空きを検出！予約実行: ${availableSlot.pavilionId} ${availableSlot.timeSlot.time}`);
                        const registeredChannel = this.getRegisteredChannelFromSelection();
                        const entranceDate = this.getSearchParameters().entranceDate;
                        
                        if (!entranceDate) {
                            throw new Error('入場日が選択されていません');
                        }
                        
                        result = await this.pavilionManager.makeReservation(
                            availableSlot.pavilionId,
                            availableSlot.timeSlot,
                            selectedTickets,
                            entranceDate,
                            registeredChannel
                        );
                        
                        // 監視モードでは最初に見つかった空きで予約実行後、結果に関わらず終了
                        results.push({
                            success: result.success,
                            pavilionId: availableSlot.pavilionId,
                            timeSlot: availableSlot.timeSlot.time,
                            message: result.message
                        });

                        if (result.success) {
                            successCount++;
                        } else {
                            failureCount++;
                        }
                        break; // forループを抜けて次の循環へ
                    } else {
                        console.log(`⏳ 監視継続: 全対象で空きなし`);
                        break; // forループを抜けて次の循環へ
                    }
                } else {
                    // 予約モード：直接予約実行
                    const registeredChannel = this.getRegisteredChannelFromSelection();
                    const entranceDate = this.getSearchParameters().entranceDate;
                    
                    if (!entranceDate) {
                        throw new Error('入場日が選択されていません');
                    }
                    
                    result = await this.pavilionManager.makeReservation(
                        pavilionId,
                        timeSlot,
                        selectedTickets,
                        entranceDate,
                        registeredChannel
                    );
                }

                results.push({
                    success: result.success,
                    pavilionId,
                    timeSlot: timeSlot.time,
                    message: result.message
                });

                if (result.success) {
                    successCount++;
                    console.log(`✅ 予約成功 ${i + 1}/${sortedTimeSlots.length}: ${pavilionId} ${timeSlot.time}`);
                    
                    // 成功時は即座に終了（最初に成功した予約を取る）
                    this.showSequentialReservationResult(results, successCount, failureCount);
                    return;
                } else {
                    failureCount++;
                    console.log(`❌ 予約失敗 ${i + 1}/${sortedTimeSlots.length}: ${pavilionId} ${timeSlot.time} - ${result.message}`);
                }

                // 間隔調整（動的取得・180回制限チェック）
                let currentInterval = this.getCurrentInterval();
                
                // 高速間隔の180回制限チェック（モード別・リアルタイム判定）
                const currentIntervalMode = this.getCurrentMode();
                if (currentIntervalMode === 'monitoring') {
                    // 監視モード：5,15秒間隔の制限
                    if ((currentInterval === 5 || currentInterval === 15) && this.attemptCount >= this.FAST_INTERVAL_LIMIT) {
                        console.log(`⚠️ 監視モード ${currentInterval}秒間隔の180回制限に達しました。30秒間隔に自動変更します。`);
                        currentInterval = 30;
                        this.updateIntervalDropdown(30);
                    }
                } else {
                    // 予約モード：1,5秒間隔の制限
                    if ((currentInterval === 1 || currentInterval === 5) && this.attemptCount >= this.FAST_INTERVAL_LIMIT) {
                        console.log(`⚠️ 予約モード ${currentInterval}秒間隔の180回制限に達しました。15秒間隔に自動変更します。`);
                        currentInterval = 15;
                        this.updateIntervalDropdown(15);
                    }
                }
                
                this.attemptCount++;
                await this.waitWithCountdown(currentInterval);

            } catch (error) {
                failureCount++;
                results.push({
                    success: false,
                    pavilionId,
                    timeSlot: timeSlot.time,
                    message: String(error)
                });
                console.error(`❌ 予約エラー ${i + 1}/${sortedTimeSlots.length}: ${pavilionId} ${timeSlot.time}`, error);
            }
            }
        }

        // 全て失敗した場合の結果表示
        this.showSequentialReservationResult(results, successCount, failureCount);
    }

    /**
     * タイムスタンプ順でソート（選択順序を保持）
     */
    private sortTimeSlotsByTimestamp(timeSlots: {pavilionId: string, timeSlot: PavilionTimeSlot}[]): {pavilionId: string, timeSlot: PavilionTimeSlot}[] {
        return timeSlots.map(slot => {
            // DOM要素からタイムスタンプを取得
            const button = this.mainDialogContainer?.querySelector(
                `.ytomo-time-slot-button[data-pavilion-id="${slot.pavilionId}"][data-time="${slot.timeSlot.time}"]`
            ) as HTMLElement;
            const timestamp = button?.getAttribute('data-time-selected');
            
            return {
                ...slot,
                timestamp: timestamp ? parseInt(timestamp) : 0
            };
        }).sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * 現在の間隔設定を取得
     */
    private getCurrentInterval(): number {
        const dropdown = document.getElementById('ytomo-interval-select') as HTMLSelectElement;
        return dropdown ? parseInt(dropdown.value) : 15;
    }

    /**
     * 間隔ドロップダウンを更新
     */
    private updateIntervalDropdown(seconds: number): void {
        const dropdown = document.getElementById('ytomo-interval-select') as HTMLSelectElement;
        if (dropdown) {
            dropdown.value = seconds.toString();
        }
    }

    /**
     * 待機処理（カウントダウン付き）
     */
    private async waitWithCountdown(seconds: number): Promise<void> {
        for (let i = seconds; i > 0; i--) {
            this.updateSequentialOverlayCountdown(i);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    /**
     * 順次予約オーバーレイを表示
     */
    private showSequentialReservationOverlay(totalCount: number): void {
        this.hideProcessingOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = 'ytomo-sequential-overlay';
        overlay.className = 'ytomo-sequential-overlay';
        overlay.innerHTML = `
            <div class="ytomo-sequential-content">
                <h3>順次予約実行中</h3>
                <div class="ytomo-sequential-settings">
                    <div class="ytomo-mode-selection">
                        <label>実行モード:</label>
                        <div class="ytomo-mode-buttons">
                            <button id="ytomo-reservation-mode" class="ytomo-mode-button active">予約モード</button>
                            <button id="ytomo-monitoring-mode" class="ytomo-mode-button">監視モード</button>
                        </div>
                    </div>
                    <div class="ytomo-interval-setting">
                        <label for="ytomo-interval-select">実行間隔:</label>
                        <select id="ytomo-interval-select" class="ytomo-interval-dropdown">
                            <option value="1">1秒</option>
                            <option value="5">5秒</option>
                            <option value="15" selected>15秒</option>
                            <option value="30">30秒</option>
                            <option value="60">60秒</option>
                        </select>
                    </div>
                </div>
                <div class="ytomo-sequential-progress">
                    <div class="ytomo-sequential-current">1/${totalCount}</div>
                    <div class="ytomo-sequential-target">準備中...</div>
                    <div class="ytomo-sequential-countdown"></div>
                </div>
                <div class="ytomo-sequential-controls">
                    <button id="ytomo-cancel-sequential" class="ytomo-cancel-button">キャンセル</button>
                </div>
            </div>
        `;
        
        overlay.style.zIndex = '10002';
        
        // イベントリスナー設定
        overlay.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            
            if (target.id === 'ytomo-cancel-sequential') {
                this.cancelSequentialReservation();
            } else if (target.id === 'ytomo-reservation-mode' || target.id === 'ytomo-monitoring-mode') {
                this.handleModeSwitch(target);
            }
            
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.body.appendChild(overlay);
    }

    /**
     * 実行モード切り替え
     */
    private handleModeSwitch(targetButton: HTMLElement): void {
        const overlay = document.getElementById('ytomo-sequential-overlay');
        if (!overlay) return;

        const allModeButtons = overlay.querySelectorAll('.ytomo-mode-button');
        allModeButtons.forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');

        // モードに応じて間隔選択肢を更新
        this.updateIntervalOptionsForMode(targetButton.id === 'ytomo-monitoring-mode');
        
        // ヘッダーテキストを更新
        const header = overlay.querySelector('h3');
        if (header) {
            header.textContent = targetButton.id === 'ytomo-monitoring-mode' ? '監視モード実行中' : '順次予約実行中';
        }
    }

    /**
     * 現在の実行モードを取得
     */
    private getCurrentMode(): 'reservation' | 'monitoring' {
        const monitoringButton = document.getElementById('ytomo-monitoring-mode');
        const reservationButton = document.getElementById('ytomo-reservation-mode');
        
        console.log('🔍 モード判定デバッグ:');
        console.log('  - 監視ボタン存在:', !!monitoringButton);
        console.log('  - 監視ボタンactive:', monitoringButton?.classList.contains('active'));
        console.log('  - 予約ボタン存在:', !!reservationButton);
        console.log('  - 予約ボタンactive:', reservationButton?.classList.contains('active'));
        
        const mode = monitoringButton?.classList.contains('active') ? 'monitoring' : 'reservation';
        console.log('  - 判定結果:', mode);
        
        return mode;
    }

    /**
     * モードに応じて間隔選択肢を更新
     */
    private updateIntervalOptionsForMode(isMonitoring: boolean): void {
        const dropdown = document.getElementById('ytomo-interval-select') as HTMLSelectElement;
        if (!dropdown) return;

        const currentValue = dropdown.value;
        dropdown.innerHTML = '';

        if (isMonitoring) {
            // 監視モード：5,15,30,60秒
            dropdown.innerHTML = `
                <option value="5">5秒</option>
                <option value="15">15秒</option>
                <option value="30">30秒</option>
                <option value="60">60秒</option>
            `;
            // 現在の値が利用可能なら維持、なければデフォルト15秒
            dropdown.value = ['5', '15', '30', '60'].includes(currentValue) ? currentValue : '15';
        } else {
            // 予約モード：1,5,15,30,60秒
            dropdown.innerHTML = `
                <option value="1">1秒</option>
                <option value="5">5秒</option>
                <option value="15">15秒</option>
                <option value="30">30秒</option>
                <option value="60">60秒</option>
            `;
            dropdown.value = currentValue || '15';
        }
    }

    /**
     * 全監視対象の空き状況を並列チェック（監視モード用）
     */
    private async checkAllSlotsAvailability(timeSlots: {pavilionId: string, timeSlot: PavilionTimeSlot}[], selectedTickets: TicketData[]): Promise<{pavilionId: string, timeSlot: PavilionTimeSlot} | null> {
        try {
            const entranceDate = this.getSearchParameters().entranceDate;
            if (!entranceDate) {
                console.warn('入場日が選択されていません');
                return null;
            }

            const ticketIds = selectedTickets.map(t => t.ticket_id);
            
            // 監視対象のパビリオンIDsを抽出
            const pavilionIds = [...new Set(timeSlots.map(slot => slot.pavilionId))];
            console.log(`🔍 並列監視チェック開始: ${pavilionIds.length}件のパビリオン`);
            
            // 並列で全パビリオンの時間帯情報を取得
            const pavilionChecks = pavilionIds.map(async (pavilionId) => {
                try {
                    const apiTimeSlots = await this.pavilionManager.getPavilionTimeSlots(pavilionId, ticketIds, entranceDate);
                    return { pavilionId, apiTimeSlots };
                } catch (error) {
                    console.warn(`⚠️ パビリオン${pavilionId}の取得エラー:`, error);
                    return { pavilionId, apiTimeSlots: [] };
                }
            });
            
            const results = await Promise.all(pavilionChecks);
            
            // 監視対象の時間帯で空きがあるかチェック
            for (const monitoringSlot of timeSlots) {
                const pavilionResult = results.find(r => r.pavilionId === monitoringSlot.pavilionId);
                if (!pavilionResult) continue;
                
                const targetSlot = pavilionResult.apiTimeSlots.find(slot => slot.time === monitoringSlot.timeSlot.time);
                if (targetSlot?.available) {
                    console.log(`✅ 空き発見: ${monitoringSlot.pavilionId} ${monitoringSlot.timeSlot.time}`);
                    return { pavilionId: monitoringSlot.pavilionId, timeSlot: monitoringSlot.timeSlot };
                }
            }
            
            console.log(`⏳ 全対象で空きなし`);
            return null;
            
        } catch (error) {
            console.warn('⚠️ 並列監視チェックエラー:', error);
            return null;
        }
    }


    /**
     * 順次予約をキャンセル
     */
    private cancelSequentialReservation(): void {
        this.hideSequentialOverlay();
        this.showReservationResult('順次予約をキャンセルしました', 'info');
    }


    /**
     * 順次予約オーバーレイのカウントダウン更新
     */
    private updateSequentialOverlayCountdown(seconds: number): void {
        const overlay = document.getElementById('ytomo-sequential-overlay');
        if (!overlay) return;

        const countdownDiv = overlay.querySelector('.ytomo-sequential-countdown');
        if (countdownDiv) {
            countdownDiv.textContent = `次まで ${seconds} 秒`;
        }
    }

    /**
     * 順次予約オーバーレイの進捗更新（旧名：updateSequentialOverlay）
     */
    private updateSequentialOverlay(current: number, total: number, pavilionId: string, timeSlot: string, cycleCount: number = 1): void {
        const overlay = document.getElementById('ytomo-sequential-overlay');
        if (!overlay) return;
        
        const currentDiv = overlay.querySelector('.ytomo-sequential-current');
        const targetDiv = overlay.querySelector('.ytomo-sequential-target');
        
        if (currentDiv) currentDiv.textContent = `循環${cycleCount}回目: ${current}/${total}`;
        if (targetDiv) {
            const pavilionName = this.lastSearchResults.find(p => p.id === pavilionId)?.name || pavilionId;
            targetDiv.textContent = `${pavilionName} ${this.formatTime(timeSlot)}`;
        }
    }

    /**
     * 順次予約結果表示
     */
    private showSequentialReservationResult(results: {success: boolean, pavilionId: string, timeSlot: string, message?: string}[], successCount: number, failureCount: number): void {
        this.hideSequentialOverlay();
        
        if (successCount > 0) {
            const successResult = results.find(r => r.success);
            this.showReservationResult('予約成功', 'success');
            
            if (successResult) {
                // ステータスFAB更新
                const pavilionName = this.lastSearchResults.find(p => p.id === successResult.pavilionId)?.name || successResult.pavilionId;
                const entranceDate = this.getSearchParameters().entranceDate;
                const dateTimeInfo = entranceDate ? `${this.formatDate(entranceDate)} ${this.formatTime(successResult.timeSlot)}` : '日時不明';
            
                const statusFab = this.mainDialogContainer?.querySelector('.ytomo-status-fab');
                if (statusFab) {
                    statusFab.className = 'ytomo-status-fab success';
                    statusFab.innerHTML = `
                        <div>予約成功</div>
                        <div>${pavilionName}</div>
                        <div>${dateTimeInfo}</div>
                    `;
                }
            }
        } else {
            this.showReservationResult(`全て失敗 (${failureCount}件)`, 'error');
        }
    }

    /**
     * 順次予約オーバーレイを非表示
     */
    private hideSequentialOverlay(): void {
        const overlay = document.getElementById('ytomo-sequential-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * パビリオン一覧を表示
     */
    private displayPavilions(pavilions: PavilionData[]): void {
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

        // オーバーレイを非表示
        this.hideProcessingOverlay();
        
        container.innerHTML = pavilions.map(pavilion => `
            <div class="ytomo-pavilion-item ${pavilion.dateStatus === 2 ? 'full-pavilion' : ''}" data-pavilion-id="${pavilion.id}">
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
    private buildTimeSlotButtons(timeSlots: PavilionTimeSlot[], pavilionId: string): string {
        // 時間帯を数値順でソート
        const sortedTimeSlots = [...timeSlots].sort((a, b) => {
            const timeA = parseInt(a.time);
            const timeB = parseInt(b.time);
            return timeA - timeB;
        });
        
        // 選択されている入場日の律速時間を取得
        const selectedDates = this.getSelectedEntranceDates();
        let latestEntranceTime: string | null = null;
        
        if (selectedDates.length === 1) {
            latestEntranceTime = this.ticketManager.getLatestEntranceTime(selectedDates[0]);
        }
        
        return sortedTimeSlots.map(slot => {
            const startTime = this.formatTime(slot.time);
            const endTime = slot.endTime ? this.formatTime(slot.endTime) : '';
            const timeDisplay = endTime ? `${startTime} - ${endTime}` : startTime;
            
            // 律速時間チェック：開始時間が律速時間以前の場合はdisabled
            let isDisabledByEntranceTime = false;
            if (latestEntranceTime) {
                const slotStartTime = this.formatTime(slot.time); // HH:MM形式
                isDisabledByEntranceTime = slotStartTime <= latestEntranceTime;
            }
            
            const disabledClass = isDisabledByEntranceTime ? 'rate-limited' : '';
            const disabledAttr = isDisabledByEntranceTime ? 'disabled' : '';
            
            return `
                <button class="ytomo-time-slot-button ${slot.available ? 'available' : 'unavailable'} ${slot.selected ? 'selected' : ''} ${disabledClass}"
                        data-pavilion-id="${pavilionId}"
                        data-time="${slot.time}"
                        ${disabledAttr}>
                    ${timeDisplay}
                </button>
            `;
        }).join('');
    }

    /**
     * 時間を「HH:MM」形式にフォーマット
     */
    private formatTime(time: string): string {
        if (!time) return '';
        
        // 4桁の数値文字列（例：1100）を「11:00」形式に変換
        if (/^\d{4}$/.test(time)) {
            const hours = time.substring(0, 2);
            const minutes = time.substring(2, 4);
            return `${hours}:${minutes}`;
        }
        
        // 既に「HH:MM」形式の場合はそのまま返す
        return time;
    }

    /**
     * スケジュールオブジェクトから時間情報を抽出
     */
    private extractTimeFromSchedule(schedule: ScheduleData): string {
        // schedule_nameがある場合はそれを使用
        if (schedule.schedule_name) {
            return schedule.schedule_name;
        }
        
        // time_startや時間フィールドがあれば使用
        if (schedule.time_start) {
            return this.formatTime(schedule.time_start);
        }
        
        if (schedule.time_end) {
            return this.formatTime(schedule.time_end);
        }
        
        // 時間情報が見つからない場合は空文字
        return '';
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

        // パビリオンチェックボックス
        const pavilionCheckboxes = container.querySelectorAll('.ytomo-pavilion-checkbox');
        pavilionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                const pavilionId = target.dataset['pavilionId'];
                
                if (pavilionId) {
                    this.handlePavilionCheckboxChange(pavilionId, target.checked);
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
            reservationType: '' // TODO: 実際の予約種類を取得
        };

        // パビリオンマネージャーで選択状態を更新
        this.pavilionManager.selectTimeSlot(pavilionId, timeSlot);

        // UI更新とタイムスタンプ記録
        if (isSelected) {
            // 選択解除：クラスとタイムスタンプ属性を削除
            button.classList.remove('selected');
            button.removeAttribute('data-time-selected');
        } else {
            // 選択：クラス追加とタイムスタンプ記録
            button.classList.add('selected');
            const currentTimestamp = Math.floor(Date.now() / 1000);
            button.setAttribute('data-time-selected', currentTimestamp.toString());
        }

        // 選択情報とボタン状態を更新
        this.updateSelectedInfo();
        this.updateReservationButton();
    }

    /**
     * パビリオンチェックボックス変更時の処理
     */
    private handlePavilionCheckboxChange(pavilionId: string, isChecked: boolean): void {
        const timeSlotContainer = this.mainDialogContainer?.querySelector(`#time-slots-${pavilionId}`);
        if (!timeSlotContainer) return;

        const timeSlotButtons = timeSlotContainer.querySelectorAll('.ytomo-time-slot-button') as NodeListOf<HTMLElement>;
        
        if (isChecked) {
            // チェック時：全ての時間帯を昇順で選択し、昇順タイムスタンプを付与
            let baseTimestamp = Math.floor(Date.now() / 1000);
            
            // 時間帯ボタンを時間順にソート
            const sortedButtons = Array.from(timeSlotButtons).sort((a, b) => {
                const timeA = parseInt(a.dataset['time'] || '0');
                const timeB = parseInt(b.dataset['time'] || '0');
                return timeA - timeB;
            });

            sortedButtons.forEach((button, index) => {
                if (!(button as HTMLButtonElement).disabled) { // rate-limitedでない場合のみ選択
                    const time = button.dataset['time'];
                    if (time) {
                        // UI更新
                        button.classList.add('selected');
                        // 昇順タイムスタンプ（1秒刻み）
                        const timestamp = baseTimestamp + index;
                        button.setAttribute('data-time-selected', timestamp.toString());

                        // パビリオンマネージャーに通知
                        const timeSlot = {
                            time: time,
                            available: !button.classList.contains('unavailable'),
                            selected: true,
                            reservationType: ''
                        };
                        this.pavilionManager.selectTimeSlot(pavilionId, timeSlot);
                    }
                }
            });
        } else {
            // チェック解除時：全ての時間帯を解除
            timeSlotButtons.forEach(button => {
                const time = button.dataset['time'];
                if (time) {
                    // UI更新
                    button.classList.remove('selected');
                    button.removeAttribute('data-time-selected');

                    // パビリオンマネージャーに通知
                    const timeSlot = {
                        time: time,
                        available: !button.classList.contains('unavailable'),
                        selected: false,
                        reservationType: ''
                    };
                    this.pavilionManager.selectTimeSlot(pavilionId, timeSlot);
                }
            });
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
     * 選択情報を更新
     */
    private updateSelectedInfo(): void {
        const selectedInfo = this.mainDialogContainer?.querySelector('#selected-info');
        
        if (selectedInfo) {
            const parts: string[] = [];
            
            
            // 選択入場日表示は削除
            
            // 選択時間帯表示は削除（ステータスFABで表示）
            
            selectedInfo.textContent = parts.length > 0 ? parts.join(' | ') : '';
        }
        
        // パビリオンタブの選択入場日も更新
        this.updatePavilionTabSelectedDates();
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
        console.log('🔄 showPavilionLoading:', message, 'container found:', !!container);
        if (container) {
            container.innerHTML = `
                <div class="ytomo-loading">
                    <p>${message}</p>
                </div>
            `;
        }
        
        // 誤操作防止オーバーレイも表示
        this.showProcessingOverlay(message);
    }

    /**
     * 誤操作防止オーバーレイを表示
     */
    private showProcessingOverlay(message: string): void {
        // 既存のオーバーレイを削除
        this.hideProcessingOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = 'ytomo-main-dialog-overlay';
        overlay.className = 'ytomo-processing-overlay';
        overlay.innerHTML = `
            <div class="ytomo-processing-content">
                <div class="ytomo-processing-spinner"></div>
                <div class="ytomo-processing-message">${message}</div>
            </div>
        `;
        
        // ダイアログより上のz-indexで表示
        overlay.style.zIndex = '10001';
        
        // クリックをブロック
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.body.appendChild(overlay);
    }

    /**
     * 誤操作防止オーバーレイを非表示
     */
    private hideProcessingOverlay(): void {
        const existingOverlay = document.getElementById('ytomo-main-dialog-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
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
        
        // オーバーレイを非表示
        this.hideProcessingOverlay();
    }

    /**
     * 予約結果表示
     */
    private showReservationResult(message: string, type: 'success' | 'error' | 'info'): void {
        console.log('🔍 予約結果表示:', message, type);
        const statusFab = document.querySelector('#status-fab') as HTMLElement;
        console.log('🔍 ステータスFAB要素:', statusFab);
        
        if (!statusFab) {
            console.warn('⚠️ #status-fab要素が見つかりません');
            return;
        }

        // 現在選択された時間帯情報を取得
        const selectedTimeSlots = this.pavilionManager.getSelectedTimeSlots();
        let pavilionName = '';
        let dateTimeInfo = '';
        
        if (selectedTimeSlots.length > 0) {
            const { pavilionId, timeSlot } = selectedTimeSlots[0];
            const pavilion = this.pavilionManager.getAllPavilions().find(p => p.id === pavilionId);
            pavilionName = pavilion?.name || pavilionId;
            
            // 日付と時間情報を取得
            const { entranceDate } = this.getSearchParameters();
            const formattedDate = entranceDate ? `${entranceDate.slice(4,6)}/${entranceDate.slice(6,8)}` : '';
            const formattedTime = timeSlot.time ? `${timeSlot.time.slice(0,2)}:${timeSlot.time.slice(2)}` : '';
            dateTimeInfo = `${formattedDate} ${formattedTime}`;
        }

        // ステータスFABに3行構成で表示
        statusFab.style.display = 'flex';
        statusFab.className = `ytomo-status-fab ${type}`;
        statusFab.innerHTML = `
            <div>${message}</div>
            <div>${pavilionName}</div>
            <div>${dateTimeInfo}</div>
        `;
        
        console.log('🔍 ステータスFAB設定:', statusFab.className, message, pavilionName, dateTimeInfo);

        // 5秒後に自動非表示
        setTimeout(() => {
            statusFab.style.display = 'none';
            statusFab.className = 'ytomo-status-fab';
        }, 5000);
    }

    /**
     * パビリオンタブの選択入場日を更新
     */
    private updatePavilionTabSelectedDates(): void {
        const tabDates = this.mainDialogContainer?.querySelector('#pavilion-tab-dates');
        
        // 選択された入場予約ボタンの日付を取得
        const selectedDates = new Set<string>();
        
        // 複数のセレクタでチェック
        const selectors = [
            '.ytomo-entrance-date-btn.selected',
            '.ytomo-entrance-date-button.selected',
            '[data-date].selected'
        ];
        
        let selectedEntranceButtons: NodeListOf<Element> | undefined;
        for (const selector of selectors) {
            selectedEntranceButtons = this.mainDialogContainer?.querySelectorAll(selector);
            if (selectedEntranceButtons && selectedEntranceButtons.length > 0) {
                console.log(`🔍 入場予約ボタン発見: ${selector}, 件数: ${selectedEntranceButtons.length}`);
                break;
            }
        }
        
        if (!selectedEntranceButtons || selectedEntranceButtons.length === 0) {
            console.log(`⚠️ 選択済み入場予約ボタンが見つかりません`);
        }
        
        selectedEntranceButtons?.forEach(button => {
            const date = (button as HTMLElement).dataset['date'];
            console.log(`🔍 ボタンの日付データ:`, date);
            if (date) {
                selectedDates.add(date);
            }
        });
        
        const dateStr = selectedDates.size > 0 ? 
            Array.from(selectedDates).map(date => this.formatDate(date)).join(', ') : '';
        
        // 律速時間（最も遅い入場時間）を取得
        let rateTimeStr = '';
        if (selectedDates.size === 1) {
            const targetDate = Array.from(selectedDates)[0];
            const latestTime = this.ticketManager.getLatestEntranceTime(targetDate);
            if (latestTime) {
                rateTimeStr = ` ${latestTime}`;
            }
        }
        
        // タブボタン下半分の表示（日付 + 律速時間）
        if (tabDates) {
            tabDates.textContent = dateStr + rateTimeStr;
        }
        
        console.log(`🗓️ パビリオンタブ日付更新: ${dateStr}`);
    }

    /**
     * 選択されている入場日付を取得
     */
    private getSelectedEntranceDates(): string[] {
        const selectedDates: string[] = [];
        
        // 複数のセレクタでチェック
        const selectors = [
            '.ytomo-entrance-date-btn.selected',
            '.ytomo-entrance-date-button.selected',
            '[data-date].selected'
        ];
        
        let selectedEntranceButtons: NodeListOf<Element> | undefined;
        for (const selector of selectors) {
            selectedEntranceButtons = this.mainDialogContainer?.querySelectorAll(selector);
            if (selectedEntranceButtons && selectedEntranceButtons.length > 0) {
                break;
            }
        }
        
        selectedEntranceButtons?.forEach(button => {
            const date = (button as HTMLElement).dataset['date'];
            if (date) {
                selectedDates.push(date);
            }
        });
        
        return selectedDates;
    }

    /**
     * パビリオンタブのイベントリスナーを設定
     */
    private setupPavilionTabEvents(): void {
        // 検索ボタン
        const searchButton = this.mainDialogContainer?.querySelector('#search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => this.handlePavilionSearch());
        }

        // フィルターボタン（空きのみ表示）
        const filterButton = this.mainDialogContainer?.querySelector('#filter-button');
        if (filterButton) {
            filterButton.addEventListener('click', () => this.toggleAvailableOnlyFilter());
        }

        // 更新ボタン
        const refreshButton = this.mainDialogContainer?.querySelector('#refresh-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.handleRefreshAllPavilions());
        }

        // お気に入りボタン
        const favoritesButton = this.mainDialogContainer?.querySelector('#favorites-button');
        if (favoritesButton) {
            favoritesButton.addEventListener('click', () => this.handleLoadFavorites());
        }

        // 検索入力でEnterキー
        const searchInput = this.mainDialogContainer?.querySelector('#pavilion-search-input') as HTMLInputElement;
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handlePavilionSearch();
                }
            });
        }

        console.log('🎪 パビリオンタブイベントリスナー設定完了');
    }

    /**
     * 検索パラメータを取得
     */
    private getSearchParameters(): { query: string; ticketIds: string[]; entranceDate?: string } {
        const searchInput = this.mainDialogContainer?.querySelector('#pavilion-search-input') as HTMLInputElement;
        const query = searchInput?.value.trim() || '';
        
        const selectedTickets = this.reactiveTicketManager.getSelectedTickets();
        const ticketIds = selectedTickets.map(t => t.ticket_id);
        
        // 選択された入場予約ボタンから日付を取得
        const selectedEntranceButtons = this.mainDialogContainer?.querySelectorAll('.ytomo-entrance-date-btn.selected, .ytomo-entrance-date-button.selected');
        let entranceDate: string | undefined;
        
        selectedEntranceButtons?.forEach(button => {
            const date = (button as HTMLElement).dataset['date'];
            if (date && !entranceDate) {
                entranceDate = date;
            }
        });

        return { query, ticketIds, entranceDate };
    }

    /**
     * 選択された入場予約から対応するregistered_channelを取得
     */
    private getRegisteredChannelFromSelection(): string {
        const selectedEntranceButtons = this.mainDialogContainer?.querySelectorAll('.ytomo-entrance-date-button.selected');
        
        if (selectedEntranceButtons && selectedEntranceButtons.length > 0) {
            const button = selectedEntranceButtons[0] as HTMLElement;
            const availableTypes = button.dataset['availableTypes']?.split(',') || [];
            
            // 表示ラベルから実際のregistered_channelへのマッピング
            const channelMapping = {
                '1': '5',   // 当日予約
                '3': '4',   // 空き枠予約
                '週': '3',  // 7日前抽選
                '月': '2'   // 2ヶ月前抽選
            };
            
            // 優先順位順にチェック
            for (const type of ['1', '3', '週', '月']) {
                if (availableTypes.includes(type)) {
                    return channelMapping[type as keyof typeof channelMapping];
                }
            }
        }
        
        // デフォルト - 本来ここには来ないはず（入場予約が選択されていない状態での予約実行）
        console.warn('⚠️ 入場予約が選択されていないため、デフォルトchannel値を使用');
        return '4';
    }

    /**
     * パビリオン一覧を検索
     */
    private async searchPavilionList(query: string, ticketIds: string[], entranceDate?: string): Promise<PavilionData[]> {
        console.log(`🔍 パビリオン一覧検索: クエリ="${query}", チケット数=${ticketIds.length}, 入場日=${entranceDate}`);
        
        const pavilions = await this.pavilionManager.searchPavilions(query, ticketIds, entranceDate);
        
        console.log(`✅ パビリオン一覧検索完了: ${pavilions.length}件`);
        return pavilions;
    }

    /**
     * パビリオンIDリストから時間帯情報を取得
     */
    private async fetchTimeSlotsForPavilionIds(pavilionIds: string[], ticketIds: string[], entranceDate?: string): Promise<Map<string, PavilionTimeSlot[]>> {
        console.log(`🕐 時間帯情報取得開始: ${pavilionIds.length}件のパビリオン`);
        
        const timeSlotsMap = new Map<string, PavilionTimeSlot[]>();
        
        // 並列実行でパフォーマンス向上（最大5件同時）
        const concurrency = Math.min(5, pavilionIds.length);
        const chunks: string[][] = [];
        
        for (let i = 0; i < pavilionIds.length; i += concurrency) {
            chunks.push(pavilionIds.slice(i, i + concurrency));
        }
        
        for (const chunk of chunks) {
            const promises = chunk.map(async (pavilionId) => {
                try {
                    const timeSlots = await this.pavilionManager.getPavilionTimeSlots(pavilionId, ticketIds, entranceDate);
                    timeSlotsMap.set(pavilionId, timeSlots);
                } catch (error) {
                    console.warn(`⚠️ パビリオン${pavilionId}の時間帯取得失敗:`, error);
                    timeSlotsMap.set(pavilionId, []);
                }
            });
            
            await Promise.all(promises);
        }
        
        console.log(`✅ 時間帯情報取得完了: ${timeSlotsMap.size}件`);
        return timeSlotsMap;
    }

    /**
     * パビリオンの時間帯情報を一括取得
     */
    private async fetchPavilionTimeSlots(pavilions: PavilionData[], ticketIds: string[], entranceDate?: string): Promise<void> {
        // 満員パビリオン（date_status: 2）は時間帯情報を取得しない
        const availablePavilionIds = pavilions
            .filter(p => p.dateStatus !== 2)
            .map(p => p.id);
            
        console.log(`⏰ 時間帯取得対象: ${availablePavilionIds.length}/${pavilions.length}件（満員除外）`);
        
        // pavilionIds->時間帯情報の関数を利用
        const timeSlotsMap = await this.fetchTimeSlotsForPavilionIds(availablePavilionIds, ticketIds, entranceDate);
        
        // 取得した時間帯情報をパビリオンオブジェクトに設定
        for (const pavilion of pavilions) {
            if (pavilion.dateStatus === 2) {
                pavilion.timeSlots = []; // 満員パビリオンは空配列
            } else {
                pavilion.timeSlots = timeSlotsMap.get(pavilion.id) || [];
            }
        }
    }

    /**
     * パビリオン検索を実行
     */
    private async handlePavilionSearch(): Promise<void> {
        try {
            this.showPavilionLoading('パビリオンを検索中...');
            const { query, ticketIds, entranceDate } = this.getSearchParameters();
            
            // パビリオン一覧を検索
            const pavilions = await this.searchPavilionList(query, ticketIds, entranceDate);
            
            // 各パビリオンの時間帯情報を取得
            console.log('⏳ 時間帯情報取得開始...');
            this.showPavilionLoading(`時間帯情報を取得中... (${pavilions.length}件)`);
            await this.fetchPavilionTimeSlots(pavilions, ticketIds, entranceDate);
            
            console.log(`🔍 パビリオン検索完了: ${pavilions.length}件（時間帯情報付き）`);
            
            // 検索結果を保存（全パビリオン - フィルタで制御）
            this.lastSearchResults = [...pavilions];
            
            // 全パビリオンを表示（ローディング表示を置き換える）
            console.log('📄 パビリオン表示開始...');
            this.displayPavilions(pavilions);
            
            // 空きパビリオン数を更新
            this.updateAvailableCount(pavilions);
            
            // 検索直後は空きのみフィルタを自動ON
            this.isAvailableOnlyFilterActive = true;
            
            // フィルタボタンのUI状態を更新
            this.updateFilterButtonUI();
            
            // Styleフィルターを適用
            this.applyStyleFilters();
            
            console.log(`✅ パビリオン検索完了: ${pavilions.length}件表示（フィルタで空きのみ）`);
            console.log(`💾 検索結果保存: ${this.lastSearchResults.length}件（全パビリオン）`);
            
        } catch (error) {
            console.error('❌ パビリオン検索エラー:', error);
            this.showPavilionError(`検索に失敗しました: ${error}`);
            this.showReservationResult(`❌ 検索に失敗しました: ${error}`, 'error');
        }
    }

    /**
     * 更新ボタン: 全パビリオンの時間帯情報を取得
     */
    private async handleRefreshAllPavilions(): Promise<void> {
        try {
            this.showPavilionLoading('パビリオン情報を更新中...');
            const { ticketIds, entranceDate } = this.getSearchParameters();
            
            // 既存の検索結果から全パビリオンIdを取得
            const allPavilionIds = this.lastSearchResults.map(p => p.id);
            const timeSlotsMap = await this.fetchTimeSlotsForPavilionIds(allPavilionIds, ticketIds, entranceDate);
            
            // 既存のパビリオンに時間帯情報を設定
            for (const pavilion of this.lastSearchResults) {
                pavilion.timeSlots = timeSlotsMap.get(pavilion.id) || [];
                
                // スマホデバッグ: 時間帯情報取得確認
                if (navigator.userAgent.match(/Mobi/) && pavilion.timeSlots.length === 0) {
                    console.log(`📱 スマホデバッグ: ${pavilion.name}の時間帯情報が空`);
                }
            }
            
            console.log(`🔄 全パビリオン更新: ${this.lastSearchResults.length}件（満員も含む）`);
            
            // 全パビリオンを表示
            this.displayPavilions(this.lastSearchResults);
            
            // 空きパビリオン数を更新
            this.updateAvailableCount(this.lastSearchResults);
            
            // フィルタは現在の状態を維持（自動ON/OFFしない）
            this.applyStyleFilters();
            
            console.log(`✅ 全パビリオン更新完了: ${this.lastSearchResults.length}件表示`);
            console.log(`💾 検索結果: ${this.lastSearchResults.length}件（満員も含む）`);
            
        } catch (error) {
            console.error('❌ パビリオン更新エラー:', error);
            this.showPavilionError(`更新に失敗しました: ${error}`);
            this.showReservationResult(`❌ 更新に失敗しました: ${error}`, 'error');
        }
    }

    /**
     * 空きのみフィルターを切り替え
     */
    private toggleAvailableOnlyFilter(): void {
        this.isAvailableOnlyFilterActive = !this.isAvailableOnlyFilterActive;
        console.log(`📂 空きのみフィルター: ${this.isAvailableOnlyFilterActive ? 'ON' : 'OFF'}`);
        console.log(`🔽 フィルター${this.isAvailableOnlyFilterActive ? '有効化' : '無効化'}`);

        // フィルタボタンのUI状態を更新
        this.updateFilterButtonUI();
        
        this.applyStyleFilters();
    }

    /**
     * フィルタボタンのUI状態を更新
     */
    private updateFilterButtonUI(): void {
        const filterButton = this.mainDialogContainer?.querySelector('#filter-button');
        if (filterButton) {
            if (this.isAvailableOnlyFilterActive) {
                filterButton.classList.add('active');
            } else {
                filterButton.classList.remove('active');
            }
        }
    }


    /**
     * StyleベースのフィルターをDOM要素に適用
     */
    private applyStyleFilters(): void {
        const pavilionItems = this.mainDialogContainer?.querySelectorAll('.ytomo-pavilion-item');
        if (!pavilionItems) return;

        pavilionItems.forEach(item => {
            const pavilionElement = item as HTMLElement;

            // 空きのみフィルター
            if (this.isAvailableOnlyFilterActive) {
                // 満員パビリオン（dateStatus = 2）を非表示
                if (pavilionElement.classList.contains('full-pavilion')) {
                    pavilionElement.classList.add('hidden');
                } else {
                    pavilionElement.classList.remove('hidden');
                }
                
                // 時間帯ボタンは空きのみ表示（満員は非表示）
                const timeSlotButtons = pavilionElement.querySelectorAll('.ytomo-time-slot-button');
                timeSlotButtons.forEach(button => {
                    if (button.classList.contains('unavailable')) {
                        button.classList.add('hidden');
                    } else {
                        button.classList.remove('hidden');
                    }
                });
            } else {
                // フィルタ無効時は全て表示
                pavilionElement.classList.remove('hidden');
                
                // 全時間帯ボタンを表示
                const timeSlotButtons = pavilionElement.querySelectorAll('.ytomo-time-slot-button');
                timeSlotButtons.forEach(button => {
                    button.classList.remove('hidden');
                });
            }
        });

        console.log(`🎨 Styleフィルター適用: 空きのみ=${this.isAvailableOnlyFilterActive}`);
    }

    /**
     * 空きパビリオン数を更新
     */
    private updateAvailableCount(pavilions: PavilionData[]): void {
        // DOM要素ベースで空きパビリオン数を計算
        const pavilionItems = this.mainDialogContainer?.querySelectorAll('.ytomo-pavilion-item');
        let availableCount = 0;
        
        pavilionItems?.forEach(item => {
            const hasAvailableSlots = item.querySelector('.ytomo-time-slot-button.available');
            if (hasAvailableSlots) {
                availableCount++;
            }
        });
        
        const countBadge = this.mainDialogContainer?.querySelector('#available-count');
        if (countBadge) {
            countBadge.textContent = availableCount.toString();
        }
        
        console.log(`📊 空きパビリオン数: ${availableCount}/${pavilions.length} (styleベース)`);
    }

    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.hideMainDialog();
        
        // リアクティブシステムを破棄
        this.reactiveTicketManager?.destroy();
        
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

// ページ読み込み時点での事前データ読み込みを開始
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        mainDialogFab.startDataPreload();
    });
} else {
    // 既にDOMが読み込み済みの場合は即座に実行
    mainDialogFab.startDataPreload();
}