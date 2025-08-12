/**
 * 自動処理中の誤動作防止オーバーレイシステム
 * 
 * 予約実行中・監視中に画面全体を薄いオーバーレイで覆い、
 * 中断ボタン以外の操作を防ぐことで誤動作を防止
 */

export class ProcessingOverlay {
    private overlayElement: HTMLElement | null = null;
    private isActive: boolean = false;
    
    constructor() {
        this.initializeOverlay();
    }
    
    /**
     * オーバーレイ要素を初期化
     */
    private initializeOverlay(): void {
        // 既存のオーバーレイがある場合は削除
        const existingOverlay = document.getElementById('ytomo-processing-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // オーバーレイ要素を作成
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'ytomo-processing-overlay';
        this.overlayElement.className = 'ytomo-processing-overlay hidden';
        
        // メッセージエリア
        const messageArea = document.createElement('div');
        messageArea.className = 'processing-message-area';
        
        const messageText = document.createElement('div');
        messageText.className = 'processing-message-text';
        messageText.textContent = '自動処理実行中...';
        
        const warningText = document.createElement('div');
        warningText.className = 'processing-warning-text';
        warningText.textContent = '誤動作防止のため他の操作を制限しています';
        
        const cancelArea = document.createElement('div');
        cancelArea.className = 'processing-cancel-area';
        cancelArea.innerHTML = '中断は右下のFABボタンから可能です';
        
        messageArea.appendChild(messageText);
        messageArea.appendChild(warningText);
        messageArea.appendChild(cancelArea);
        
        this.overlayElement.appendChild(messageArea);
        
        // クリックイベントを処理（オーバーレイクリックをブロック）
        this.overlayElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // クリック音的フィードバック
            this.showClickWarning();
        });
        
        // 右クリック、中クリックもブロック
        this.overlayElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        this.overlayElement.addEventListener('auxclick', (e) => {
            e.preventDefault();
        });
        
        // キーボードイベントもブロック（ESCキー以外）
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // bodyに追加
        document.body.appendChild(this.overlayElement);
        
        console.log('🛡️ 自動処理誤動作防止オーバーレイを初期化');
    }
    
    /**
     * キーボードイベントハンドラー
     */
    private handleKeyDown(e: KeyboardEvent): void {
        if (!this.isActive) return;
        
        // ESCキーは許可（中断操作として機能させる）
        if (e.key === 'Escape') {
            // FABボタンのクリックをシミュレート
            const fabButton = document.getElementById('ytomo-main-fab');
            if (fabButton) {
                fabButton.click();
                e.preventDefault();
            }
            return;
        }
        
        // 他のキー操作をブロック（F5更新なども含む）
        if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
            e.preventDefault();
            this.showRefreshWarning();
            return;
        }
        
        // その他のキー操作もブロック
        e.preventDefault();
        this.showClickWarning();
    }
    
    /**
     * オーバーレイを表示（自動処理開始時）
     */
    public show(processType: 'reservation' | 'monitoring' = 'reservation'): void {
        if (!this.overlayElement || this.isActive) return;
        
        console.log(`🛡️ 誤動作防止オーバーレイ表示: ${processType}`);
        
        // メッセージをプロセスタイプに応じて更新
        const messageText = this.overlayElement.querySelector('.processing-message-text');
        
        if (processType === 'monitoring') {
            if (messageText) messageText.textContent = '監視実行中...';
        } else {
            if (messageText) messageText.textContent = '予約実行中...';
        }
        
        // 表示アニメーション
        this.overlayElement.classList.remove('hidden');
        this.overlayElement.classList.add('visible');
        
        // FABボタンのz-indexを調整（オーバーレイより前面に）
        const fabContainer = document.getElementById('ytomo-fab-container');
        if (fabContainer) {
            fabContainer.style.zIndex = '100001';
        }
        
        this.isActive = true;
    }
    
    /**
     * オーバーレイを非表示（自動処理終了時）
     */
    public hide(): void {
        if (!this.overlayElement || !this.isActive) return;
        
        console.log('🛡️ 誤動作防止オーバーレイ非表示');
        
        // 非表示アニメーション
        this.overlayElement.classList.remove('visible');
        this.overlayElement.classList.add('hidden');
        
        // FABボタンのz-indexを元に戻す
        const fabContainer = document.getElementById('ytomo-fab-container');
        if (fabContainer) {
            fabContainer.style.zIndex = '9999';
        }
        
        this.isActive = false;
    }
    
    /**
     * オーバーレイクリック時の警告表示
     */
    private showClickWarning(): void {
        const warningText = this.overlayElement?.querySelector('.processing-warning-text');
        if (!warningText) return;
        
        // 一時的に警告を強調
        warningText.classList.add('warning-flash');
        setTimeout(() => {
            warningText.classList.remove('warning-flash');
        }, 1000);
    }
    
    /**
     * ページ更新試行時の警告表示
     */
    private showRefreshWarning(): void {
        const warningText = this.overlayElement?.querySelector('.processing-warning-text');
        if (!warningText) return;
        
        const originalText = warningText.textContent;
        warningText.textContent = '⚠️ 処理中のページ更新は危険です！中断してから更新してください';
        warningText.classList.add('warning-flash');
        
        setTimeout(() => {
            warningText.textContent = originalText;
            warningText.classList.remove('warning-flash');
        }, 3000);
    }
    
    /**
     * オーバーレイが表示中かどうか
     */
    public isVisible(): boolean {
        return this.isActive;
    }
    
    /**
     * オーバーレイを破棄
     */
    public destroy(): void {
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
        
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        this.isActive = false;
        
        console.log('🛡️ 誤動作防止オーバーレイを破棄');
    }
}

// グローバルインスタンス
export const processingOverlay = new ProcessingOverlay();