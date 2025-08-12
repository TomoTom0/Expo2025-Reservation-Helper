/**
 * 自動処理中の誤動作防止オーバーレイシステム
 * 
 * 予約実行中・監視中に画面全体を薄いオーバーレイで覆い、
 * 中断ボタン以外の操作を防ぐことで誤動作を防止
 */

import { entranceReservationStateManager } from './entrance-reservation-state-manager';

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
        
        const warningText = document.createElement('div');
        warningText.className = 'processing-warning-text';
        warningText.textContent = '誤動作防止';
        
        const cancelArea = document.createElement('div');
        cancelArea.className = 'processing-cancel-area';
        cancelArea.innerHTML = '右下のボタンで中断';
        
        messageArea.appendChild(messageText);
        messageArea.appendChild(targetText);
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
        const targetText = this.overlayElement.querySelector('.processing-target-text');
        
        if (processType === 'monitoring') {
            // キャッシュから監視対象情報を取得（実行中の変動を避ける）
            let targetInfo = '対象なし';
            
            try {
                // キャッシュから直接読み込み
                const generateKey = (suffix: string = '') => {
                    const url = new URL(window.location.href);
                    const baseKey = `expo2025_entrance_${url.searchParams.get('reserve_id') || 'default'}`;
                    return suffix ? `${baseKey}_${suffix}` : baseKey;
                };
                
                const cachedData = localStorage.getItem(generateKey('target_slots'));
                console.log('🔍 [中央オーバーレイ] キャッシュデータ:', cachedData);
                
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    if (parsed.targets && parsed.targets.length > 0) {
                        // 日付情報を追加
                        const dateInfo = parsed.selectedDate || '';
                        const dateDisplay = dateInfo ? dateInfo.split('-').slice(1).join('/') : '';
                        
                        const targets = parsed.targets.map((t: any) => {
                            const location = t.locationIndex === 0 ? '東' : '西';
                            return `${location}${t.timeSlot}`;
                        }).join(', ');
                        
                        targetInfo = `${dateDisplay}\n${targets}`;
                        console.log('🔍 [中央オーバーレイ] キャッシュから対象情報取得:', targetInfo);
                    }
                } else {
                    // フォールバック: entranceReservationStateManagerから取得
                    if (entranceReservationStateManager) {
                        const monitoringTargets = entranceReservationStateManager.getMonitoringTargets() || [];
                        console.log('🔍 [中央オーバーレイ] フォールバック監視対象:', monitoringTargets);
                        if (monitoringTargets.length > 0) {
                            targetInfo = monitoringTargets.map((t: any) => {
                                const location = t.locationIndex === 0 ? '東' : '西';
                                return `${location}${t.timeSlot}`;
                            }).join(', ');
                        }
                    }
                }
            } catch (error) {
                console.error('🔍 [中央オーバーレイ] キャッシュ読み込みエラー:', error);
                targetInfo = '対象情報取得エラー';
            }
            
            // ログ削減: 最終テキストログを削除
            if (messageText) messageText.textContent = '監視実行中...';
            if (targetText) targetText.textContent = targetInfo;
        } else {
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

// 早期初期化関数（リロード直後の誤操作防止）
export function checkAndShowEarlyOverlay(): void {
    try {
        // 監視フラグをチェック
        const flagData = localStorage.getItem('expo2025_monitoring_flag');
        if (!flagData) return;
        
        const parsed = JSON.parse(flagData);
        if (!parsed.isMonitoring) return;
        
        // フラグの有効期限チェック（10分以内）
        const elapsed = Date.now() - parsed.timestamp;
        if (elapsed > 10 * 60 * 1000) {
            localStorage.removeItem('expo2025_monitoring_flag');
            return;
        }
        
        console.log('🚨 リロード直後: 監視継続フラグを検出、即座にオーバーレイ表示');
        
        // 早期オーバーレイを表示
        const overlay = new ProcessingOverlay();
        overlay.show('monitoring');
        
        // 【システム連動】早期オーバーレイでもFABボタンを有効化
        setTimeout(() => {
            const mainFabButton = document.getElementById('ytomo-main-fab') as HTMLButtonElement;
            if (mainFabButton) {
                mainFabButton.disabled = false;
                console.log('🚨 [早期システム連動] 中断ボタンを強制有効化');
            }
        }, 100);
        
        // 一定時間後に通常の初期化で引き継がれるまで維持
        setTimeout(() => {
            // 通常の初期化が完了していない場合のみ非表示
            if (!document.getElementById('ytomo-fab-container')) {
                console.log('🚨 早期オーバーレイ: 通常初期化が遅れているため維持継続');
            }
        }, 3000);
        
    } catch (error) {
        console.error('🚨 早期オーバーレイ表示エラー:', error);
    }
}

// グローバルインスタンス
export const processingOverlay = new ProcessingOverlay();