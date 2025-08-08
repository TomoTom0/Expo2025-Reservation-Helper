// ====================================================================================
// 【9. 同行者追加機能】- Companion Ticket Management
// ====================================================================================
// チケット選択画面での同行者追加操作自動化機能
// - チケットID管理・保存機能
// - FABダイアログによる一括操作
// - 同行者追加画面での自動処理

// URL検出と画面判定
export function isTicketSelectionPage(): boolean {
    return window.location.href.includes('ticket_selection');
}

export function isAgentTicketPage(): boolean {
    return window.location.href.includes('agent_ticket');
}

// チケットID管理システム
interface SavedTicketId {
    id: string;
    label: string;
    addedAt: number;
    lastUsed?: number;
}

class CompanionTicketManager {
    private static readonly STORAGE_KEY = 'ytomo-companion-tickets';
    private ticketIds: SavedTicketId[] = [];

    constructor() {
        this.loadTicketIds();
    }

    // ローカルストレージからチケットID一覧を読み込み
    private loadTicketIds(): void {
        try {
            const stored = localStorage.getItem(CompanionTicketManager.STORAGE_KEY);
            if (stored) {
                this.ticketIds = JSON.parse(stored);
                console.log(`✅ 保存済みチケットID ${this.ticketIds.length}件を読み込みました`);
            }
        } catch (error) {
            console.warn('チケットIDの読み込みに失敗:', error);
            this.ticketIds = [];
        }
    }

    // ローカルストレージに保存
    private saveTicketIds(): void {
        try {
            localStorage.setItem(CompanionTicketManager.STORAGE_KEY, JSON.stringify(this.ticketIds));
        } catch (error) {
            console.error('チケットIDの保存に失敗:', error);
        }
    }

    // チケットID追加
    addTicketId(id: string, label?: string): boolean {
        if (!id.trim()) return false;
        
        // 重複チェック
        if (this.ticketIds.some(ticket => ticket.id === id)) {
            console.log(`チケットID ${id} は既に登録済みです`);
            return false;
        }

        const now = Date.now();
        const defaultLabel = label?.trim() || new Date(now).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        const newTicket: SavedTicketId = {
            id: id.trim(),
            label: defaultLabel,
            addedAt: now
        };

        this.ticketIds.unshift(newTicket); // 先頭に追加（最新順）
        this.saveTicketIds();
        console.log(`✅ チケットID "${id}" を追加しました`);
        return true;
    }

    // チケットID削除
    removeTicketId(id: string): boolean {
        const initialLength = this.ticketIds.length;
        this.ticketIds = this.ticketIds.filter(ticket => ticket.id !== id);
        
        if (this.ticketIds.length < initialLength) {
            this.saveTicketIds();
            console.log(`🗑️ チケットID "${id}" を削除しました`);
            return true;
        }
        return false;
    }

    // 全チケットID取得
    getAllTicketIds(): SavedTicketId[] {
        return [...this.ticketIds];
    }

    // 使用時刻更新
    markAsUsed(id: string): void {
        const ticket = this.ticketIds.find(t => t.id === id);
        if (ticket) {
            ticket.lastUsed = Date.now();
            this.saveTicketIds();
        }
    }

    // キャッシュクリア
    clearAll(): void {
        this.ticketIds = [];
        localStorage.removeItem(CompanionTicketManager.STORAGE_KEY);
        console.log('🧹 全チケットIDをクリアしました');
    }
}

// グローバルマネージャーインスタンス
export const companionTicketManager = new CompanionTicketManager();

// 同行者追加実行状態管理
interface CompanionProcessState {
    isRunning: boolean;
    currentTicketId?: string;
    queuedTicketIds: string[];
    successCount: number;
    errorCount: number;
    errors: Array<{ticketId: string, message: string, timestamp: number}>;
}

class CompanionProcessManager {
    private state: CompanionProcessState = {
        isRunning: false,
        queuedTicketIds: [],
        successCount: 0,
        errorCount: 0,
        errors: []
    };

    // 処理開始
    startProcess(ticketIds: string[]): void {
        if (this.state.isRunning) {
            console.warn('同行者追加処理は既に実行中です');
            return;
        }

        this.state = {
            isRunning: true,
            queuedTicketIds: [...ticketIds],
            successCount: 0,
            errorCount: 0,
            errors: []
        };

        console.log(`🚀 同行者追加処理開始: ${ticketIds.length}件のチケットID`);
        this.processNext();
    }

    // 次のチケットID処理
    private async processNext(): Promise<void> {
        if (this.state.queuedTicketIds.length === 0) {
            this.completeProcess();
            return;
        }

        const ticketId = this.state.queuedTicketIds.shift()!;
        this.state.currentTicketId = ticketId;

        console.log(`📝 処理中: ${ticketId} (残り${this.state.queuedTicketIds.length}件)`);

        try {
            const success = await this.processTicketId(ticketId);
            if (success) {
                this.state.successCount++;
                companionTicketManager.markAsUsed(ticketId);
            } else {
                this.handleError(ticketId, '処理に失敗しました');
            }
        } catch (error) {
            this.handleError(ticketId, error instanceof Error ? error.message : '不明なエラー');
        }

        // 次の処理（待機時間後）
        setTimeout(() => this.processNext(), 1000 + Math.random() * 1000);
    }

    // 個別チケットID処理（実際の同行者追加処理）
    private async processTicketId(ticketId: string): Promise<boolean> {
        console.log(`🎫 チケットID ${ticketId} の処理開始`);

        try {
            // Phase 1: チケット選択画面で同行者追加ボタンをクリック
            if (isTicketSelectionPage()) {
                const success = await this.clickCompanionAddButton();
                if (!success) {
                    throw new Error('同行者追加ボタンのクリックに失敗');
                }

                // 画面遷移を待機
                await this.waitForPageTransition();
            }

            // Phase 2: 同行者追加画面でチケットIDを入力
            if (!isAgentTicketPage()) {
                throw new Error('同行者追加画面への遷移に失敗');
            }

            // チケットID入力
            const inputSuccess = await this.inputTicketId(ticketId);
            if (!inputSuccess) {
                throw new Error('チケットID入力に失敗');
            }

            // 追加ボタンクリック
            const addSuccess = await this.clickAddButton();
            if (!addSuccess) {
                throw new Error('追加ボタンのクリックに失敗');
            }

            // 結果判定
            const result = await this.checkResult();
            return result;

        } catch (error) {
            console.error(`❌ チケットID ${ticketId} の処理エラー:`, error);
            return false;
        }
    }

