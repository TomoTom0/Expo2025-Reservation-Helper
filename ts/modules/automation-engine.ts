/**
 * 自動操作エンジン
 * 万博予約ページでの自動化処理を統括管理
 */

import { getPageDetector, PageInfo } from './page-detector';
import { getDOMUtils } from './dom-utils';
import { loggers } from '../utils/logger';

// test-exports用にexport
export { getPageDetector } from './page-detector';
export { getDOMUtils } from './dom-utils';
import { PavilionReservationCache } from './pavilion-reservation-cache';
import { ReservationCacheData } from './reservation-data';
import { getAutomationOverlay } from './automation-overlay';

// 自動操作の状態
export type AutomationStatus = 
    | 'idle'           // 待機中
    | 'running'        // 実行中
    | 'paused'         // 一時停止
    | 'completed'      // 完了
    | 'failed'         // 失敗
    | 'cancelled';     // キャンセル

// 自動操作の結果
export interface AutomationResult {
    status: AutomationStatus;
    processedCount: number;
    successCount: number;
    failedCount: number;
    errors: string[];
    executionTime: number;
}

// 自動操作の設定
export interface AutomationConfig {
    maxRetries: number;
    stepDelay: number;
    pageTimeout: number;
    continueOnError: boolean;
    enableLogging: boolean;
}

// デフォルト設定
const DEFAULT_CONFIG: AutomationConfig = {
    maxRetries: 3,
    stepDelay: 1000,
    pageTimeout: 15000,
    continueOnError: true,
    enableLogging: true
};

export class AutomationEngine {
    private status: AutomationStatus = 'idle';
    private config: AutomationConfig;
    private pageDetector = getPageDetector();
    private domUtils = getDOMUtils();
    private overlay = getAutomationOverlay();
    private startTime: number = 0;
    private processedCount: number = 0;
    private successCount: number = 0;
    private failedCount: number = 0;
    private errors: string[] = [];
    private currentReservation: ReservationCacheData | null = null;
    private logger = loggers.automation;

    constructor(config: Partial<AutomationConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        
        // オーバーレイイベントハンドラーを設定
        this.overlay.setEventHandler((type) => {
            switch (type) {
                case 'cancel':
                    this.stop();
                    break;
                case 'retry':
                    this.start();
                    break;
                case 'close':
                    this.overlay.hide();
                    break;
            }
        });
    }

    /**
     * 自動操作を開始
     */
    async start(): Promise<AutomationResult> {
        if (this.status === 'running') {
            throw new Error('自動操作は既に実行中です');
        }

        this.log('🚀 自動操作エンジン開始');
        this.resetCounters();
        this.status = 'running';
        this.startTime = Date.now();

        // オーバーレイを表示
        this.overlay.show('自動操作を開始しています...');
        this.updateOverlayProgress(10, 'ページ情報を解析中...');

        try {
            // リダイレクト異常検知
            await this.checkRedirectAbnormality();
            
            // ページタイプを判定
            const pageInfo = this.pageDetector.extractPageInfo();
            this.log(`📍 現在のページ: ${pageInfo.type}`);

            this.updateOverlayProgress(20, `${pageInfo.type} ページを検知`);

            switch (pageInfo.type) {
                case 'reservation_time':
                    await this.handleReservationPage(pageInfo);
                    break;
                    
                case 'confirmation':
                    await this.handleConfirmationPage(pageInfo);
                    break;
                    
                case 'pavilion_search':
                    this.log('⚠️ パビリオン検索ページでは自動操作は不要です');
                    this.updateOverlayProgress(100, 'パビリオン検索ページでは自動操作不要');
                    break;
                    
                default:
                    throw new Error(`未対応のページタイプ: ${pageInfo.type}`);
            }

            this.status = 'completed';
            this.log('✅ 自動操作完了');
            this.updateOverlayProgress(100, '自動操作が正常に完了しました');
            
            // 成功通知をグローバル表示
            this.showGlobalNotification('success', '予約処理が正常に完了しました');

        } catch (error) {
            this.status = 'failed';
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.errors.push(errorMessage);
            this.log(`❌ 自動操作失敗: ${errorMessage}`);
            this.overlay.showError(errorMessage, true);
            
            // 失敗通知をグローバル表示
            if (errorMessage.includes('タイムアウト')) {
                this.showGlobalNotification('error', 'ページ準備がタイムアウトしました。サイトが混雑している可能性があります。');
            } else if (errorMessage.includes('選択に失敗')) {
                this.showGlobalNotification('error', '指定された時間帯の選択に失敗しました。時間帯が変更された可能性があります。');
            } else if (errorMessage.includes('異常リダイレクト')) {
                this.showGlobalNotification('error', `予約処理失敗: ${errorMessage}`);
                // 異常リダイレクトの場合は即座にオーバーレイを非表示
                this.overlay.hide();
                this.log('🚀 異常リダイレクト検知: オーバーレイを即座に非表示');
            } else {
                this.showGlobalNotification('error', `予約処理失敗: ${errorMessage}`);
            }
        }

        const result = this.getResult();
        
        // 成功時はオーバーレイに結果を表示、失敗時は既に表示済み
        if (this.status === 'completed') {
            this.overlay.showResult(result);
        }
        
        // オーバーレイを即座に非表示（異常リダイレクトの場合は既に非表示済み）
        if (!this.errors.some(error => error.includes('異常リダイレクト'))) {
            this.overlay.hide();
            this.log('🚀 処理完了: オーバーレイを即座に非表示');
        }

        // 自動予約処理完了時にリダイレクト判定フラグをクリア
        sessionStorage.removeItem('expo_redirect_validated');
        this.log('🧹 リダイレクト判定完了フラグをクリア');

        return result;
    }

