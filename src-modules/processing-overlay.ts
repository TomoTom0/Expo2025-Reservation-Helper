/**
 * 自動処理中の誤動作防止オーバーレイシステム
 * 
 * 予約実行中に画面全体を薄いオーバーレイで覆い、
 * 中断ボタン以外の操作を防ぐことで誤動作を防止
 */

import { entranceReservationStateManager, ExecutionState } from './entrance-reservation-state-manager';

export class ProcessingOverlay {
    private overlayElement: HTMLElement | null = null;
    private isActive: boolean = false;
    private countdownTimer: number | null = null;
    
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
        this.overlayElement.className = 'ytomo-processing-overlay hidden z-normal';
        
        // メッセージエリア
        const messageArea = document.createElement('div');
        messageArea.className = 'processing-message-area';
        
        const messageText = document.createElement('div');
        messageText.className = 'processing-message-text';
        messageText.textContent = '自動処理実行中...';
        
        // 対象情報表示用の要素を追加
        const targetText = document.createElement('div');
        targetText.className = 'processing-target-text';
        targetText.textContent = '';
        
        // カウントダウン表示要素を追加
        const countdownText = document.createElement('div');
        countdownText.className = 'processing-countdown-text';
        countdownText.textContent = '';
        
        const warningText = document.createElement('div');
        warningText.className = 'processing-warning-text';
        warningText.textContent = '誤動作防止';
        
        const cancelArea = document.createElement('div');
        cancelArea.className = 'processing-cancel-area';
        cancelArea.innerHTML = '右下のボタンで中断';
        
        messageArea.appendChild(messageText);
        messageArea.appendChild(targetText);
        messageArea.appendChild(countdownText);
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
    public show(processType: 'reservation' = 'reservation'): void {
        if (!this.overlayElement || this.isActive) return;
        
        console.log(`🛡️ 誤動作防止オーバーレイ表示: ${processType}`);
        
        // メッセージをプロセスタイプに応じて更新
        const messageText = this.overlayElement.querySelector('.processing-message-text');
        const targetText = this.overlayElement.querySelector('.processing-target-text');
        
        {
            // 予約対象の情報を取得
            let targetInfo = '対象なし';
            
            if (entranceReservationStateManager && entranceReservationStateManager.getFabTargetDisplayInfo) {
                const displayInfo = entranceReservationStateManager.getFabTargetDisplayInfo();
                if (displayInfo && displayInfo.hasTarget && displayInfo.targetType === 'reservation') {
                    targetInfo = displayInfo.displayText;
                }
            }
            
            if (messageText) messageText.textContent = '予約実行中...';
            if (targetText) targetText.textContent = targetInfo;
        }
        
        // 表示アニメーション
        this.overlayElement.classList.remove('hidden');
        this.overlayElement.classList.add('visible');
        
        // FABボタンのz-indexを調整（オーバーレイより前面に）
        const fabContainer = document.getElementById('ytomo-fab-container');
        if (fabContainer) {
            fabContainer.className = fabContainer.className.replace(/z-\w+/g, '').trim() + ' z-above-overlay';
        }
        
        // 【システム連動】オーバーレイ表示中は必ずFABボタンを有効化（中断可能にする）
        const mainFabButton = document.getElementById('ytomo-main-fab') as HTMLButtonElement;
        if (mainFabButton) {
            mainFabButton.disabled = false;
            console.log('🛡️ [システム連動] オーバーレイ表示につき中断ボタンを強制有効化');
        }
        
        this.isActive = true;
        
        // カウントダウン監視開始
        this.startCountdownMonitoring();
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
            fabContainer.className = fabContainer.className.replace(/z-\w+/g, '').trim() + ' z-normal';
        }
        
        this.isActive = false;
        
        // カウントダウン監視停止
        this.stopCountdownMonitoring();
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
     * カウントダウン表示を更新
     * @param countdownText カウントダウン文字列
     * @param isWarning 警告状態かどうか
     */
    public updateCountdown(countdownText: string, isWarning: boolean = false): void {
        if (!this.overlayElement || !this.isActive) return;
        
        const countdownElement = this.overlayElement.querySelector('.processing-countdown-text');
        if (countdownElement) {
            countdownElement.textContent = countdownText;
            
            // 警告スタイルの切り替え
            if (isWarning) {
                countdownElement.classList.add('countdown-warning');
            } else {
                countdownElement.classList.remove('countdown-warning');
            }
        }
    }
    
    /**
     * カウントダウン表示をクリア
     */
    public clearCountdown(): void {
        if (!this.overlayElement) return;
        
        const countdownElement = this.overlayElement.querySelector('.processing-countdown-text');
        if (countdownElement) {
            countdownElement.textContent = '';
            countdownElement.classList.remove('countdown-warning');
        }
    }

    /**
     * カウントダウン監視開始
     */
    private startCountdownMonitoring(): void {
        if (this.countdownTimer) return; // 既に監視中
        
        this.countdownTimer = window.setInterval(() => {
            this.updateCountdownFromState();
        }, 1000); // 1秒ごとに更新
    }

    /**
     * カウントダウン監視停止
     */
    private stopCountdownMonitoring(): void {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }

    /**
     * 状態管理からカウントダウン情報を取得して更新
     */
    private updateCountdownFromState(): void {
        if (!this.isActive || !this.overlayElement) return;

        try {
            // 予約実行中の効率モードカウントダウン
            if (entranceReservationStateManager.getExecutionState() === ExecutionState.RESERVATION_RUNNING) {
                const nextTarget = entranceReservationStateManager.getNextSubmitTarget();
                if (nextTarget) {
                    const now = new Date();
                    const remainingMs = nextTarget.getTime() - now.getTime();
                    if (remainingMs > 0) {
                        const remainingSec = Math.floor(remainingMs / 1000);
                        const countdownText = `次回: ${remainingSec}秒後`;
                        const isWarning = remainingSec <= 5;
                        this.updateCountdown(countdownText, isWarning);
                        return;
                    }
                }
            }


            // カウントダウン対象がない場合はクリア
            this.clearCountdown();
        } catch (error) {
            console.warn('カウントダウン更新エラー:', error);
        }
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
        this.stopCountdownMonitoring();
        this.isActive = false;
        
        console.log('🛡️ 誤動作防止オーバーレイを破棄');
    }
}


// グローバルインスタンス
export const processingOverlay = new ProcessingOverlay();