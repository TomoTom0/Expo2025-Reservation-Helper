/**
 * 自動処理中の誤動作防止オーバーレイシステム
 * 
 * 予約実行中に画面全体を薄いオーバーレイで覆い、
 * 中断ボタン以外の操作を防ぐことで誤動作を防止
 */

import { entranceReservationStateManager, ExecutionState } from './entrance-reservation-state-manager';
import { identify_page_type } from './page-utils';
import { loggers } from '../utils/logger';

const logger = loggers.ui;

export class ProcessingOverlay {
    private overlayElement: HTMLElement | null = null;
    private isActive: boolean = false;
    private countdownTimer: number | null = null;
    private currentProcessType: 'reservation' | 'companion' | null = null;
    private urlObserver: MutationObserver | null = null;
    
    constructor() {
        this.initializeOverlay();
        this.setupUrlWatcher();
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
        
        logger.info('自動処理誤動作防止オーバーレイを初期化');
    }
    
    /**
     * URL変化監視の設定（SPA対応）
     */
    private setupUrlWatcher(): void {
        let currentUrl = window.location.href;
        
        // MutationObserverでDOM変化を監視（SPA遷移検出）
        this.urlObserver = new MutationObserver(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                this.onUrlChanged();
            }
        });
        
        // body全体の変更を監視
        this.urlObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // popstateイベントでも監視（戻る・進むボタン対応）
        window.addEventListener('popstate', () => {
            this.onUrlChanged();
        });
        
        logger.debug('URL変化監視を設定');
    }
    
    /**
     * URL変化時の処理
     */
    private onUrlChanged(): void {
        if (this.isActive && this.currentProcessType) {
            logger.debug('URL変化検出 - オーバーレイ状態確認中');
            
            // より長い遅延を設けて、意図的な画面遷移と区別
            setTimeout(() => {
                // 依然としてアクティブな場合のみ再初期化
                if (this.isActive && this.currentProcessType) {
                    logger.debug('オーバーレイを迅速再設定');
                    this.reinitializeOverlay();
                } else {
                    logger.debug('処理完了により再初期化をスキップ');
                }
            }, 500);
        }
    }
    
    /**
     * オーバーレイの迅速再初期化
     */
    private reinitializeOverlay(): void {
        if (!this.isActive || !this.currentProcessType) return;
        
        logger.debug('オーバーレイ迅速再初期化中');
        
        // 既存のオーバーレイを削除
        if (this.overlayElement) {
            this.overlayElement.remove();
        }
        
        // 新しいオーバーレイを初期化
        this.initializeOverlay();
        
        // 現在のプロセスタイプで再表示
        const processType = this.currentProcessType;
        this.isActive = false; // showメソッドが実行されるようにリセット
        this.show(processType);
        
        logger.debug('オーバーレイ迅速再初期化完了');
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
    public show(processType: 'reservation' | 'companion' = 'reservation'): void {
        if (!this.overlayElement || this.isActive) return;
        
        logger.info('誤動作防止オーバーレイ表示', { processType });
        
        // メッセージをプロセスタイプに応じて更新
        const messageText = this.overlayElement.querySelector('.processing-message-text');
        const targetText = this.overlayElement.querySelector('.processing-target-text');
        
        if (processType === 'companion') {
            // 同行者追加処理用のメッセージ
            if (messageText) messageText.textContent = '同行者追加処理実行中...';
            if (targetText) targetText.textContent = '自動処理を中断する場合は中断ボタンをクリック';
        } else {
            // 予約処理用のメッセージ（既存）
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
        
        // 通知音トグルボタンが存在しない場合は追加（入場予約画面でのみ）
        const currentPageType = identify_page_type(window.location.href);
        if (processType === 'reservation' && currentPageType === 'entrance_reservation') {
            const existingNotificationToggle = this.overlayElement.querySelector('#ytomo-notification-toggle');
            if (!existingNotificationToggle) {
                console.log('🔊 show()で通知音トグルボタンを追加中...');
                this.addNotificationToggleButton();
            }
        }
        
        // 表示アニメーション
        this.overlayElement.classList.remove('hidden');
        this.overlayElement.classList.add('visible');
        
        // FABボタンのz-indexを調整（オーバーレイより前面に）
        this.adjustFabButtonsForOverlay();
        
        if (processType === 'companion') {
            // 同行者処理の場合は専用中断ボタンを作成
            this.createAbortButton();
        } else {
            // 予約処理の場合は既存FABボタンを有効化
            this.ensureFabButtonsVisible();
        }
        
        this.isActive = true;
        this.currentProcessType = processType; // プロセスタイプを保存
        
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
        this.restoreFabButtonsFromOverlay();
        
        // 中断ボタンを削除
        this.removeAbortButton();
        
        this.isActive = false;
        this.currentProcessType = null; // プロセスタイプをクリア
        
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
     * 中断ボタンを作成
     */
    private createAbortButton(): void {
        // 既存の中断ボタンがあれば削除
        const existingAbortButton = document.getElementById('ytomo-processing-abort-button');
        if (existingAbortButton) {
            existingAbortButton.remove();
        }
        
        // 中断ボタン作成
        const abortButton = document.createElement('button');
        abortButton.id = 'ytomo-processing-abort-button';
        abortButton.classList.add('ext-ytomo', 'ytomo-abort-button');
        abortButton.textContent = '中断';
        
        // インラインスタイル完全削除 - 全てSCSSで管理
        
        // クリックイベント
        abortButton.addEventListener('click', () => {
            this.handleAbortClick();
        });
        
        // bodyに追加
        document.body.appendChild(abortButton);
        
        console.log('🛑 処理中断ボタンを作成しました');
    }
    
    /**
     * 中断ボタンクリック処理
     */
    private handleAbortClick(): void {
        console.log('🛑 処理中断ボタンがクリックされました');
        
        // 処理タイプに応じて中断処理を実行
        if (this.currentProcessType === 'companion') {
            // 同行者処理の中断（確認なし）
            this.abortCompanionProcess();
            this.hide();
        } else if (this.currentProcessType === 'reservation') {
            // 予約処理の中断（確認ダイアログあり）
            this.showCustomConfirm('処理を中断しますか？', () => {
                this.abortReservationProcess();
                this.hide();
            });
        }
    }
    
    /**
     * 同行者処理の中断
     */
    private abortCompanionProcess(): void {
        console.log('🛑 同行者追加処理を中断中...');
        
        // companion-ticket-pageのプロセスマネージャーを停止
        try {
            // 適切なimportを使用するべきだが、現在はモジュール構造上の制約でwindow経由でアクセス
            // TODO: 将来的にはcompanion-ticket-pageから直接importするようにリファクタリングが必要
            const companionProcessManager = (window as any).companionProcessManager;
            if (companionProcessManager && typeof companionProcessManager.stopProcess === 'function') {
                companionProcessManager.stopProcess();
                console.log('✅ 同行者追加処理を正常に中断しました');
            } else {
                console.warn('⚠️ companionProcessManagerが見つかりません');
            }
        } catch (error) {
            console.error('❌ 同行者処理中断でエラー:', error);
        }
    }
    
    /**
     * 予約処理の中断
     */
    private abortReservationProcess(): void {
        console.log('🛑 予約処理を中断中...');
        
        // 既存の予約中断処理と連携
        try {
            const fabButton = document.getElementById('ytomo-main-fab');
            if (fabButton) {
                fabButton.click();
            }
        } catch (error) {
            console.error('❌ 予約処理中断でエラー:', error);
        }
    }
    
    /**
     * 中断ボタンを削除
     */
    private removeAbortButton(): void {
        const abortButton = document.getElementById('ytomo-processing-abort-button');
        if (abortButton) {
            abortButton.remove();
            console.log('🛑 処理中断ボタンを削除しました');
        }
    }
    
    /**
     * FABボタンをオーバーレイより前面に調整
     */
    private adjustFabButtonsForOverlay(): void {
        // 複数のFABコンテナIDを試行
        const fabContainerIds = [
            'ytomo-fab-container',
            'ytomo-ticket-selection-fab-container',
            'ytomo-pavilion-fab-container'
        ];
        
        fabContainerIds.forEach(id => {
            const fabContainer = document.getElementById(id);
            if (fabContainer) {
                fabContainer.className = fabContainer.className.replace(/z-\w+/g, '').trim() + ' z-above-overlay';
                console.log(`🛡️ FABコンテナ "${id}" をオーバーレイより前面に調整`);
            }
        });
    }
    
    /**
     * FABボタンを確実に表示・有効化
     */
    private ensureFabButtonsVisible(): void {
        // 複数のFABボタンIDを試行
        const fabButtonIds = [
            'ytomo-main-fab',
            'ytomo-ticket-selection-main-fab',
            'ytomo-pavilion-main-fab'
        ];
        
        let fabFound = false;
        fabButtonIds.forEach(id => {
            const fabButton = document.getElementById(id) as HTMLButtonElement;
            if (fabButton) {
                fabButton.disabled = false;
                fabButton.style.display = 'flex';
                fabButton.style.visibility = 'visible';
                fabButton.style.opacity = '1';
                fabFound = true;
                console.log(`🛡️ [システム連動] FABボタン "${id}" を中断可能状態に設定`);
            }
        });
        
        if (!fabFound) {
            console.warn('⚠️ 中断用FABボタンが見つかりません - 全画面検索実行');
            // フォールバック：全画面でFABボタンを検索
            const allFabs = document.querySelectorAll('[id*="fab"]') as NodeListOf<HTMLButtonElement>;
            allFabs.forEach(fab => {
                if (fab.id && (fab.id.includes('ytomo') || fab.id.includes('main'))) {
                    fab.disabled = false;
                    fab.style.display = 'flex';
                    fab.style.visibility = 'visible';
                    fab.style.opacity = '1';
                    console.log(`🛡️ [フォールバック] FABボタン "${fab.id}" を発見・有効化`);
                }
            });
        }
    }
    
    /**
     * FABボタンのz-indexを元に戻す
     */
    private restoreFabButtonsFromOverlay(): void {
        const fabContainerIds = [
            'ytomo-fab-container',
            'ytomo-ticket-selection-fab-container',
            'ytomo-pavilion-fab-container'
        ];
        
        fabContainerIds.forEach(id => {
            const fabContainer = document.getElementById(id);
            if (fabContainer) {
                fabContainer.className = fabContainer.className.replace(/z-\w+/g, '').trim() + ' z-normal';
            }
        });
    }
    
    /**
     * カスタム確認ダイアログ
     */
    private showCustomConfirm(message: string, onConfirm: () => void): void {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.5) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 100010 !important;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white !important;
            border-radius: 8px !important;
            padding: 24px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            max-width: 400px !important;
            text-align: center !important;
        `;

        dialog.innerHTML = `
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #333;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="custom-confirm-cancel" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    キャンセル
                </button>
                <button id="custom-confirm-ok" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    中断する
                </button>
            </div>
        `;

        const cancelBtn = dialog.querySelector('#custom-confirm-cancel') as HTMLButtonElement;
        const okBtn = dialog.querySelector('#custom-confirm-ok') as HTMLButtonElement;

        const closeDialog = () => {
            document.body.removeChild(overlay);
        };

        cancelBtn.addEventListener('click', closeDialog);
        okBtn.addEventListener('click', () => {
            closeDialog();
            onConfirm();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDialog();
            }
        });

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }
    
    /**
     * 通知音トグルボタンのクリック処理
     */
    private handleNotificationToggle(): void {
        const isEnabled = entranceReservationStateManager.toggleNotificationSound();
        console.log(`🔊 通知音設定変更: ${isEnabled ? '有効' : '無効'}`);
        
        // ボタンの表示を更新
        const toggleButton = document.getElementById('ytomo-notification-toggle');
        if (toggleButton) {
            this.updateNotificationToggleButton(toggleButton);
        }
    }
    
    
    /**
     * 通知音トグルボタンを動的に追加
     */
    private addNotificationToggleButton(): void {
        if (!this.overlayElement) return;
        
        const messageArea = this.overlayElement.querySelector('.processing-message-area');
        if (!messageArea) return;
        
        console.log('🔊 通知音トグルボタンを動的に追加中...');
        
        const notificationToggle = document.createElement('button');
        notificationToggle.id = 'ytomo-notification-toggle';
        notificationToggle.className = 'notification-toggle-btn';
        
        // MDIアイコンとトグル状態を設定
        this.updateNotificationToggleButton(notificationToggle);
        
        // トグルボタンのクリックイベント
        notificationToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleNotificationToggle();
        });
        
        // warningTextの後、cancelAreaの前に挿入
        const warningText = messageArea.querySelector('.processing-warning-text');
        const cancelArea = messageArea.querySelector('.processing-cancel-area');
        
        if (warningText && cancelArea) {
            messageArea.insertBefore(notificationToggle, cancelArea);
            console.log('✅ 通知音トグルボタンを動的に追加完了');
        } else {
            console.warn('⚠️ 挿入位置要素が見つかりません');
        }
    }
    
    /**
     * 通知音トグルボタンの表示を更新
     */
    private updateNotificationToggleButton(button: HTMLElement): void {
        const isEnabled = entranceReservationStateManager.isNotificationSoundEnabled();
        
        // シンプルなテキストアイコンを設定
        if (isEnabled) {
            button.innerHTML = '🔊';
            button.title = '通知音有効（クリックで無効化）';
            button.classList.remove('muted');
            button.classList.add('enabled');
        } else {
            button.innerHTML = '🔇';
            button.title = '通知音無効（クリックで有効化）';
            button.classList.remove('enabled');
            button.classList.add('muted');
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