    // 同行者追加ボタンをクリック（チケット選択画面、動的待機付き）
    private async clickCompanionAddButton(): Promise<boolean> {
        console.log('🔍 同行者追加ボタンを探しています...');
        
        // 動的待機でボタンを取得
        const span = await this.waitForElement<HTMLSpanElement>(
            'a.basic-btn.type1 span[data-message-code="SW_GP_DL_108_0042"]',
            15000 // 15秒待機
        );
        
        if (!span || !span.parentElement) {
            console.error('❌ 同行者追加ボタンが見つかりません（タイムアウト）');
            return false;
        }

        const button = span.parentElement as HTMLElement;
        
        try {
            button.click();
            console.log('✅ 同行者追加ボタンをクリックしました');
            return true;
        } catch (error) {
            console.error('❌ 同行者追加ボタンのクリックでエラー:', error);
            return false;
        }
    }

    // ページ遷移を待機
    private async waitForPageTransition(): Promise<void> {
        const maxWaitTime = 10000; // 10秒
        const checkInterval = 500;
        let elapsed = 0;

        return new Promise((resolve, reject) => {
            const checkTransition = () => {
                if (isAgentTicketPage() && document.getElementById('agent_ticket_id_register')) {
                    console.log('✅ 同行者追加画面への遷移完了（入力欄も確認済み）');
                    resolve();
                    return;
                }

                elapsed += checkInterval;
                if (elapsed >= maxWaitTime) {
                    reject(new Error('ページ遷移タイムアウト'));
                    return;
                }

                setTimeout(checkTransition, checkInterval);
            };

            setTimeout(checkTransition, checkInterval);
        });
    }

    // チケットID入力
    private async inputTicketId(ticketId: string): Promise<boolean> {
        const inputField = document.getElementById('agent_ticket_id_register') as HTMLInputElement;
        
        if (!inputField) {
            // 他の可能なセレクタを試す
            const alternativeSelectors = [
                'input[placeholder*="チケットID"]',
                'input[aria-label*="チケットID"]',
                '.style_main__register_input__wHzkJ',
                'input[maxlength="10"]'
            ];
            
            for (const selector of alternativeSelectors) {
                const altInput = document.querySelector(selector) as HTMLInputElement;
                if (altInput) {
                    return this.performInput(altInput, ticketId);
                }
            }
            
            return false;
        }
        
        return this.performInput(inputField, ticketId);
    }
    
    // 実際の入力処理
    private async performInput(inputField: HTMLInputElement, ticketId: string): Promise<boolean> {

        // 入力欄をクリア
        inputField.value = '';
        inputField.focus();

        // チケットIDを入力
        inputField.value = ticketId;
        
        // input/changeイベントを発火
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        inputField.dispatchEvent(new Event('change', { bubbles: true }));

        console.log(`✅ チケットID "${ticketId}" を入力しました`);
        return true;
    }