    /**
     * 予約時間選択ページの処理
     */
    private async handleReservationPage(pageInfo: PageInfo): Promise<void> {
        this.log('🎯 予約ページ処理開始');

        // パビリオンコードが取得できない場合はエラー
        if (!pageInfo.pavilionCode) {
            throw new Error('パビリオンコードが取得できません');
        }

        // キャッシュからこのパビリオンの予約データを取得
        const reservationData = await this.findMatchingReservation(pageInfo.pavilionCode);
        
        if (!reservationData) {
            throw new Error(`パビリオン ${pageInfo.pavilionCode} の予約データが見つかりません`);
        }

        this.currentReservation = reservationData;
        this.log(`📋 予約データ発見: ${reservationData.pavilionName} - ${reservationData.selectedTimeDisplay}`);
        this.updateOverlayProgress(25, `予約データ発見: ${reservationData.pavilionName}`);

        // ページの準備完了を待機
        await this.waitForPageReady();

        // 時間選択を実行
        await this.executeTimeSelection(reservationData);

        // 申込ボタンをクリック
        await this.executeSubmission();

        // 状態を更新
        PavilionReservationCache.updateReservationStatus(
            reservationData.pavilionCode,
            reservationData.selectedTimeSlot,
            'processing'
        );

        this.processedCount++;
        this.successCount++;
    }

    /**
     * 確認ページの処理
     */
    private async handleConfirmationPage(_pageInfo: PageInfo): Promise<void> {
        this.log('📋 確認ページ処理開始');

        // 現在処理中の予約データを取得
        const processingReservation = PavilionReservationCache.getProcessingReservation();
        
        if (!processingReservation) {
            this.log('⚠️ 処理中の予約データがありません。手動操作の可能性があります。');
            return;
        }

        this.currentReservation = processingReservation;
        this.log(`📋 処理中の予約: ${processingReservation.pavilionName} - ${processingReservation.selectedTimeDisplay}`);
        this.updateOverlayProgress(25, `処理中の予約: ${processingReservation.pavilionName}`);

        // 確認ページの準備完了を待機
        await this.waitForPageReady();

        // 最終確認ボタンクリック
        await this.executeConfirmation();

        // 状態を完了に更新
        PavilionReservationCache.updateReservationStatus(
            processingReservation.pavilionCode,
            processingReservation.selectedTimeSlot,
            'completed'
        );

        this.processedCount++;
        this.successCount++;
        
        // 成功通知をグローバル表示
        this.showGlobalNotification('success', `予約完了: ${processingReservation.pavilionName} ${processingReservation.selectedTimeDisplay}～`);
    }

