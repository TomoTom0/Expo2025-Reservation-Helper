/**
 * 自動操作オーバーレイUI
 * 自動操作中のユーザーフィードバックとコントロール
 */

import { AutomationStatus, AutomationResult } from './automation-engine';

// オーバーレイの状態
export interface OverlayState {
    visible: boolean;
    status: AutomationStatus;
    message: string;
    progress: number;
    canCancel: boolean;
    details: string[];
}

// オーバーレイイベント
export type OverlayEventType = 'cancel' | 'retry' | 'close';
export type OverlayEventHandler = (type: OverlayEventType) => void;

export class AutomationOverlay {
    private overlay: HTMLElement | null = null;
    private state: OverlayState;
    private eventHandler: OverlayEventHandler | null = null;
    private animationId: number | null = null;

    constructor() {
        this.state = {
            visible: false,
            status: 'idle',
            message: '',
            progress: 0,
            canCancel: true,
            details: []
        };
    }

    /**
     * オーバーレイを表示
     */
    show(initialMessage: string = '自動操作を開始しています...'): void {
        if (this.overlay) {
            this.hide();
        }

        this.createOverlay();
        this.updateState({
            visible: true,
            status: 'running',
            message: initialMessage,
            progress: 0,
            canCancel: true,
            details: []
        });

        // フェードインアニメーション
        this.overlay!.style.opacity = '0';
        document.body.appendChild(this.overlay!);
        
        requestAnimationFrame(() => {
            this.overlay!.style.opacity = '1';
        });

        // 誤操作防止
        this.preventPageInteraction();
    }