    // 追加ボタンをクリック（動的待機付き）
    private async clickAddButton(): Promise<boolean> {
        console.log('🔍 追加ボタンを探しています...');
        
        // 動的待機でボタンを取得（iPhone Safariでも確実）
        const addButton = await this.waitForElement<HTMLButtonElement>(
            'button.basic-btn.type2.style_main__register_btn__FHBxM', 
            15000 // 15秒待機（モバイル環境考慮）
        );
        
        if (!addButton) {
            console.error('❌ 追加ボタンが見つかりません（タイムアウト）');
            return false;
        }

        // disabled状態もリトライで確認
        let retryCount = 0;
        const maxRetries = 10;
        
        while (addButton.disabled && retryCount < maxRetries) {
            console.log(`⏳ 追加ボタンが無効化中... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            retryCount++;
        }
        
        if (addButton.disabled) {
            console.warn('⚠️ 追加ボタンが無効化されています');
            return false;
        }

        // タッチイベント対応のクリック
        try {
            addButton.click();
            console.log('✅ 追加ボタンをクリックしました');
            
            // 処理完了を待機
            await this.waitForProcessingComplete();
            return true;
        } catch (error) {
            console.error('❌ 追加ボタンのクリックでエラー:', error);
            return false;
        }
    }

    // 処理完了を待機
    private async waitForProcessingComplete(): Promise<void> {
        const maxWaitTime = 10000; // 10秒
        const checkInterval = 500;
        let elapsed = 0;

        return new Promise((resolve) => {
            const checkComplete = () => {
                // エラーメッセージまたは成功画面の存在を確認
                const errorMessage = document.querySelector('.style_main__error_message__oE5HC');
                const successArea = document.querySelector('.style_main__head__LLhtg');
                const nextButton = document.querySelector('button.basic-btn.type2:not(.style_main__register_btn__FHBxM)');

                if (errorMessage || successArea || nextButton) {
                    resolve();
                    return;
                }

                elapsed += checkInterval;
                if (elapsed >= maxWaitTime) {
                    console.warn('処理完了の確認がタイムアウトしました');
                    resolve();
                    return;
                }

                setTimeout(checkComplete, checkInterval);
            };

            setTimeout(checkComplete, checkInterval);
        });
    }

    // 結果判定
    private async checkResult(): Promise<boolean> {
        // エラーメッセージをチェック
        const errorMessages = document.querySelectorAll('.style_main__error_message__oE5HC');
        
        if (errorMessages.length > 0) {
            const errorTexts = Array.from(errorMessages).map(el => el.textContent?.trim()).join('; ');
            console.error(`❌ エラー: ${errorTexts}`);
            return false;
        }

        // 成功画面をチェック
        const successArea = document.querySelector('.style_main__head__LLhtg');
        const nextButton = document.querySelector('button.basic-btn.type2:not(.style_main__register_btn__FHBxM)');
        
        if (successArea && nextButton) {
            console.log('✅ チケット追加成功');
            
            // 「チケット選択画面に追加する」ボタンをクリック
            (nextButton as HTMLButtonElement).click();
            
            // チケット選択画面への戻りを待機
            await this.waitForReturnToTicketSelection();
            
            return true;
        }

        console.warn('⚠️ 結果の判定ができませんでした');
        return false;
    }

    // チケット選択画面への戻りを待機
    private async waitForReturnToTicketSelection(): Promise<void> {
        const maxWaitTime = 10000; // 10秒
        const checkInterval = 500;
        let elapsed = 0;

        return new Promise((resolve) => {
            const checkReturn = () => {
                if (isTicketSelectionPage()) {
                    console.log('✅ チケット選択画面に戻りました');
                    resolve();
                    return;
                }

                elapsed += checkInterval;
                if (elapsed >= maxWaitTime) {
                    console.warn('チケット選択画面への戻りがタイムアウトしました');
                    resolve();
                    return;
                }

                setTimeout(checkReturn, checkInterval);
            };

            setTimeout(checkReturn, checkInterval);
        });
    }

    // 要素の動的待機（汎用）
    private async waitForElement<T extends Element>(selector: string, timeout: number = 10000): Promise<T | null> {
        const checkInterval = 200; // 200ms間隔でチェック
        let elapsed = 0;

        return new Promise((resolve) => {
            const checkElement = () => {
                const element = document.querySelector(selector) as T;
                
                if (element) {
                    console.log(`✅ 要素が見つかりました: ${selector}`);
                    resolve(element);
                    return;
                }

                elapsed += checkInterval;
                if (elapsed >= timeout) {
                    console.warn(`⚠️ 要素待機タイムアウト: ${selector} (${timeout}ms)`);
                    resolve(null);
                    return;
                }

                setTimeout(checkElement, checkInterval);
            };

            checkElement(); // 即座にチェック開始
        });
    }

    // エラーハンドリング
    private handleError(ticketId: string, message: string): void {
        this.state.errorCount++;
        this.state.errors.push({
            ticketId,
            message,
            timestamp: Date.now()
        });
        console.error(`❌ チケットID ${ticketId}: ${message}`);
    }

    // 処理完了
    private completeProcess(): void {
        const { successCount, errorCount } = this.state;
        console.log(`✅ 同行者追加処理完了: 成功${successCount}件, エラー${errorCount}件`);
        
        this.state.isRunning = false;
        this.state.currentTicketId = undefined;
        
        // チェック解除は initializeTicketSelectionPage でのみ実行する
        // （ユーザーの手動チェックを保護するため）
    }

    // 処理停止
    stopProcess(): void {
        if (this.state.isRunning) {
            console.log('🛑 同行者追加処理を停止しました');
            this.state.isRunning = false;
            this.state.currentTicketId = undefined;
            this.state.queuedTicketIds = [];
        }
    }

    // 現在の状態取得
    getState(): Readonly<CompanionProcessState> {
        return { ...this.state };
    }
}

// グローバルプロセスマネージャーインスタンス
export const companionProcessManager = new CompanionProcessManager();

// ページタイプごとの初期化関数
export function initializeTicketSelectionPage(): void {
    // 既存のチケットチェックを全て外す（同行者追加後の自動チェックを防止）
    setTimeout(() => {
        uncheckAllTickets();
    }, 800); // 少し遅らせてDOMが安定してから実行
    
    createTicketSelectionFAB();
    
    // チケット選択変更の監視を開始（視覚フィードバック用）
    setTimeout(() => {
        startTicketSelectionMonitoring();
    }, 1500); // FAB作成後に開始
}

export function initializeAgentTicketPage(): void {
    console.log('👥 同行者追加画面を初期化中...');
    
    // 現在のページがagent_ticketか確認
    if (!window.location.href.includes('agent_ticket')) {
        console.log('🚫 agent_ticketページではないため初期化をスキップ');
        return;
    }
    
    // 同行者追加画面ではFABは不要
    console.log('✅ 同行者追加画面の初期化完了（FAB作成なし）');
}

// FABダイアログ作成（画面に応じて切り替え）
export function createCompanionTicketFAB(): void {
    // チケット選択画面の場合
    if (isTicketSelectionPage()) {
        initializeTicketSelectionPage();
        return;
    }

    // 同行者追加画面の場合
    if (isAgentTicketPage()) {
        initializeAgentTicketPage();
        return;
    }
}

// 日付ボタンのみを更新（既存FAB再利用時）
function updateDateButtonsOnly(subButtonsContainer: HTMLElement): void {
    console.log('🗓️ 日付ボタンのみ更新します');
    
    const tickets = getTicketElements();
    const availableDates = getAvailableDates(tickets);
    
    // 既存の日付ボタンをクリア
    const existingDateButtons = subButtonsContainer.querySelectorAll('.ytomo-date-button');
    existingDateButtons.forEach(btn => btn.remove());
    console.log(`🗑️ 既存の日付ボタン${existingDateButtons.length}個を削除`);
    
    if (availableDates.length === 0) {
        console.log('📅 利用可能な日付がないため、日付ボタンは作成しません');
        return;
    }
    
    // 同行者ボタンを保持（削除しない）
    const companionButton = subButtonsContainer.querySelector('.ytomo-sub-fab:not(.ytomo-date-button)') as HTMLElement;
    
    // 新しい日付ボタンを同行者ボタンの前に挿入
    availableDates.slice(0, 3).forEach((date, index) => {
        const formatted = formatDateForLabel(date);
        const buttonLabel = '選択';
        
        const button = createSubFABButton(buttonLabel, () => {
            if (index === 2 && availableDates.length > 3) {
                showDateSelectionDialog(availableDates);
            } else {
                toggleNearestDateSelection(date);
            }
        });
        
        button.classList.add('ytomo-date-button');
        if (index === 0) button.style.fontWeight = 'bold !important';
        
        const displayText = (index === 2 && availableDates.length > 3) ? '他' : formatted;
        button.innerHTML = `${buttonLabel} <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${displayText}</span>`;
        
        // 同行者ボタンの前に挿入
        if (companionButton) {
            subButtonsContainer.insertBefore(button, companionButton);
        } else {
            subButtonsContainer.appendChild(button);
        }
    });
    
    console.log(`✅ 日付ボタン更新完了: ${Math.min(availableDates.length, 3)}個のボタンを作成`);
}

// チケット選択画面用のFAB（展開可能）
function createTicketSelectionFAB(): void {

    // 既存FABコンテナがある場合は子ボタンのみ更新
    const existingFabContainer = document.getElementById('ytomo-ticket-selection-fab-container');
    if (existingFabContainer) {
        console.log('✅ 既存のチケット選択FABコンテナを再利用し、子ボタンを更新します');
        
        // 既存の子ボタンコンテナを取得
        const existingSubContainer = existingFabContainer.querySelector('#ytomo-companion-sub-buttons');
        if (existingSubContainer) {
            // 日付ボタンのみ更新（同行者ボタンは保持）
            updateDateButtonsOnly(existingSubContainer as HTMLElement);
        }
        return;
    }

    // FAB展開状態管理（初期状態を展開に）
    let isExpanded = true;

    // チケット選択画面用FABコンテナ作成（パビリオン検索画面と同様の構造）
    const fabContainer = document.createElement('div');
    fabContainer.id = 'ytomo-ticket-selection-fab-container';
    fabContainer.classList.add('ytomo-companion-fab', 'ytomo-ticket-selection-page');
    
    // FAB作成ログ
    console.log('✨ チケット選択画面用同行者FABを作成しました:', fabContainer.id);
    fabContainer.style.cssText = `
        position: fixed !important;
        bottom: 100px !important;
        right: 24px !important;
        z-index: 10000 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        align-items: flex-end !important;
        pointer-events: auto !important;
    `;

    // 子ボタンコンテナ（展開される部分）
    const subButtonsContainer = document.createElement('div');
    subButtonsContainer.id = 'ytomo-companion-sub-buttons';
    subButtonsContainer.style.cssText = `
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        align-items: flex-end !important;
        transition: all 0.3s ease !important;
    `;

    
    // 同行者ボタン
    const companionButton = createSubFABButton('同行者チケット', () => {
        showCompanionTicketDialog();
    });

    // 日付ボタンを動的生成する関数
    const createDynamicDateButtons = () => {
        const tickets = getTicketElements();
        const availableDates = getAvailableDates(tickets);
        
        // 既存の日付ボタンをクリア
        const existingDateButtons = subButtonsContainer.querySelectorAll('.ytomo-date-button');
        existingDateButtons.forEach(btn => btn.remove());
        
        if (availableDates.length === 0) {
            return; // 日付がない場合はボタンを作らない
        }

        // 同行者ボタンを一時的に削除して最後に再追加
        if (companionButton.parentNode === subButtonsContainer) {
            subButtonsContainer.removeChild(companionButton);
        }

        if (availableDates.length === 1) {
            // 1種類のみの場合: 1個のボタン
            const date = availableDates[0];
            const formatted = formatDateForLabel(date);
            const button = createSubFABButton('選択', () => {
                toggleNearestDateSelection(date);
            });
            button.classList.add('ytomo-date-button');
            button.style.fontWeight = 'bold !important';
            // 日付部分を強調表示で追加
            button.innerHTML = `選択 <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${formatted}</span>`;
            subButtonsContainer.appendChild(button);
        } else if (availableDates.length === 2) {
            // 2種類の場合: 2個のボタン
            availableDates.forEach((date, index) => {
                const formatted = formatDateForLabel(date);
                const button = createSubFABButton('選択', () => {
                    toggleNearestDateSelection(date);
                });
                button.classList.add('ytomo-date-button');
                if (index === 0) button.style.fontWeight = 'bold !important';
                // 日付部分を強調表示で追加
                button.innerHTML = `選択 <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${formatted}</span>`;
                subButtonsContainer.appendChild(button);
            });
        } else {
            // 3種類以上の場合: 3個のボタン
            // ボタン1: 1番目の日付
            const firstDate = availableDates[0];
            const firstFormatted = formatDateForLabel(firstDate);
            const firstButton = createSubFABButton('選択', () => {
                toggleNearestDateSelection(firstDate);
            });
            firstButton.classList.add('ytomo-date-button');
            firstButton.style.fontWeight = 'bold !important';
            // 日付部分を強調表示で追加
            firstButton.innerHTML = `選択 <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${firstFormatted}</span>`;
            subButtonsContainer.appendChild(firstButton);

            // ボタン2: 2番目の日付
            const secondDate = availableDates[1];
            const secondFormatted = formatDateForLabel(secondDate);
            const secondButton = createSubFABButton('選択', () => {
                toggleNearestDateSelection(secondDate);
            });
            secondButton.classList.add('ytomo-date-button');
            // 日付部分を強調表示で追加
            secondButton.innerHTML = `選択 <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${secondFormatted}</span>`;
            subButtonsContainer.appendChild(secondButton);

            // ボタン3: 3番目の日付（利用可能な場合）
            if (availableDates.length >= 3) {
                const thirdDate = availableDates[2];
                const thirdFormatted = formatDateForLabel(thirdDate);
                
                if (availableDates.length >= 4) {
                    // 4種類以上の場合: 「選択」部分と日付部分で異なる動作
                    const thirdButton = createSubFABButton('選択', () => {
                        // デフォルトは3番目の日付を選択
                        toggleNearestDateSelection(thirdDate);
                    });
                    thirdButton.classList.add('ytomo-date-button');
                    
                    // 日付部分を強調表示で追加（クリック可能）
                    const dateSpan = document.createElement('span');
                    dateSpan.style.cssText = `
                        font-family: 'Courier New', 'Monaco', monospace !important;
                        font-weight: bold !important;
                        color: #ffeb3b !important;
                        vertical-align: baseline !important;
                        cursor: pointer !important;
                        text-decoration: underline !important;
                    `;
                    dateSpan.textContent = '他';
                    
                    // 日付部分クリック時は日付選択ダイアログを開く
                    dateSpan.addEventListener('click', (e) => {
                        e.stopPropagation(); // 親ボタンのクリックを防ぐ
                        showDateSelectionDialog(availableDates);
                    });
                    
                    thirdButton.innerHTML = '選択 ';
                    thirdButton.appendChild(dateSpan);
                    subButtonsContainer.appendChild(thirdButton);
                } else {
                    // 3種類の場合: 通常の3番目日付ボタン
                    const thirdButton = createSubFABButton('選択', () => {
                        toggleNearestDateSelection(thirdDate);
                    });
                    thirdButton.classList.add('ytomo-date-button');
                    // 日付部分を強調表示で追加
                    thirdButton.innerHTML = `選択 <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${thirdFormatted}</span>`;
                    subButtonsContainer.appendChild(thirdButton);
                }
            }
        }

        // 同行者ボタンを最後に追加
        subButtonsContainer.appendChild(companionButton);
    };
    
    // DOM要素の準備を待機して初期更新を実行
    let retryCount = 0;
    const maxRetries = 10;
    
    const waitForTicketsAndUpdate = () => {
        const tickets = getTicketElements();
        
        if (tickets.length > 0) {
            console.log(`🎫 チケット${tickets.length}件を検出、日付ボタンを更新します`);
            createDynamicDateButtons();
        } else if (retryCount < maxRetries) {
            retryCount++;
            console.log(`⏳ チケット検出待機中... (${retryCount}/${maxRetries})`);
            setTimeout(waitForTicketsAndUpdate, 500);
        } else {
            console.warn('⚠️ チケット検出がタイムアウトしました');
        }
    };
    
    // 初期の同行者ボタン配置（日付ボタンが未生成の状態）
    subButtonsContainer.appendChild(companionButton);
    
    // 初期更新を開始
    setTimeout(waitForTicketsAndUpdate, 1000);

    // メインFABボタン作成（パビリオン検索FABと統一デザイン）
    const mainFabButton = document.createElement('button');
    mainFabButton.id = 'ytomo-ticket-selection-main-fab';
    mainFabButton.classList.add('ext-ytomo', 'ytomo-fab', 'ytomo-fab-enabled');
    
    // FABボタンにrelative positionを設定
    mainFabButton.style.position = 'relative';

    // FABボタンの内容構造（パビリオンFABと同じ構造）
    const fabContent = document.createElement('div');
    fabContent.style.cssText = `
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        height: 100% !important;
        pointer-events: none !important;
    `;

    // 展開/縮小アイコン（上部）
    const expandIcon = document.createElement('div');
    expandIcon.style.cssText = `
        font-size: 8px !important;
        line-height: 1 !important;
        margin-bottom: 1px !important;
        opacity: 0.8 !important;
    `;
    
    // YTomoテキスト（中央）
    const brandText = document.createElement('div');
    brandText.style.cssText = `
        font-size: 7px !important;
        font-weight: normal !important;
        line-height: 1 !important;
        margin-bottom: 2px !important;
        opacity: 0.7 !important;
    `;
    brandText.innerText = 'YTomo';

    // 機能表示（下部）
    const functionText = document.createElement('div');
    functionText.style.cssText = `
        font-size: 9px !important;
        font-weight: bold !important;
        line-height: 1 !important;
        white-space: nowrap !important;
    `;
    functionText.innerText = 'チケット';

    // アイコン更新関数
    function updateMainButtonIcon() {
        expandIcon.innerHTML = isExpanded ? '▼' : '▲';
    }
    updateMainButtonIcon();

    // DOM構築
    fabContent.appendChild(expandIcon);
    fabContent.appendChild(brandText);
    fabContent.appendChild(functionText);
    mainFabButton.appendChild(fabContent);

    // ホバー効果（パビリオンFABと同じ）
    mainFabButton.addEventListener('mouseenter', () => {
        mainFabButton.style.transform = 'scale(1.15)';
        mainFabButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)';
        mainFabButton.style.borderWidth = '4px';
    });

    mainFabButton.addEventListener('mouseleave', () => {
        mainFabButton.style.transform = 'scale(1.0)';
        mainFabButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)';
        mainFabButton.style.borderWidth = '3px';
    });

    // メインボタンクリック（展開/縮小）
    mainFabButton.addEventListener('click', () => {
        isExpanded = !isExpanded;
        subButtonsContainer.style.display = isExpanded ? 'flex' : 'none';
        updateMainButtonIcon();
    });

    // DOM追加
    fabContainer.appendChild(subButtonsContainer);
    fabContainer.appendChild(mainFabButton);
    document.documentElement.appendChild(fabContainer);

    
    
}

// 子FABボタン作成ヘルパー関数（パビリオン検索画面と完全統一）
function createSubFABButton(label: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('ext-ytomo', 'pavilion-sub-btn', 'btn-enabled');
    button.textContent = label;
    // インラインスタイル完全削除 - 全てSCSSで管理

    // クリックイベント
    button.addEventListener('click', onClick);

    return button;
}


// チケット要素を取得
function getTicketElements(): Element[] {
    return Array.from(document.querySelectorAll('.col3'));
}

// チケットから来場日時を抽出（複数のセレクタを試行）
function extractVisitingDate(ticketElement: Element): Date | null {
    try {
        // ランダムハッシュを避けて安定したセレクタを使用
        const selectors = [
            'dt[class*="style_visiting_date"] + dd span', // 来場日時dtの隣のdd内のspan
            'dd[class*="style_visiting_date"] span',      // 来場日時dd内のspan
            'dl[class*="style_detail"] dd:nth-child(4) span', // 2番目のdiv(来場日時)のspan
            'dl dd:last-child span',                      // dl内の最後のdd内のspan
            '.col3 dl dd span'                           // フォールバック
        ];

        let dateText: string | null = null;
        
        for (const selector of selectors) {
            const dateElement = ticketElement.querySelector(selector);
            if (dateElement) {
                dateText = dateElement.textContent?.trim();
                
                // "未設定"でない場合は有効な日付テキストとみなす
                if (dateText && !dateText.includes('未設定')) {
                    break;
                }
            }
        }

        if (!dateText || dateText.includes('未設定')) {
            return null;
        }

        // "2025年8月17日(日) 10:00-" -> "2025-08-17" の形式に変換
        const match = dateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (!match) {
            return null;
        }

        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // 月は0ベース
        const day = parseInt(match[3]);

        const date = new Date(year, month, day);
        return date;
    } catch (error) {
        console.error('日付抽出エラー:', error);
        return null;
    }
}

// チケットから日付のみを抽出する共通関数
function getTicketDateOnly(ticket: Element): Date | null {
    const visitingDate = extractVisitingDate(ticket);
    if (!visitingDate) return null;
    
    // 時刻を無視して日付のみを返す
    return new Date(visitingDate.getFullYear(), visitingDate.getMonth(), visitingDate.getDate());
}

// 指定日付と一致するチケットを取得
function getTicketsByDate(tickets: Element[], targetDate: Date): Element[] {
    const matchingTickets: Element[] = [];
    
    for (const ticket of tickets) {
        const ticketDate = getTicketDateOnly(ticket);
        if (ticketDate && ticketDate.getTime() === targetDate.getTime()) {
            matchingTickets.push(ticket);
        }
    }
    
    return matchingTickets;
}

// 全てのチケットのチェックを外す（動的待機付き）
function uncheckAllTickets(): void {
    let retryCount = 0;
    const maxRetries = 5;
    
    const uncheckProcess = () => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"][id*="ticket_"]') as NodeListOf<HTMLInputElement>;
        
        if (checkboxes.length === 0 && retryCount < maxRetries) {
            retryCount++;
            setTimeout(uncheckProcess, 300);
            return;
        }
        
        let uncheckedCount = 0;
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                checkbox.click(); // チェックを外す
                uncheckedCount++;
            }
        });
        
        if (uncheckedCount > 0) {
            console.log(`✅ ${uncheckedCount}件のチケットチェックを外しました`);
        }
    };
    
    uncheckProcess();
}

// 指定日付のチケットがすべて選択されているかチェック
function isDateFullySelected(targetDate: Date, tickets: Element[]): boolean {
    const targetDateTickets = getTicketsByDate(tickets, targetDate);
    
    if (targetDateTickets.length === 0) {
        return false;
    }
    
    // 対象日付の全チケットが選択されているかチェック
    const allSelected = targetDateTickets.every(ticket => {
        const parentLi = ticket.closest('li');
        const checkbox = parentLi?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        return checkbox?.checked;
    });
    
    // 他の日付のチケットが選択されていないかチェック
    const otherTicketsSelected = tickets.some(ticket => {
        if (targetDateTickets.includes(ticket)) {
            return false; // 対象日付のチケットは除外
        }
        const parentLi = ticket.closest('li');
        const checkbox = parentLi?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        return checkbox?.checked;
    });
    
    return allSelected && !otherTicketsSelected;
}

// 日付ボタンの選択状態を更新
function updateDateButtonStates(): void {
    const tickets = getTicketElements();
    const availableDates = getAvailableDates(tickets);
    
    // 全ての日付ボタンの選択状態を更新
    const dateButtons = document.querySelectorAll('.ytomo-date-button');
    
    dateButtons.forEach((button, index) => {
        const buttonElement = button as HTMLButtonElement;
        
        // ボタンに対応する日付を取得
        let targetDate: Date | null = null;
        if (index < availableDates.length) {
            targetDate = availableDates[index];
        } else if (availableDates.length >= 4 && index === 2) {
            // 4種類以上の場合の3番目のボタンは特殊（日付選択ダイアログ）
            targetDate = availableDates[2];
        }
        
        if (!targetDate) return;
        
        // 選択状態をチェック
        const isSelected = isDateFullySelected(targetDate, tickets);
        
        // 選択状態に応じてCSSクラスを更新
        if (isSelected) {
            buttonElement.classList.add('date-selected');
        } else {
            buttonElement.classList.remove('date-selected');
        }
    });
}

// 利用可能な全ての日付を取得（重複除去・ソート済み）
function getAvailableDates(tickets: Element[]): Date[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 時間をリセット

    const dateMap = new Map<number, Date>();

    for (const ticket of tickets) {
        const ticketDate = getTicketDateOnly(ticket);
        if (!ticketDate) continue;

        const diff = ticketDate.getTime() - today.getTime();
        if (diff >= 0) { // 今日以降の日付のみ
            dateMap.set(ticketDate.getTime(), ticketDate);
        }
    }

    // 日付順にソート
    const dates = Array.from(dateMap.values());
    dates.sort((a, b) => a.getTime() - b.getTime());
    
    return dates;
}



// 日付をラベル用にフォーマット（強調表示用）
function formatDateForLabel(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}

// 日付選択ダイアログを表示
function showDateSelectionDialog(availableDates: Date[]): void {
    // 既存のダイアログがあれば削除
    const existingDialog = document.getElementById('ytomo-date-selection-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    // ダイアログオーバーレイ作成
    const overlay = document.createElement('div');
    overlay.id = 'ytomo-date-selection-dialog';
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background-color: rgba(0, 0, 0, 0.5) !important;
        z-index: 10000 !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
    `;

    // ダイアログコンテナ作成
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white !important;
        border-radius: 8px !important;
        padding: 20px !important;
        max-width: 400px !important;
        width: 90% !important;
        max-height: 70vh !important;
        overflow-y: auto !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    `;

    // タイトル
    const title = document.createElement('h3');
    title.textContent = '日付を選択してください';
    title.style.cssText = `
        margin: 0 0 16px 0 !important;
        color: #333 !important;
        font-size: 18px !important;
    `;

    // 日付リスト容器
    const dateList = document.createElement('div');
    dateList.style.cssText = `
        margin-bottom: 20px !important;
    `;

    // 選択された日付を保持
    let selectedDate: Date | null = null;

    // 各日付のラジオボタンを作成
    availableDates.forEach((date, index) => {
        const dateItem = document.createElement('div');
        dateItem.style.cssText = `
            margin-bottom: 8px !important;
            padding: 8px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: background-color 0.2s !important;
        `;

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'date-selection';
        radio.value = date.getTime().toString();
        radio.id = `date-${index}`;
        
        const label = document.createElement('label');
        label.htmlFor = `date-${index}`;
        label.style.cssText = `
            cursor: pointer !important;
            margin-left: 8px !important;
            color: #333 !important;
        `;

        // 日付表示フォーマット
        const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];
        label.textContent = `${dateStr}(${weekday})`;

        // ラジオボタン選択時の処理
        radio.addEventListener('change', () => {
            if (radio.checked) {
                selectedDate = date;
                // 他の選択を視覚的にクリア
                document.querySelectorAll('#ytomo-date-selection-dialog .date-item').forEach(item => {
                    (item as HTMLElement).style.backgroundColor = 'transparent';
                });
                // 選択された項目をハイライト
                dateItem.style.backgroundColor = '#e3f2fd !important';
            }
        });

        // 項目全体をクリック可能にする
        dateItem.addEventListener('click', () => {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        });

        dateItem.className = 'date-item';
        dateItem.appendChild(radio);
        dateItem.appendChild(label);
        dateList.appendChild(dateItem);
    });

    // ボタン容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex !important;
        justify-content: flex-end !important;
        gap: 10px !important;
    `;

    // キャンセルボタン
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'キャンセル';
    cancelButton.style.cssText = `
        padding: 8px 16px !important;
        border: 1px solid #ccc !important;
        background: white !important;
        border-radius: 4px !important;
        cursor: pointer !important;
    `;
    cancelButton.addEventListener('click', () => {
        overlay.remove();
    });

    // OKボタン
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.cssText = `
        padding: 8px 16px !important;
        border: none !important;
        background: #007bff !important;
        color: white !important;
        border-radius: 4px !important;
        cursor: pointer !important;
    `;
    okButton.addEventListener('click', () => {
        if (selectedDate) {
            toggleNearestDateSelection(selectedDate);
            overlay.remove();
        } else {
            alert('日付を選択してください');
        }
    });

    // ダイアログ組み立て
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(okButton);
    
    dialog.appendChild(title);
    dialog.appendChild(dateList);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    
    // オーバーレイクリックで閉じる
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    document.body.appendChild(overlay);
}

// 直近日付選択機能（findNearestDateと同じロジックを使用）
function toggleNearestDateSelection(targetDate: Date): void {
    console.log('🗓️ 直近日付選択機能を実行');
    console.log(`🎯 指定された日付: ${targetDate.toDateString()}`);
    
    const tickets = getTicketElements();
    if (tickets.length === 0) {
        console.warn('⚠️ チケット要素が見つかりません');
        showCustomAlert('チケットが見つかりません');
        return;
    }

    // 共通関数を使用して対象日付のチケットを取得
    const targetDateTickets = getTicketsByDate(tickets, targetDate);
    const checkboxes: HTMLInputElement[] = [];
    
    // 全チケットのチェックボックスを収集
    for (const ticket of tickets) {
        // .col3の親li要素内でチェックボックスを探す
        const parentLi = ticket.closest('li');
        const checkbox = parentLi?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        
        if (checkbox) {
            checkboxes.push(checkbox);
        }
    }

    console.log(`📊 対象日付チケット数: ${targetDateTickets.length}`);
    if (targetDateTickets.length === 0) {
        console.warn('⚠️ 対象日付のチケットが見つかりません');
        showCustomAlert('対象日付のチケットが見つかりません');
        return;
    }

    // 現在の選択状態をチェック（新しい関数を使用）
    const isCurrentlyFullySelected = isDateFullySelected(targetDate, tickets);

    if (isCurrentlyFullySelected) {
        // 対象日付がすべて選択済みの場合は全て解除
        checkboxes.forEach((cb, index) => {
            if (cb.checked) {
                try {
                    cb.click();
                } catch (error) {
                    console.warn(`⚠️ [${index}] 解除クリック時エラー:`, error);
                    // フォールバック: 手動でchecked状態を変更
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });
        console.log('✅ 直近日付選択を解除しました');
    } else {
        // 全て解除してから直近日付のみを選択
        checkboxes.forEach((cb, index) => {
            if (cb.checked) {
                try {
                    cb.click();
                } catch (error) {
                    console.warn(`⚠️ [${index}] 解除クリック時エラー:`, error);
                    // フォールバック: 手動でchecked状態を変更
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });

        targetDateTickets.forEach((ticket, index) => {
            // .col3の親li要素内でチェックボックスを探す
            const parentLi = ticket.closest('li');
            const checkbox = parentLi?.querySelector('input[type="checkbox"]') as HTMLInputElement;
            
            if (checkbox) {
                try {
                    checkbox.click();
                } catch (error) {
                    console.warn(`⚠️ [${index}] クリック時エラー:`, error);
                    // フォールバック: 手動でchecked状態を変更
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else {
                console.warn(`⚠️ [${index}] チェックボックスが見つかりません`);
            }
        });

        const dateStr = formatDateForLabel(targetDate);
        console.log(`✅ 対象日付(${dateStr})のチケット${targetDateTickets.length}件を選択しました`);
    }
    
    // 選択状態変更後、日付ボタンの視覚状態を更新
    setTimeout(() => updateDateButtonStates(), 100);
}

// チケット選択変更の監視を開始
function startTicketSelectionMonitoring(): void {
    console.log('👀 チケット選択監視を開始します');
    
    // MutationObserverでチェックボックスの変更を監視
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            // チェックボックスの変更を検知
            if (mutation.type === 'attributes' && mutation.attributeName === 'checked') {
                const target = mutation.target as HTMLInputElement;
                if (target.type === 'checkbox') {
                    shouldUpdate = true;
                }
            }
            
            // DOM構造の変更（チケット追加・削除）を検知
            if (mutation.type === 'childList') {
                const hasCheckboxes = Array.from(mutation.addedNodes).some(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        return element.querySelector('input[type="checkbox"]') !== null;
                    }
                    return false;
                });
                if (hasCheckboxes) {
                    shouldUpdate = true;
                }
            }
        });
        
        if (shouldUpdate) {
            // 短いdebounceで更新頻度を制御
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                updateDateButtonStates();
            }, 200);
        }
    });
    
    // チケットリスト全体を監視
    const ticketContainer = document.querySelector('ul.product-list, .ticket-list, main, body');
    if (ticketContainer) {
        observer.observe(ticketContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['checked']
        });
        console.log('✅ チケット選択監視設定完了');
    } else {
        console.warn('⚠️ チケットコンテナが見つからないため監視を開始できませんでした');
    }
    