    /**
     * マッチする予約データを検索
     */
    private async findMatchingReservation(pavilionCode: string): Promise<ReservationCacheData | null> {
        // 該当パビリオンのpending状態の予約データを取得
        const pavilionReservations = PavilionReservationCache.getReservationDataByPavilion(pavilionCode);
        const pendingReservations = pavilionReservations.filter(data => data.status === 'pending');

        if (pendingReservations.length === 0) {
            return null;
        }

        // 複数ある場合は最初の1つを選択
        // TODO: 将来的にはユーザー選択や優先度設定を実装
        return pendingReservations[0];
    }

    /**
     * ページ準備完了まで待機
     */
    private async waitForPageReady(): Promise<void> {
        this.log('⏳ ページ準備完了を待機中...');
        this.updateOverlayProgress(30, 'ページ準備完了を待機中...');
        
        const isReady = await this.pageDetector.waitForPageReady(this.config.pageTimeout);
        
        if (!isReady) {
            throw new Error(`ページ準備がタイムアウトしました (${this.config.pageTimeout}ms)`);
        }

        this.log('✅ ページ準備完了');
        this.updateOverlayProgress(40, 'ページ準備完了');
    }

    /**
     * 時間選択を実行
     */
    private async executeTimeSelection(reservationData: ReservationCacheData): Promise<void> {
        this.log(`⏰ 時間選択実行: ${reservationData.selectedTimeDisplay}`);
        this.updateOverlayProgress(50, `時間選択中: ${reservationData.selectedTimeDisplay}`);

        const result = await this.domUtils.selectTimeSlot(reservationData.selectedTimeSlot);

        if (!result.success) {
            // 利用可能な時間オプションをログ出力
            if (result.availableOptions) {
                this.log(`📋 利用可能な時間: ${result.availableOptions.join(', ')}`);
            }
            throw new Error(result.error || '時間選択に失敗しました');
        }

        this.log(`✅ 時間選択完了: ${result.selectedTime}`);
        this.updateOverlayProgress(70, `時間選択完了: ${result.selectedTime}`);
        
        // 少し待機
        await this.delay(this.config.stepDelay);
    }

    /**
     * 申込ボタンクリック実行
     */
    private async executeSubmission(): Promise<void> {
        this.log('🔘 申込ボタンクリック実行');
        this.updateOverlayProgress(80, '申込ボタンをクリック中...');

        const result = await this.domUtils.clickSubmitButton();

        if (!result.success) {
            throw new Error(result.error || '申込ボタンクリックに失敗しました');
        }

        this.log('✅ 申込ボタンクリック完了');
        this.updateOverlayProgress(90, '申込ボタンクリック完了');

        // ページ遷移を待機
        await this.waitForPageTransition();
    }

    /**
     * 確認ボタンクリック実行
     */
    private async executeConfirmation(): Promise<void> {
        this.log('📋 最終確認ボタンクリック実行');
        this.updateOverlayProgress(95, '最終確認ボタンをクリック中...');

        // 確認ボタンを検索してクリック
        const confirmResult = await this.domUtils.waitForElement('.confirm-button, .final-submit', this.config.pageTimeout);
        
        if (!confirmResult.success || !confirmResult.element) {
            throw new Error('確認ボタンが見つかりません');
        }

        (confirmResult.element as HTMLButtonElement).click();
        this.log('✅ 最終確認ボタンクリック完了');
        this.updateOverlayProgress(100, '予約処理完了');

        // 完了ページへの遷移を待機
        await this.delay(this.config.stepDelay * 2);
    }