    /**
     * オーバーレイを非表示
     */
    hide(): void {
        if (!this.overlay) return;

        // フェードアウトアニメーション
        this.overlay.style.opacity = '0';
        
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.overlay = null;
            this.state.visible = false;
            this.restorePageInteraction();
        }, 300);
    }

    /**
     * 状態を更新
     */
    updateState(newState: Partial<OverlayState>): void {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    /**
     * メッセージを更新
     */
    updateMessage(message: string, addToDetails: boolean = true): void {
        if (addToDetails) {
            const timestamp = new Date().toLocaleTimeString();
            this.state.details.push(`[${timestamp}] ${message}`);
            
            // 詳細ログは最新10件まで保持
            if (this.state.details.length > 10) {
                this.state.details = this.state.details.slice(-10);
            }
        }

        this.updateState({ message });
    }

    /**
     * 進行状況を更新
     */
    updateProgress(progress: number): void {
        this.updateState({ progress: Math.max(0, Math.min(100, progress)) });
    }

    /**
     * 実行結果を表示
     */
    showResult(result: AutomationResult): void {
        const isSuccess = result.status === 'completed';
        const message = isSuccess 
            ? `✅ 自動操作完了 (${result.successCount}件成功)`
            : `❌ 自動操作失敗 (${result.failedCount}件失敗)`;

        this.updateState({
            status: result.status,
            message,
            progress: 100,
            canCancel: false
        });

        // 結果詳細を追加
        if (result.errors.length > 0) {
            result.errors.forEach(error => {
                this.updateMessage(`エラー: ${error}`, true);
            });
        }

        // 成功時は3秒後に自動で閉じる
        if (isSuccess) {
            setTimeout(() => this.hide(), 3000);
        }
    }

    /**
     * エラーを表示
     */
    showError(error: string, canRetry: boolean = true): void {
        this.updateState({
            status: 'failed',
            message: `❌ エラー: ${error}`,
            progress: 0,
            canCancel: !canRetry
        });

        this.updateMessage(error, true);
    }

    /**
     * イベントハンドラーを設定
     */
    setEventHandler(handler: OverlayEventHandler): void {
        this.eventHandler = handler;
    }

    /**
     * オーバーレイDOMを作成
     */
    private createOverlay(): void {
        this.overlay = document.createElement('div');
        this.overlay.className = 'automation-overlay';
        this.overlay.innerHTML = this.getOverlayHTML();
        
        // スタイルを適用
        this.applyStyles();
        
        // イベントリスナーを設定
        this.setupEventListeners();
    }

    /**
     * オーバーレイHTMLを取得
     */
    private getOverlayHTML(): string {
        return `
            <div class="automation-overlay-backdrop">
                <div class="automation-overlay-content">
                    <div class="automation-overlay-header">
                        <h3 class="automation-overlay-title">
                            <span class="automation-icon">🤖</span>
                            パビリオン予約自動操作
                        </h3>
                        <button class="automation-overlay-close" data-action="close">×</button>
                    </div>
                    
                    <div class="automation-overlay-body">
                        <div class="automation-status">
                            <div class="automation-status-icon"></div>
                            <div class="automation-status-message"></div>
                        </div>
                        
                        <div class="automation-progress">
                            <div class="automation-progress-bar">
                                <div class="automation-progress-fill"></div>
                            </div>
                            <div class="automation-progress-text">0%</div>
                        </div>
                        
                        <div class="automation-details">
                            <div class="automation-details-title">処理詳細:</div>
                            <div class="automation-details-content"></div>
                        </div>
                    </div>
                    
                    <div class="automation-overlay-footer">
                        <button class="automation-btn automation-btn-cancel" data-action="cancel">
                            キャンセル
                        </button>
                        <button class="automation-btn automation-btn-retry" data-action="retry" style="display: none;">
                            再試行
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * スタイルを適用
     */
    private applyStyles(): void {
        if (!this.overlay) return;

        const styles = `
            .automation-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                transition: opacity 0.3s ease;
            }
            
            .automation-overlay-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .automation-overlay-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 100%;
                max-height: 80vh;
                overflow: hidden;
                animation: automation-scale-in 0.3s ease;
            }
            
            @keyframes automation-scale-in {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            .automation-overlay-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px 16px;
                border-bottom: 1px solid #eee;
            }
            
            .automation-overlay-title {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #333;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .automation-icon {
                font-size: 20px;
            }
            
            .automation-overlay-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .automation-overlay-close:hover {
                background: #f5f5f5;
            }
            
            .automation-overlay-body {
                padding: 20px 24px;
            }
            
            .automation-status {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
            }
            
            .automation-status-icon {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                position: relative;
            }
            
            .automation-status-icon.running {
                background: #2196F3;
                animation: automation-pulse 2s infinite;
            }
            
            .automation-status-icon.completed {
                background: #4CAF50;
            }
            
            .automation-status-icon.failed {
                background: #F44336;
            }
            
            @keyframes automation-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .automation-status-message {
                font-size: 16px;
                color: #333;
                flex: 1;
            }
            
            .automation-progress {
                margin-bottom: 20px;
            }
            
            .automation-progress-bar {
                height: 8px;
                background: #eee;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 8px;
            }
            
            .automation-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #2196F3, #21CBF3);
                border-radius: 4px;
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .automation-progress-text {
                text-align: right;
                font-size: 12px;
                color: #666;
            }
            
            .automation-details {
                background: #f8f9fa;
                border-radius: 6px;
                padding: 12px;
                max-height: 150px;
                overflow-y: auto;
            }
            
            .automation-details-title {
                font-size: 12px;
                font-weight: 600;
                color: #666;
                margin-bottom: 8px;
            }
            
            .automation-details-content {
                font-size: 12px;
                color: #333;
                line-height: 1.4;
            }
            
            .automation-details-content div {
                margin-bottom: 2px;
            }
            
            .automation-overlay-footer {
                padding: 16px 24px 20px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            .automation-btn {
                padding: 8px 16px;
                border-radius: 6px;
                border: 1px solid #ddd;
                background: white;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .automation-btn:hover {
                background: #f5f5f5;
            }
            
            .automation-btn-cancel {
                color: #666;
            }
            
            .automation-btn-retry {
                background: #2196F3;
                color: white;
                border-color: #2196F3;
            }
            
            .automation-btn-retry:hover {
                background: #1976D2;
            }
        `;

        // スタイルシートを追加
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * イベントリスナーを設定
     */
    private setupEventListeners(): void {
        if (!this.overlay) return;

        this.overlay.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const action = target.dataset['action'] as OverlayEventType;
            
            if (action && this.eventHandler) {
                this.eventHandler(action);
            }
        });

        // ESCキーでキャンセル
        document.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * キーボードイベント処理
     */
    private handleKeyDown = (e: KeyboardEvent): void => {
        if (e.key === 'Escape' && this.state.visible && this.state.canCancel) {
            if (this.eventHandler) {
                this.eventHandler('cancel');
            }
        }
    };

    /**
     * レンダリング
     */
    private render(): void {
        if (!this.overlay) return;

        // ステータスアイコン
        const statusIcon = this.overlay.querySelector('.automation-status-icon') as HTMLElement;
        if (statusIcon) {
            statusIcon.className = `automation-status-icon ${this.state.status}`;
        }

        // ステータスメッセージ
        const statusMessage = this.overlay.querySelector('.automation-status-message') as HTMLElement;
        if (statusMessage) {
            statusMessage.textContent = this.state.message;
        }

        // 進行状況
        const progressFill = this.overlay.querySelector('.automation-progress-fill') as HTMLElement;
        const progressText = this.overlay.querySelector('.automation-progress-text') as HTMLElement;
        if (progressFill && progressText) {
            progressFill.style.width = `${this.state.progress}%`;
            progressText.textContent = `${Math.round(this.state.progress)}%`;
        }

        // 詳細ログ
        const detailsContent = this.overlay.querySelector('.automation-details-content') as HTMLElement;
        if (detailsContent) {
            detailsContent.innerHTML = this.state.details
                .map(detail => `<div>${this.escapeHtml(detail)}</div>`)
                .join('');
            
            // 自動スクロール
            detailsContent.scrollTop = detailsContent.scrollHeight;
        }

        // ボタン状態
        const cancelBtn = this.overlay.querySelector('.automation-btn-cancel') as HTMLButtonElement;
        const retryBtn = this.overlay.querySelector('.automation-btn-retry') as HTMLButtonElement;
        
        if (cancelBtn) {
            cancelBtn.style.display = this.state.canCancel ? 'inline-block' : 'none';
        }
        
        if (retryBtn) {
            retryBtn.style.display = this.state.status === 'failed' ? 'inline-block' : 'none';
        }
    }

    /**
     * HTMLエスケープ
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * ページとの相互作用を防ぐ
     */
    private preventPageInteraction(): void {
        document.body.style.overflow = 'hidden';
        document.body.style.pointerEvents = 'none';
        
        if (this.overlay) {
            this.overlay.style.pointerEvents = 'auto';
        }
    }

    /**
     * ページとの相互作用を復元
     */
    private restorePageInteraction(): void {
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        
        // ESCキーリスナーを削除
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    /**
     * デストラクタ
     */
    destroy(): void {
        this.hide();
        this.eventHandler = null;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// シングルトンインスタンス
let overlayInstance: AutomationOverlay | null = null;

/**
 * オーバーレイのシングルトンインスタンスを取得
 */
export function getAutomationOverlay(): AutomationOverlay {
    if (!overlayInstance) {
        overlayInstance = new AutomationOverlay();
    }
    return overlayInstance;
}

/**
 * オーバーレイインスタンスを破棄
 */
export function destroyAutomationOverlay(): void {
    if (overlayInstance) {
        overlayInstance.destroy();
        overlayInstance = null;
    }
}