    // DOM変更イベントリスナーも追加（フォールバック）
    document.addEventListener('change', (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                updateDateButtonStates();
            }, 200);
        }
    });
}

// デバウンス用のタイムアウト
let updateTimeout: NodeJS.Timeout | undefined;

// 同行者追加画面ではFABは不要なため削除済み

// 同行者チケット管理ダイアログ表示
function showCompanionTicketDialog(): void {
    // 既存ダイアログ削除
    const existingDialog = document.getElementById('ytomo-companion-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    // モーダルオーバーレイ作成
    const overlay = document.createElement('div');
    overlay.id = 'ytomo-companion-dialog';
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0,0,0,0.5) !important;
        z-index: 10001 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    `;

    // ダイアログコンテンツ
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white !important;
        border-radius: 12px !important;
        padding: 24px !important;
        max-width: 500px !important;
        width: 90% !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
    `;

    // ダイアログ内容作成
    dialog.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 12px 0; color: #333; font-size: 18px;">🎫 同行者チケット管理</h2>
            <p style="margin: 0; color: #666; font-size: 14px;">チケットIDを管理して一括で同行者追加処理を行います</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">新しいチケットID</label>
            <div style="display: flex; gap: 8px;">
                <input type="text" id="new-ticket-id" placeholder="チケットIDを入力" 
                    style="flex: 2; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="text" id="new-ticket-label" placeholder="ラベル（任意）"
                    style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <button id="add-ticket-btn"
                    style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    追加
                </button>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">保存済みチケットID</label>
            <div id="ticket-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 8px;"></div>
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="cancel-btn" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                キャンセル
            </button>
            <button id="delete-selected-btn" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                削除
            </button>
            <button id="execute-btn" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                同行者追加
            </button>
        </div>
    `;

    // ダイアログイベント設定
    setupDialogEvents(dialog);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // DOM追加後にチケットリスト更新
    updateTicketList();

    // オーバーレイクリックで閉じる
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // フォーカス設定
    const newTicketInput = dialog.querySelector('#new-ticket-id') as HTMLInputElement;
    if (newTicketInput) {
        newTicketInput.focus();
    }
}

// ダイアログイベント設定
function setupDialogEvents(dialog: HTMLElement): void {
    // 追加ボタン
    const addBtn = dialog.querySelector('#add-ticket-btn') as HTMLButtonElement;
    const newTicketInput = dialog.querySelector('#new-ticket-id') as HTMLInputElement;
    const newLabelInput = dialog.querySelector('#new-ticket-label') as HTMLInputElement;

    addBtn?.addEventListener('click', () => {
        const ticketId = newTicketInput.value.trim();
        const label = newLabelInput.value.trim();
        
        if (ticketId) {
            if (companionTicketManager.addTicketId(ticketId, label)) {
                newTicketInput.value = '';
                newLabelInput.value = '';
                updateTicketList();
            } else {
                showCustomAlert('チケットIDが無効または既に登録済みです');
            }
        }
    });

    // Enterキーで追加
    newTicketInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn?.click();
        }
    });

    // キャンセルボタン
    dialog.querySelector('#cancel-btn')?.addEventListener('click', () => {
        dialog.closest('#ytomo-companion-dialog')?.remove();
    });

    // 削除ボタン
    dialog.querySelector('#delete-selected-btn')?.addEventListener('click', () => {
        const selectedIds = getSelectedTicketIds();
        if (selectedIds.length > 0) {
            showCustomConfirm(`選択された${selectedIds.length}件のチケットIDを削除しますか？`, () => {
                selectedIds.forEach(id => companionTicketManager.removeTicketId(id));
                updateTicketList();
            });
        } else {
            showCustomAlert('削除するチケットIDを選択してください');
        }
    });

    // 実行ボタン
    dialog.querySelector('#execute-btn')?.addEventListener('click', () => {
        const selectedIds = getSelectedTicketIds();
        if (selectedIds.length > 0) {
            companionProcessManager.startProcess(selectedIds);
            dialog.closest('#ytomo-companion-dialog')?.remove();
        } else {
            showCustomAlert('チケットIDを選択してください');
        }
    });
}

// チケットリスト表示更新
function updateTicketList(): void {
    const listContainer = document.querySelector('#ticket-list');
    if (!listContainer) return;

    const tickets = companionTicketManager.getAllTicketIds();
    
    if (tickets.length === 0) {
        listContainer.innerHTML = '<div style="color: #999; text-align: center; padding: 20px;">保存済みチケットIDがありません</div>';
        return;
    }

    const listHTML = tickets.map(ticket => `
        <div class="ticket-row" data-ticket-id="${ticket.id}" style="display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #eee; last-child:border-bottom-none; transition: background-color 0.2s ease; cursor: pointer;">
            <input type="checkbox" value="${ticket.id}" style="margin-right: 8px;">
            <div style="flex: 1;">
                <div style="font-weight: bold; color: #333;">${ticket.label}</div>
                <div style="font-size: 12px; color: #999;">ID: ${ticket.id}</div>
                ${ticket.lastUsed ? `<div style="font-size: 11px; color: #999;">最終使用: ${new Date(ticket.lastUsed).toLocaleString()}</div>` : ''}
            </div>
        </div>
    `).join('');
    
    listContainer.innerHTML = listHTML;
    
    // イベントリスナーを設定
    setupTicketRowEvents(listContainer as HTMLElement);
}

// チケット行のイベントリスナーを設定
function setupTicketRowEvents(container: HTMLElement): void {
    const ticketRows = container.querySelectorAll('.ticket-row');
    
    ticketRows.forEach(row => {
        const rowElement = row as HTMLElement;
        const checkbox = rowElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (!checkbox) return;
        
        // チェックボックスの変更イベント
        checkbox.addEventListener('change', () => {
            updateTicketRowSelection(checkbox);
        });
        
        // 行全体のクリックでチェックボックス切り替え
        rowElement.addEventListener('click', (e) => {
            // チェックボックス自体をクリックした場合は重複処理を避ける
            if (e.target === checkbox) return;
            
            checkbox.checked = !checkbox.checked;
            updateTicketRowSelection(checkbox);
        });
    });
}

// チケット行の選択状態を更新
function updateTicketRowSelection(checkbox: HTMLInputElement): void {
    const ticketRow = checkbox.closest('.ticket-row') as HTMLElement;
    if (!ticketRow) return;
    
    if (checkbox.checked) {
        ticketRow.style.backgroundColor = '#e3f2fd';
        ticketRow.style.borderColor = '#2196f3';
    } else {
        ticketRow.style.backgroundColor = '';
        ticketRow.style.borderColor = '#eee';
    }
}

// グローバルスコープでアクセス可能にする
(window as any).updateTicketRowSelection = updateTicketRowSelection;

// 選択されたチケットID取得
function getSelectedTicketIds(): string[] {
    const checkboxes = document.querySelectorAll('#ticket-list input[type="checkbox"]:checked') as NodeListOf<HTMLInputElement>;
    return Array.from(checkboxes).map(cb => cb.value);
}

// カスタムアラート・確認ダイアログ
function showCustomAlert(message: string): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0,0,0,0.5) !important;
        z-index: 10002 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white !important;
        border-radius: 8px !important;
        padding: 24px !important;
        max-width: 400px !important;
        width: 90% !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
        text-align: center !important;
    `;

    dialog.innerHTML = `
        <div style="margin-bottom: 16px; color: #333; font-size: 16px;">${message}</div>
        <button id="alert-ok-btn" style="padding: 8px 24px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            OK
        </button>
    `;

    dialog.querySelector('#alert-ok-btn')?.addEventListener('click', () => {
        overlay.remove();
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

function showCustomConfirm(message: string, onConfirm: () => void): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0,0,0,0.5) !important;
        z-index: 10002 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white !important;
        border-radius: 8px !important;
        padding: 24px !important;
        max-width: 400px !important;
        width: 90% !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
        text-align: center !important;
    `;

    dialog.innerHTML = `
        <div style="margin-bottom: 16px; color: #333; font-size: 16px;">${message}</div>
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="confirm-cancel-btn" style="padding: 8px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                キャンセル
            </button>
            <button id="confirm-ok-btn" style="padding: 8px 24px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                OK
            </button>
        </div>
    `;

    dialog.querySelector('#confirm-cancel-btn')?.addEventListener('click', () => {
        overlay.remove();
    });

    dialog.querySelector('#confirm-ok-btn')?.addEventListener('click', () => {
        overlay.remove();
        onConfirm();
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

// 初期化関数
export function initCompanionTicketFeature(): void {
    console.log('🎫 同行者追加機能を初期化中...');
    console.log(`📍 現在のURL: ${window.location.href}`);
    console.log(`📍 document.readyState: ${document.readyState}`);
    console.log(`📍 document.body: ${document.body ? 'available' : 'null'}`);
    
    if (isTicketSelectionPage()) {
        console.log('📋 チケット選択画面を検出しました');
        createCompanionTicketFAB();
    } else if (isAgentTicketPage()) {
        console.log('🤝 同行者追加画面を検出しました');
        createCompanionTicketFAB(); // 進行状況FAB作成
    } else {
        console.log('❌ 対象外の画面です');
    }
    
    console.log('🎫 同行者追加機能初期化完了');
}