    /**
     * ページ遷移を待機
     */
    private async waitForPageTransition(): Promise<void> {
        this.log('🔄 ページ遷移を待機中...');
        this.updateOverlayProgress(95, 'ページ遷移を待機中...');

        // URLまたはタイトルの変更を待機
        const urlChanged = await this.domUtils.waitForUrlChange(/confirm|complete/, this.config.pageTimeout);
        
        if (!urlChanged) {
            // エラーメッセージをチェック
            const errors = this.domUtils.checkForErrorMessages();
            if (errors.length > 0) {
                throw new Error(`予約エラー: ${errors.join(', ')}`);
            }
            
            this.log('⚠️ ページ遷移が検知されませんでしたが、処理を継続します');
        } else {
            this.log('✅ ページ遷移完了');
        }
    }

    /**
     * 自動操作を停止
     */
    stop(): void {
        if (this.status === 'running') {
            this.status = 'cancelled';
            this.log('🛑 自動操作をキャンセルしました');
        }
    }

    /**
     * 現在の状態を取得
     */
    getStatus(): AutomationStatus {
        return this.status;
    }

    /**
     * 実行結果を取得
     */
    getResult(): AutomationResult {
        const executionTime = this.startTime ? Date.now() - this.startTime : 0;
        
        return {
            status: this.status,
            processedCount: this.processedCount,
            successCount: this.successCount,
            failedCount: this.failedCount,
            errors: [...this.errors],
            executionTime
        };
    }

    /**
     * カウンターをリセット
     */
    private resetCounters(): void {
        this.processedCount = 0;
        this.successCount = 0;
        this.failedCount = 0;
        this.errors = [];
        this.currentReservation = null;
    }

