import { PageChecker } from './page-utils';
import { getTicketManager, TicketManager } from './ticket-manager';
import { ReactiveTicketManager, getReactiveTicketManager } from './reactive-ticket-manager';
import { getPavilionManager, PavilionManager } from './pavilion-manager';

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
        
        // リアクティブチケットマネージャーを初期化
        this.reactiveTicketManager = getReactiveTicketManager(this.ticketManager);
        
        // パビリオンマネージャーを初期化
        this.pavilionManager = getPavilionManager();
        
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
        console.log(`🎫 読み込まれたチケットID一覧:`, loadedTickets.map(t => `${t.ticket_id}(${t.isOwn ? '自分' : '他人'})`));

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
            // チケットマネージャーからデータを取得
            const tickets = this.ticketManager.getAllTickets();
            console.log('🔍 チケットマネージャーデータ:', tickets);
            
            if (tickets.length === 0) {
                throw new Error('チケットデータが見つかりません');
            }
            
            const availableDates = await this.extractAvailableDates(tickets);

            // チケットタブUIを構築
            await this.buildTicketTabUI(ticketTab as HTMLElement, tickets, availableDates);

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
    private async buildTicketTabUI(container: HTMLElement, tickets: any[], availableDates: string[]): Promise<void> {
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
                        <input type="text" id="ticket-id-input" placeholder="チケットID" class="ytomo-input-inline">
                        <input type="text" id="ticket-label-input" placeholder="Label" class="ytomo-input-inline">
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
    private async buildTicketList(tickets: any[]): Promise<string> {
        if (tickets.length === 0) {
            return `
                <div class="ytomo-empty-state">
                    <p>チケットが見つかりませんでした</p>
                </div>
            `;
        }

        // 状態0の入場予約があるチケットのみ表示
        const validTickets = tickets.filter(ticket => {
            const schedules = ticket.schedules || [];
            return schedules.some((schedule: any) => schedule.use_state === 0);
        });

        if (validTickets.length === 0) {
            return `
                <div class="ytomo-empty-state">
                    <p>利用可能なチケットが見つかりませんでした</p>
                </div>
            `;
        }

        const ticketPromises = validTickets.map(async ticket => `
            <div class="ytomo-ticket-item" data-ticket-id="${ticket.ticket_id}">
                <!-- 上半分: チケットID、Me Tip、Label -->
                <div class="ytomo-ticket-upper">
                    <span class="ytomo-ticket-id">${ticket.ticket_id}</span>
                    <span class="ytomo-me-tip">Me</span>
                </div>
                <!-- 下半分: 入場日時ボタン（予約種類も含む） -->
                <div class="ytomo-ticket-lower">
                    <div class="ytomo-entrance-dates">
                        ${await this.buildEntranceDateButtons(ticket.schedules || [], ticket)}
                    </div>
                </div>
            </div>
        `);
        
        const ticketResults = await Promise.all(ticketPromises);
        return ticketResults.join('');
    }

    /**
     * 入場日時ボタンを構築（調査結果に基づく）
     */
    private async buildEntranceDateButtons(schedules: any[], ticket: any): Promise<string> {
        if (!Array.isArray(schedules) || schedules.length === 0) {
            return '<span class="ytomo-no-entrance-dates">入場予約なし</span>';
        }

        // 状態0（未使用）の入場予約のみ表示
        const unusedSchedules = schedules.filter(schedule => schedule.use_state === 0);
        
        if (unusedSchedules.length === 0) {
            return '<span class="ytomo-no-entrance-dates">利用可能な入場予約なし</span>';
        }

        const buttonPromises = unusedSchedules.map(async schedule => {
            // 抽選カレンダーデータを取得
            const lotteryData = await this.fetchLotteryCalendar(schedule.entrance_date);
            const reservationStatus = this.getReservationStatus(schedule, lotteryData, ticket);
            const isDisabled = reservationStatus.availableTypes.length === 0;
            
            return `
                <button class="ytomo-entrance-date-button${isDisabled ? ' disabled' : ''}" 
                        data-date="${schedule.entrance_date}" 
                        data-use-state="${schedule.use_state}"
                        ${isDisabled ? 'disabled' : ''}>
                    <span class="ytomo-date-text">${this.formatDate(schedule.entrance_date)} ${schedule.schedule_name || ''}</span>
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
    private getReservationStatus(schedule: any, lotteryData?: any, ticket?: any): { statusText: string, availableTypes: string[] } {
        const statuses: string[] = [];
        const availableTypes: string[] = [];

        if (!lotteryData) {
            return { statusText: '確認中...', availableTypes: [] };
        }

        const now = new Date();
        const checkPeriod = (period: any) => {
            if (!period || !period.request_start || !period.request_end) return { isOpen: false, isExpired: false, notStarted: false };
            const start = new Date(period.request_start);
            const end = new Date(period.request_end);
            return { 
                isOpen: now >= start && now <= end,
                isExpired: now > end,
                notStarted: now < start
            };
        };

        const getStatusFromLottery = (lotteryArray: any[], lotteryType: '7day' | '2month', ticket: any) => {
            // 抽選データがある場合のみ処理
            if (lotteryArray?.length > 0) {
                const lottery = lotteryArray[0];
                
                // 申し込み状態を確認
                if (lottery.state === 0) {
                    return '提出';
                }
                
                // 当選判定: event_schedulesから実際の予約を確認
                if (lottery.state === 1 && ticket?.event_schedules?.length > 0) {
                    // registered_channelで予約種類を照合
                    const lotteryChannelMap = {
                        '7day': '2',   // 7日前抽選
                        '2month': '1'  // 2ヶ月前抽選
                    };
                    const expectedChannel = lotteryChannelMap[lotteryType];
                    
                    const hasActualReservation = ticket.event_schedules.some((eventSchedule: any) => 
                        eventSchedule.entrance_date === schedule.entrance_date && 
                        eventSchedule.registered_channel === expectedChannel
                    );
                    
                    return hasActualReservation ? 'あり' : '落選';
                } else if (lottery.state === 1) {
                    // event_schedulesがない場合は申し込み済みとして扱う
                    return '提出';
                } else {
                    // その他の状態は落選
                    return '落選';
                }
            }
            return 'なし';
        };

        const processReservationType = (
            label: string,
            reservationStatus: string,
            period: any
        ) => {
            if (period.isExpired) {
                // 期限後は「あり」のみ表示（落選・提出は表示しない）
                if (reservationStatus === 'あり') {
                    statuses.push(`${label}:あり`);
                }
            } else if (period.isOpen) {
                // 期限中は全状態表示
                if (reservationStatus === 'あり') {
                    statuses.push(`${label}:あり`);
                } else if (reservationStatus === '提出') {
                    statuses.push(`${label}:提出`);
                } else if (reservationStatus === '落選') {
                    statuses.push(`${label}:落選`);
                } else {
                    // 未申込で期限中
                    statuses.push(`${label}:なし`);
                    availableTypes.push(label);
                }
            }
            // 期限前（notStarted）は表示しない
        };

        // 表示順序: 1,3,週,月

        // 当日予約 - 左から1番目
        const onTheDayStatus = schedule.on_the_day ? 'あり' : 'なし';
        processReservationType('1', onTheDayStatus, checkPeriod(lotteryData.on_the_day_reservation));

        // 空き枠予約 - 左から2番目
        const emptyFrameStatus = schedule.empty_frame ? 'あり' : 'なし';
        processReservationType('3', emptyFrameStatus, checkPeriod(lotteryData.empty_frame_reservation));

        // 7日前抽選 - 左から3番目
        const dayStatus = getStatusFromLottery(schedule.lotteries?.day, '7day', ticket);
        processReservationType('週', dayStatus, checkPeriod(lotteryData.seven_days_ago_lottery));

        // 2ヶ月前抽選 - 左から4番目
        const monthStatus = getStatusFromLottery(schedule.lotteries?.month, '2month', ticket);
        processReservationType('月', monthStatus, checkPeriod(lotteryData.two_months_ago_lottery));

        return {
            statusText: statuses.join(' '),
            availableTypes
        };
    }

    /**
     * 利用可能日付を抽出（調査結果に基づく）
     */
    private async extractAvailableDates(tickets: any[]): Promise<string[]> {
        const dates = new Set<string>();
        
        for (const ticket of tickets) {
            if (ticket.schedules && Array.isArray(ticket.schedules)) {
                const unusedSchedules = ticket.schedules.filter((schedule: any) => schedule.use_state !== 1);
                
                for (const schedule of unusedSchedules) {
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

        return Array.from(dates).sort();
    }

    /**
     * 抽選カレンダーデータを取得
     */
    private async fetchLotteryCalendar(entranceDate: string): Promise<any> {
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

            const calendarData = await response.json();
            return calendarData.data || calendarData;
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
                } else {
                    // 未選択のボタンをクリック → 他の日付を全て解除してから選択
                    const allEntranceButtons = container.querySelectorAll('.ytomo-entrance-date-btn.selected');
                    allEntranceButtons.forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    
                    target.classList.add('selected');
                    console.log(`🎫 入場日時選択: ${date}`);
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
                        // その他の領域のクリック → 通常のトグル
                        this.reactiveTicketManager.toggleTicketSelection(ticketId);
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
                    (item as HTMLElement).style.display = 'none';
                } else {
                    (item as HTMLElement).style.display = '';
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
        
        if (!ticketIdInput) return;

        const ticketId = ticketIdInput.value.trim();
        const label = labelInput?.value.trim() || '外部チケット';

        if (!ticketId) {
            alert('チケットIDを入力してください');
            return;
        }

        try {
            await this.reactiveTicketManager.addExternalTicket(ticketId, label);
            
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
                            <span>📂</span>
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
                
                <!-- 予約結果表示 -->
                <div class="ytomo-result-display" id="result-display"></div>
                
                <!-- 選択情報表示 -->
                <div class="ytomo-selected-info" id="selected-info">選択中: なし</div>
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
            reservationType: '' // TODO: 実際の予約種類を取得
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
        const selectedTickets = this.ticketManager.getSelectedTickets();
        const selectedInfo = this.mainDialogContainer?.querySelector('#selected-info');
        
        if (selectedInfo) {
            const parts: string[] = [];
            
            // 選択チケット数
            if (selectedTickets.length > 0) {
                parts.push(`チケット: ${selectedTickets.length}個`);
            }
            
            // 選択入場日表示は削除
            
            // 選択時間帯
            if (selectedTimeSlots.length > 0) {
                const { pavilionId, timeSlot } = selectedTimeSlots[0];
                parts.push(`予約: ${pavilionId} ${timeSlot.time}`);
            }
            
            selectedInfo.textContent = parts.length > 0 ? parts.join(' | ') : '選択中: なし';
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
        
        // タブボタン下半分の表示
        if (tabDates) {
            tabDates.textContent = dateStr;
        }
        
        console.log(`🗓️ パビリオンタブ日付更新: ${dateStr}`);
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
            refreshButton.addEventListener('click', () => this.handlePavilionSearch());
        }

        // お気に入りボタン
        const favoritesButton = this.mainDialogContainer?.querySelector('#favorites-button');
        if (favoritesButton) {
            favoritesButton.addEventListener('click', () => this.toggleFavoritesFilter());
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
     * パビリオン検索を実行
     */
    private async handlePavilionSearch(): Promise<void> {
        try {
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

            console.log(`🔍 パビリオン検索実行: クエリ="${query}", チケット数=${ticketIds.length}, 入場日=${entranceDate}`);
            
            const pavilions = await this.pavilionManager.searchPavilions(query, ticketIds, entranceDate);
            
            // フィルター適用
            const filteredPavilions = this.applyFilters(pavilions);
            
            this.displayPavilions(filteredPavilions);
            
            console.log(`✅ パビリオン検索完了: ${pavilions.length}件中${filteredPavilions.length}件表示`);
            
        } catch (error) {
            console.error('❌ パビリオン検索エラー:', error);
            this.showReservationResult(`❌ 検索に失敗しました: ${error}`, 'error');
        }
    }

    /**
     * 空きのみフィルターを切り替え
     */
    private toggleAvailableOnlyFilter(): void {
        const filterButton = this.mainDialogContainer?.querySelector('#filter-button');
        if (!filterButton) return;

        const isActive = filterButton.classList.toggle('active');
        console.log(`📂 空きのみフィルター: ${isActive ? 'ON' : 'OFF'}`);

        // 現在の検索結果に対してフィルターを再適用
        this.reapplyFilters();
    }

    /**
     * お気に入りフィルターを切り替え
     */
    private toggleFavoritesFilter(): void {
        const favoritesButton = this.mainDialogContainer?.querySelector('#favorites-button');
        if (!favoritesButton) return;

        const isActive = favoritesButton.classList.toggle('active');
        console.log(`⭐ お気に入りフィルター: ${isActive ? 'ON' : 'OFF'}`);

        this.reapplyFilters();
    }

    /**
     * フィルターを適用
     */
    private applyFilters(pavilions: any[]): any[] {
        let filtered = [...pavilions];

        const filterButton = this.mainDialogContainer?.querySelector('#filter-button');
        const favoritesButton = this.mainDialogContainer?.querySelector('#favorites-button');

        // 空きのみフィルター
        if (filterButton?.classList.contains('active')) {
            filtered = this.pavilionManager.filterAvailableOnly(filtered);
        }

        // お気に入りフィルター
        if (favoritesButton?.classList.contains('active')) {
            filtered = filtered.filter(p => p.isFavorite);
        }

        return filtered;
    }

    /**
     * フィルターを再適用
     */
    private reapplyFilters(): void {
        const allPavilions = Array.from(this.pavilionManager.getAllPavilions());
        const filteredPavilions = this.applyFilters(allPavilions);
        this.displayPavilions(filteredPavilions);
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