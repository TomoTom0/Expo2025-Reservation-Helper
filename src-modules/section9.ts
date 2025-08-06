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

        const newTicket: SavedTicketId = {
            id: id.trim(),
            label: label?.trim() || id.trim(),
            addedAt: Date.now()
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
        // TODO: 実際の同行者追加処理を実装
        // 1. 同行者追加ボタンクリック
        // 2. 画面遷移待機
        // 3. チケットID入力
        // 4. 追加ボタンクリック
        // 5. 結果判定
        console.log(`⏳ チケットID ${ticketId} の処理を実装中...`);
        return false;
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

// チケット選択画面のFABダイアログ作成
export function createCompanionTicketFAB(): void {
    // チケット選択画面でない場合は何もしない
    if (!isTicketSelectionPage()) return;

    // 既存FAB削除
    const existingFab = document.getElementById('ytomo-companion-fab-container');
    if (existingFab) {
        existingFab.remove();
    }

    // FABコンテナ作成（既存FABスタイルを参考）
    const fabContainer = document.createElement('div');
    fabContainer.id = 'ytomo-companion-fab-container';
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

    // メインFABボタン作成
    const fabButton = document.createElement('button');
    fabButton.id = 'ytomo-companion-fab-button';
    fabButton.style.cssText = `
        width: 64px !important;
        height: 64px !important;
        border-radius: 50% !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border: none !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 24px !important;
        color: white !important;
        transition: all 0.3s ease !important;
    `;

    // FABボタンアイコン・テキスト
    fabButton.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; font-size: 10px; line-height: 1;">
            <div style="font-size: 18px; margin-bottom: 2px;">🎫</div>
            <div>同行者</div>
        </div>
    `;

    // ホバー効果
    fabButton.addEventListener('mouseenter', () => {
        fabButton.style.transform = 'scale(1.1)';
        fabButton.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)';
    });

    fabButton.addEventListener('mouseleave', () => {
        fabButton.style.transform = 'scale(1)';
        fabButton.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    });

    // クリックイベント（ダイアログ表示）
    fabButton.addEventListener('click', () => {
        showCompanionTicketDialog();
    });

    // DOM追加
    fabContainer.appendChild(fabButton);
    document.body.appendChild(fabContainer);

    console.log('✅ 同行者追加FABボタンを作成しました');
}

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
                    style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
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
            <button id="clear-all-btn" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                全削除
            </button>
            <button id="execute-btn" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                同行者追加実行
            </button>
        </div>
    `;

    // ダイアログイベント設定
    setupDialogEvents(dialog);

    // チケットリスト更新
    updateTicketList();

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

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
                alert('チケットIDが無効または既に登録済みです');
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

    // 全削除ボタン
    dialog.querySelector('#clear-all-btn')?.addEventListener('click', () => {
        if (confirm('全てのチケットIDを削除しますか？')) {
            companionTicketManager.clearAll();
            updateTicketList();
        }
    });

    // 実行ボタン
    dialog.querySelector('#execute-btn')?.addEventListener('click', () => {
        const selectedIds = getSelectedTicketIds();
        if (selectedIds.length > 0) {
            if (confirm(`${selectedIds.length}件のチケットで同行者追加処理を実行しますか？`)) {
                companionProcessManager.startProcess(selectedIds);
                dialog.closest('#ytomo-companion-dialog')?.remove();
            }
        } else {
            alert('チケットIDを選択してください');
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
        <div style="display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #eee; last-child:border-bottom-none;">
            <input type="checkbox" value="${ticket.id}" style="margin-right: 8px;">
            <div style="flex: 1;">
                <div style="font-weight: bold; color: #333;">${ticket.label}</div>
                <div style="font-size: 12px; color: #999;">ID: ${ticket.id}</div>
                ${ticket.lastUsed ? `<div style="font-size: 11px; color: #999;">最終使用: ${new Date(ticket.lastUsed).toLocaleString()}</div>` : ''}
            </div>
            <button data-ticket-id="${ticket.id}" class="delete-ticket-btn" 
                style="padding: 4px 8px; background: #f44336; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 12px;">
                削除
            </button>
        </div>
    `).join('');

    listContainer.innerHTML = listHTML;

    // 削除ボタンイベント
    listContainer.querySelectorAll('.delete-ticket-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ticketId = (e.target as HTMLElement).dataset['ticketId'];
            if (ticketId && confirm(`チケットID "${ticketId}" を削除しますか？`)) {
                companionTicketManager.removeTicketId(ticketId);
                updateTicketList();
            }
        });
    });
}

// 選択されたチケットID取得
function getSelectedTicketIds(): string[] {
    const checkboxes = document.querySelectorAll('#ticket-list input[type="checkbox"]:checked') as NodeListOf<HTMLInputElement>;
    return Array.from(checkboxes).map(cb => cb.value);
}

// 初期化関数
export function initCompanionTicketFeature(): void {
    console.log('🎫 同行者追加機能を初期化中...');
    
    if (isTicketSelectionPage()) {
        console.log('📋 チケット選択画面を検出しました');
        createCompanionTicketFAB();
    } else if (isAgentTicketPage()) {
        console.log('🤝 同行者追加画面を検出しました');
        // TODO: 同行者追加画面での自動処理実装
    }
}