    /**
     * 指定時間待機
     */
    private async delay(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * オーバーレイの進行状況を更新
     */
    private updateOverlayProgress(progress: number, message: string): void {
        this.overlay.updateProgress(progress);
        this.overlay.updateMessage(message);
    }

    /**
     * ログ出力
     */
    private log(message: string): void {
        if (this.config.enableLogging) {
            this.logger.info(message);
        }
    }

    /**
     * デバッグ情報を出力
     */
    debugInfo(): void {
        this.logger.debug('自動操作エンジンデバッグ情報', {
            status: this.status,
            config: this.config,
            result: this.getResult(),
            currentReservation: this.currentReservation,
            pageInfo: this.pageDetector.extractPageInfo(),
            domInfo: this.domUtils.getPageDebugInfo()
        });
    }


    /**
     * グローバル通知を表示
     */
    private showGlobalNotification(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
        try {
            // グローバル通知システムを使用
            if (typeof (window as any).showReservationNotification === 'function') {
                (window as any).showReservationNotification(type, message, false); // 自動非表示しない
                this.log(`📢 グローバル通知表示: [${type}] ${message}`);
            } else {
                this.log('⚠️ グローバル通知システムが利用できません');
                // フォールバック: sessionStorageに保存
                const notificationData = {
                    type,
                    message,
                    timestamp: Date.now()
                };
                sessionStorage.setItem('expo_reservation_result', JSON.stringify(notificationData));
            }
        } catch (error) {
            this.log(`❌ グローバル通知エラー: ${error}`);
        }
    }

    /**
     * リダイレクト異常検知（500ms間隔x4回で安定化を確認）
     */
    private async checkRedirectAbnormality(): Promise<void> {
        // 既にリダイレクト判定済みかチェック
        const isValidated = sessionStorage.getItem('expo_redirect_validated');
        if (isValidated === 'true') {
            this.log('✅ リダイレクト判定済みのためスキップ');
            return;
        }

        // 最新の予約データを取得（pending/processing状態を統一的に扱う）
        const reservationData = this.findLatestReservationData();

        if (!reservationData) {
            this.log('⚠️ 予約データが見つからないため、リダイレクト検知をスキップ');
            return;
        }

        // 期待タイトルを予約データから生成
        const expectedTitle = `${reservationData.pavilionName} ${reservationData.selectedTimeDisplay}～`;
        
        this.log('🔍 リダイレクト安定化チェック開始（500ms間隔、最大30回、4回連続安定まで）');
        
        // 500ms間隔で最大30回チェックして4回連続の安定化を確認
        let previousTitle = '';
        let previousUrl = '';
        let consecutiveStableCount = 0;
        let totalChecks = 0;
        const maxChecks = 30;
        
        while (consecutiveStableCount < 4 && totalChecks < maxChecks) {
            await this.delay(500);
            totalChecks++;
            
            const currentTitle = document.title;
            const currentUrl = window.location.href;
            
            this.log(`🔍 チェック${totalChecks}/${maxChecks}: タイトル="${currentTitle}", URL="${currentUrl}"`);
            
            if (totalChecks > 1 && currentTitle === previousTitle && currentUrl === previousUrl) {
                consecutiveStableCount++;
                this.log(`✅ 安定継続: ${consecutiveStableCount}/4回`);
            } else if (totalChecks > 1) {
                consecutiveStableCount = 0; // 変化があったらリセット
                this.log(`🔄 変化検出: 安定カウントをリセット`);
            }
            
            previousTitle = currentTitle;
            previousUrl = currentUrl;
        }
        
        this.log(`🔍 安定化チェック完了: 連続安定回数=${consecutiveStableCount}/4, 総チェック回数=${totalChecks}/${maxChecks}`);
        
        // 最終的なタイトル比較
        const finalTitle = document.title;
        this.log(`🔍 最終タイトル検証: 期待="${expectedTitle}", 実際="${finalTitle}"`);

        if (finalTitle !== expectedTitle && consecutiveStableCount >= 4) {
            this.log('❌ リダイレクト異常を検知: タイトルが一致せず、ページが安定している');
            
            // 予約データを失敗状態に更新
            const { PavilionReservationCache } = await import('./pavilion-reservation-cache');
            PavilionReservationCache.updateReservationStatus(
                reservationData.pavilionCode,
                reservationData.selectedTimeSlot,
                'failed'
            );
            
            // 異常リダイレクト通知をポップアップ表示
            this.showGlobalNotification('warning', `異常リダイレクト検知: ${reservationData.pavilionName} ${reservationData.selectedTimeDisplay}～`);
            
            // 処理を中断
            throw new Error('異常リダイレクトを検知しました');
        }

        this.log('✅ リダイレクト検証OK: 正常なページです');
        
        // リダイレクト判定完了をsessionStorageに保存
        sessionStorage.setItem('expo_redirect_validated', 'true');
        this.log('💾 リダイレクト判定完了フラグを保存');
    }

    /**
     * 最新の予約データを取得（pending/processing状態を統一的に扱う）
     */
    private findLatestReservationData(): ReservationCacheData | null {
        // 1. まずprocessing状態を確認（処理中の予約が最優先）
        const processingReservation = PavilionReservationCache.getProcessingReservation();
        if (processingReservation) {
            this.log(`📋 処理中の予約データを使用: ${processingReservation.pavilionName}`);
            return processingReservation;
        }

        // 2. processing状態がない場合は、pending状態から最新のものを取得
        const allData = PavilionReservationCache.getAllReservationData();
        const activeData = Object.values(allData)
            .filter(data => data.status === 'pending' || data.status === 'processing')
            .sort((a, b) => b.timestamp - a.timestamp); // 最新順

        if (activeData.length > 0) {
            this.log(`📋 最新の予約データを使用: ${activeData[0].pavilionName} (${activeData[0].status})`);
            return activeData[0];
        }

        return null;
    }


}

// グローバルインスタンス
let automationEngineInstance: AutomationEngine | null = null;

/**
 * 自動操作エンジンのインスタンスを取得
 */
export function getAutomationEngine(config?: Partial<AutomationConfig>): AutomationEngine {
    if (!automationEngineInstance || config) {
        automationEngineInstance = new AutomationEngine(config);
    }
    return automationEngineInstance;
}

/**
 * 自動操作を開始（ショートカット関数）
 */
export async function startAutomation(config?: Partial<AutomationConfig>): Promise<AutomationResult> {
    const engine = getAutomationEngine(config);
    return await engine.start();
}

/**
 * 自動操作を停止（ショートカット関数）
 */
export function stopAutomation(): void {
    if (automationEngineInstance) {
        automationEngineInstance.stop();
    }
}